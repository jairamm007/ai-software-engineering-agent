import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Braces,
  Check,
  ClipboardCheck,
  Code2,
  FileCode2,
  FileText,
  History,
  Layers3,
  LoaderCircle,
  MessageSquareText,
  PanelLeft,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  TestTube2,
  WandSparkles,
  X,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Copy,
  CheckCircle2,
  XCircle,
  Edit3,
  Keyboard,
  Sidebar,
  ChevronsLeft,
  ChevronsRight,
  Bot,
  SquareCode,
  BookOpen,
  GitBranch,
  Lightbulb,
  ScanSearch,
  WrapText,
  Columns2,
  Maximize2,
  Minimize2,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import CodeBlock from "@/components/ui/CodeBlock";
import { useTheme } from "@/context/ThemeContext";
import { getRepositories } from "@/services/repository";
import {
  createSavedPrompt,
  applyGeneratedCode,
  deleteSavedPrompt,
  explainCode,
  generateCode,
  generateDocumentation,
  generateTests,
  getSavedPrompts,
  getGenerationHistory,
  recordHistoryAction,
  refactorCode,
  translateCode,
} from "@/services/code-generation";
import type { CodeGeneration, CodeGenerationType, GeneratorTab, SavedPrompt } from "@/types/code-generation";

type GeneratorConfig = {
  label: string;
  description: string;
  icon: typeof Sparkles;
  placeholder: string;
  needsCode?: boolean;
  needsLanguage?: boolean;
  accent?: string;
  group: "create" | "improve" | "advanced";
};

const generators: Record<GeneratorTab, GeneratorConfig> = {
  generate: { label: "Generate Code", description: "Create production-ready code from a natural language request.", icon: Sparkles, placeholder: "Generate JWT authentication with refresh tokens for an Express and Prisma API.", accent: "from-violet-500 to-purple-500", group: "create" },
  function: { label: "Generate Function", description: "Build a focused function with clear inputs and edge-case handling.", icon: Braces, placeholder: "Create calculateSalary(baseSalary, bonus, deductions) in TypeScript.", accent: "from-blue-500 to-cyan-500", group: "create" },
  class: { label: "Generate Class", description: "Generate a class, interface, repository, service, or controller.", icon: Layers3, placeholder: "Create a User repository class with Prisma CRUD methods.", accent: "from-emerald-500 to-teal-500", group: "create" },
  crud: { label: "CRUD Generator", description: "Generate models, validation, service, controller, and routes for an entity.", icon: ClipboardCheck, placeholder: "Create Employee CRUD. Fields: name, email, salary. Use Express and Prisma.", accent: "from-orange-500 to-amber-500", group: "create" },
  api: { label: "API Generator", description: "Turn an API requirement into routes, validation, handlers, and response models.", icon: Send, placeholder: "Create an API that returns all active users with pagination.", accent: "from-pink-500 to-rose-500", group: "create" },
  ui: { label: "UI Generator", description: "Create responsive React components using the repository's UI conventions.", icon: PanelLeft, placeholder: "Create a responsive dashboard card for repository health metrics.", accent: "from-indigo-500 to-blue-500", group: "create" },
  refactor: { label: "Refactor Code", description: "Improve structure, readability, and maintainability without changing behavior.", icon: WandSparkles, placeholder: "Refactor this code using SOLID principles and remove duplication.", needsCode: true, accent: "from-yellow-500 to-orange-500", group: "improve" },
  explain: { label: "Explain Code", description: "Understand logic, complexity, patterns, and improvement opportunities.", icon: MessageSquareText, placeholder: "Explain this code, including time complexity and potential issues.", needsCode: true, accent: "from-cyan-500 to-blue-500", group: "improve" },
  translate: { label: "Translate Code", description: "Convert code between languages while preserving behavior.", icon: FileCode2, placeholder: "Translate this code and keep the same public API.", needsCode: true, needsLanguage: true, accent: "from-teal-500 to-emerald-500", group: "improve" },
  tests: { label: "Generate Tests", description: "Create focused unit and integration tests with edge cases.", icon: TestTube2, placeholder: "Generate comprehensive unit tests for this module.", needsCode: true, accent: "from-red-500 to-pink-500", group: "advanced" },
  docs: { label: "Generate Docs", description: "Create clear TSDoc/JSDoc, usage notes, and API documentation.", icon: FileText, placeholder: "Generate complete documentation and usage examples for this module.", needsCode: true, accent: "from-slate-500 to-gray-500", group: "advanced" },
  completion: { label: "Code Completion", description: "Get a concise, repository-aware inline completion at your cursor.", icon: Code2, placeholder: "Paste code up to the cursor. The AI returns only what belongs after it.", needsCode: true, accent: "from-purple-500 to-violet-500", group: "advanced" },
  prompts: { label: "Prompt Library", description: "Use a saved or ready-made prompt to start a generation.", icon: Save, placeholder: "", group: "advanced", accent: "" },
  history: { label: "Generation History", description: "Review previous generations and their status.", icon: History, placeholder: "", group: "advanced", accent: "" },
};

const promptLibrary = [
  { title: "JWT Authentication", prompt: "Generate a secure JWT authentication API with register, login, refresh token, password hashing, validation, and error handling.", icon: "🔐", category: "authentication" },
  { title: "Prisma CRUD", prompt: "Create complete CRUD for Product with name, description, price, and stock using Express, TypeScript, Prisma, validation, service, controller, and routes.", icon: "📦", category: "crud" },
  { title: "React Component", prompt: "Create a responsive, accessible React TypeScript component following the repository's existing Tailwind styling conventions.", icon: "⚛️", category: "react" },
  { title: "Refactor for SOLID", prompt: "Refactor this code using SOLID principles, improve naming, reduce duplication, and preserve all existing behavior.", icon: "♻️", category: "refactoring" },
  { title: "REST API Endpoint", prompt: "Create a REST API endpoint with validation, error handling, pagination, and proper HTTP status codes.", icon: "🌐", category: "api" },
  { title: "Database Schema", prompt: "Generate a Prisma schema with proper relations, indexes, and constraints for a multi-tenant SaaS application.", icon: "🗄️", category: "database" },
];

type PreviewView = "split" | "generated" | "raw";

const sidebarGroups = [
  { id: "create", label: "Create", items: ["generate", "function", "class", "crud", "api", "ui"] as GeneratorTab[] },
  { id: "improve", label: "Improve", items: ["refactor", "explain", "translate"] as GeneratorTab[] },
  { id: "advanced", label: "Advanced", items: ["tests", "docs", "completion"] as GeneratorTab[] },
];

function getOutputLanguage(tab: GeneratorTab, targetLanguage: string) {
  if (tab === "translate") return targetLanguage.toLowerCase();
  if (["docs", "explain"].includes(tab)) return "markdown";
  return "typescript";
}

function getStatusIcon(status: string) {
  if (status === "completed" || status === "accepted") return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status === "failed" || status === "rejected") return <XCircle size={14} className="text-red-500" />;
  if (status === "generating") return <LoaderCircle size={14} className="animate-spin text-blue-500" />;
  return <Clock size={14} className="text-amber-500" />;
}

function getStatusColor(status: string) {
  if (status === "completed" || status === "accepted") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "failed" || status === "rejected") return "bg-red-500/10 text-red-500 border-red-500/20";
  if (status === "generating") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

export default function CodeGenerationPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<GeneratorTab>("generate");
  const [prompt, setPrompt] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [repositoryId, setRepositoryId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [inputLanguage, setInputLanguage] = useState("TypeScript");
  const [targetLanguage, setTargetLanguage] = useState("TypeScript");
  const [generation, setGeneration] = useState<CodeGeneration | null>(null);
  const [preview, setPreview] = useState("");
  const [previewView, setPreviewView] = useState<PreviewView>("split");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const config = generators[tab];
  const { data: repositories } = useQuery({ queryKey: ["repositories"], queryFn: () => getRepositories() });
  const { data: savedPrompts, refetch: refetchPrompts } = useQuery({ queryKey: ["code-generation-prompts"], queryFn: getSavedPrompts });
  const { data: generationHistory, refetch: refetchHistory } = useQuery({ queryKey: ["code-generation-history"], queryFn: () => getGenerationHistory({ limit: 20 }) });

  const allPrompts = useMemo<Array<{ title: string; prompt: string; id?: string; icon?: string; category?: string }>>(
    () => [...promptLibrary, ...((savedPrompts ?? []) as SavedPrompt[])],
    [savedPrompts]
  );

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [tab]);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const inputClass = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 font-[Inter] ${
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
  }`;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void runGeneration();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, prompt, inputCode, repositoryId, filePath, inputLanguage, targetLanguage]
  );

  const applyPrompt = (value: string) => {
    setTab("generate");
    setPrompt(value);
  };

  const runGeneration = async () => {
    if (tab === "prompts" || tab === "history") return;
    if (!prompt.trim() && !inputCode.trim()) {
      toast.error("Add a request or paste code to continue.");
      return;
    }

    setIsGenerating(true);
    setGeneration(null);
    setPreview("");
    setIsEditing(false);

    const context = { repositoryId: repositoryId || undefined, filePath: filePath || undefined };
    try {
      let result: CodeGeneration;
      if (tab === "refactor") result = await refactorCode({ ...context, prompt: prompt || undefined, inputCode: inputCode || undefined });
      else if (tab === "explain") result = await explainCode({ ...context, prompt: prompt || undefined, inputCode: inputCode || undefined });
      else if (tab === "translate") result = await translateCode({ ...context, prompt: prompt || undefined, inputCode, inputLanguage, targetLanguage });
      else if (tab === "tests") result = await generateTests({ ...context, prompt: prompt || undefined, inputCode: inputCode || undefined });
      else if (tab === "docs") result = await generateDocumentation({ ...context, prompt: prompt || undefined, inputCode: inputCode || undefined });
      else if (tab === "completion") result = await generateCode({ ...context, type: "completion", prompt: inputCode, inputCode: inputCode || undefined });
      else result = await generateCode({ ...context, type: tab as CodeGenerationType, prompt: prompt || inputCode, inputCode: inputCode || undefined, inputLanguage });

      setGeneration(result);
      setPreview(result.generatedCode);
      toast.success("Generation complete");
      void refetchHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyToFile = async () => {
    if (!generation || !repositoryId || !filePath.trim()) {
      toast.error("Select a repository and enter a target file path before applying.");
      return;
    }
    try {
      const applied = await applyGeneratedCode({ generationId: generation.id, repositoryId, filePath, code: preview });
      toast.success(`Applied to ${applied.filePath}`);
      setGeneration(null);
      void refetchHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to apply generated code.");
    }
  };

  const removeSavedPrompt = async (id: string) => {
    try {
      await deleteSavedPrompt(id);
      await refetchPrompts();
      toast.success("Prompt deleted");
    } catch {
      toast.error("Unable to delete the saved prompt.");
    }
  };

  const recordAction = async (action: "accepted" | "rejected" | "edited") => {
    if (!generation) return;
    try {
      await recordHistoryAction({ generationId: generation.id, action, editedCode: action === "edited" ? preview : undefined });
      toast.success(
        action === "accepted"
          ? "Accepted — review before applying"
          : action === "edited"
            ? "Edited version saved"
            : "Rejected"
      );
      if (action !== "edited") setGeneration(null);
    } catch {
      toast.error("Unable to record that action.");
    }
  };

  const savePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Write a prompt before saving it.");
      return;
    }
    try {
      await createSavedPrompt({ title: prompt.trim().slice(0, 48), prompt: prompt.trim(), category: tab });
      await refetchPrompts();
      toast.success("Prompt saved to your library.");
    } catch {
      toast.error("Unable to save the prompt.");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = config.icon;
  const stats = generationHistory?.items ?? [];

  const renderSidebarItem = (item: GeneratorTab) => {
    const itemConfig = generators[item];
    const ItemIcon = itemConfig.icon;
    const active = tab === item;

    return (
      <button
        key={item}
        type="button"
        onClick={() => { setTab(item); }}
        title={itemConfig.label}
        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 font-[Inter] ${
          active
            ? isDark
              ? "bg-[var(--accent)]/10 text-white shadow-sm"
              : "accent-bg-light accent-text-base shadow-sm"
            : isDark
              ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full accent-gradient" />
        )}
        <ItemIcon
          size={17}
          className={`shrink-0 transition-all duration-200 ${
            active
              ? "accent-text scale-110"
              : isDark
                ? "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
          }`}
        />
        {!sidebarCollapsed && (
          <span className="overflow-hidden whitespace-nowrap">{itemConfig.label}</span>
        )}
        {active && !sidebarCollapsed && (
          <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full accent-bg animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-4 sm:gap-6" onKeyDown={handleKeyDown}>
        {/* ─── Animated Header ─── */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center animate-fadeInUp">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl accent-gradient shadow-xl accent-shadow-lg">
              <Sparkles size={22} className="text-white" />
              <div className="absolute inset-0 rounded-2xl accent-gradient opacity-50 blur-xl" />
            </div>
            <div>
              <h1 className={`font-[Outfit] text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                AI Code Generation
              </h1>
              <p className={`mt-0.5 text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Generate, improve, and understand code with repository-aware AI.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className={`hidden items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium sm:inline-flex ${
              isDark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"
            }`}>
              <Keyboard size={12} />
              Ctrl+Enter
            </kbd>
            <button
              type="button"
              onClick={() => setTab("prompts")}
              title="Prompt Library"
              className={`group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium font-[Inter] transition-all duration-200 hover:scale-105 ${
                isDark
                  ? "border-white/10 text-slate-300 hover:bg-white/5"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Save size={15} className="transition-transform group-hover:rotate-12" />
              <span className="hidden sm:inline">Prompt Library</span>
            </button>
          </div>
        </div>

        {/* ─── Stats Bar ─── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
          {[
            { label: "Total", value: stats.length, icon: Sparkles, color: "text-violet-500" },
            { label: "Accepted", value: stats.filter((s) => s.status === "accepted").length, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Rejected", value: stats.filter((s) => s.status === "rejected").length, icon: XCircle, color: "text-red-500" },
            { label: "Completed", value: stats.filter((s) => s.status === "completed").length, icon: TrendingUp, color: "text-blue-500" },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`stagger-item rounded-xl border p-3 transition-all duration-200 hover:scale-[1.02] ${
                  isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
                }`}
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xl font-bold font-[Outfit] sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
                    <p className={`text-[10px] font-medium font-[Inter] sm:text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                    <StatIcon size={16} className={stat.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="flex flex-1 gap-4 sm:gap-6 overflow-hidden">
          {/* ─── Collapsible Sidebar ─── */}
          <aside className={`relative shrink-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-14" : "w-[220px]"
          }`}>
            <div className={`sticky top-0 rounded-2xl border p-2 transition-colors ${
              isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
            }`}>
              <div className="mb-2 flex items-center justify-between px-1">
                {!sidebarCollapsed && (
                  <span className={`text-[10px] font-semibold uppercase tracking-widest font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    Modes
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isDark ? "text-slate-500 hover:bg-white/10 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  {sidebarCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
                </button>
              </div>
              <div className="max-h-[65vh] space-y-3 overflow-y-auto">
                {sidebarGroups.map((group) => (
                  <div key={group.id}>
                    {!sidebarCollapsed && (
                      <p className={`px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest font-[Inter] ${
                        isDark ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {group.label}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {group.items.map(renderSidebarItem)}
                    </div>
                  </div>
                ))}
                <div className={`my-2 border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}`} />
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setTab("prompts")}
                    title="Prompt Library"
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 font-[Inter] ${
                      tab === "prompts"
                        ? isDark
                          ? "bg-[var(--accent)]/10 text-white"
                          : "accent-bg-light accent-text-base"
                        : isDark
                          ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Save size={17} className={`shrink-0 transition-transform group-hover:rotate-12 ${
                      tab === "prompts" ? "accent-text" : isDark ? "text-slate-500" : "text-slate-400"
                    }`} />
                    {!sidebarCollapsed && <span>Prompt Library</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("history")}
                    title="Generation History"
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 font-[Inter] ${
                      tab === "history"
                        ? isDark
                          ? "bg-[var(--accent)]/10 text-white"
                          : "accent-bg-light accent-text-base"
                        : isDark
                          ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <History size={17} className={`shrink-0 ${
                      tab === "history" ? "accent-text" : isDark ? "text-slate-500" : "text-slate-400"
                    }`} />
                    {!sidebarCollapsed && <span>Generation History</span>}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Content Area ─── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6 overflow-y-auto">
            {tab === "prompts" ? (
              <section key={animKey} className={`rounded-2xl border p-5 animate-scaleIn ${
                isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
              }`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-violet-500/10 p-2.5">
                    <Save size={19} className="text-violet-500" />
                  </div>
                  <div>
                    <h2 className={`font-[Outfit] text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Prompt Library</h2>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Choose a template or one of your saved prompts.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {allPrompts.map((item, i) => (
                    <div
                      key={`${item.title}-${item.prompt}`}
                      className={`stagger-item group rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                        isDark
                          ? "border-white/10 hover:bg-white/[0.04] hover:border-[var(--accent)]/30"
                          : "border-slate-200 hover:bg-slate-50 hover:border-[var(--accent)]/30"
                      }`}
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <button type="button" onClick={() => applyPrompt(item.prompt)} className="w-full text-left">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{item.icon ?? "📝"}</div>
                          <div className="min-w-0 flex-1">
                            <p className={`font-[Outfit] text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{item.title}</p>
                            <p className={`mt-1 line-clamp-2 text-xs leading-5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{item.prompt}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                            {item.category ?? "general"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-medium text-violet-500 opacity-0 transition-opacity group-hover:opacity-100">
                            Use prompt <ArrowRight size={11} />
                          </span>
                        </div>
                      </button>
                      {item.id && (
                        <button
                          type="button"
                          onClick={() => void removeSavedPrompt(item.id!)}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-400"
                        >
                          <X size={12} /> Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : tab === "history" ? (
              <section key={animKey} className={`rounded-2xl border p-5 animate-scaleIn ${
                isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
              }`}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2.5">
                    <History size={19} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className={`font-[Outfit] text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Generation History</h2>
                    <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Recent AI generations and outcomes.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {stats.length ? stats.map((item, i) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => { setGeneration(item); setPreview(item.generatedCode); setTab("generate"); }}
                      className={`stagger-item flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
                        isDark
                          ? "border-white/10 hover:bg-white/[0.04] hover:border-[var(--accent)]/30"
                          : "border-slate-200 hover:bg-slate-50 hover:border-[var(--accent)]/30"
                      }`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-800"}`}>{item.prompt}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500"
                          }`}>{item.type}</span>
                          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </div>
                    </button>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="mb-4 rounded-2xl bg-amber-500/10 p-4">
                        <History size={32} className="text-amber-500" />
                      </div>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>No generations yet</p>
                      <p className={`mt-1 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>Start by generating some code!</p>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* ─── Input Section ─── */}
                <section className={`rounded-2xl border animate-scaleIn ${
                  isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
                }`}>
                  <div className={`flex items-start gap-3 border-b p-4 sm:p-5 ${
                    isDark ? "border-white/[0.08]" : "border-slate-100"
                  }`}>
                    <div className="relative rounded-xl accent-bg-light p-2.5">
                      <Icon size={19} className="accent-text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className={`font-[Outfit] text-lg font-bold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                        {config.label}
                      </h2>
                      <p className={`mt-0.5 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>{config.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    {/* Repository & File Path */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="relative">
                        <select
                          aria-label="Repository context"
                          value={repositoryId}
                          onChange={(event) => setRepositoryId(event.target.value)}
                          className={`${inputClass} cursor-pointer appearance-none pr-9`}
                          title="Select repository for context-aware generation"
                        >
                          <option value="">No repository context</option>
                          {repositories?.map((repository) => (
                            <option key={repository.id} value={repository.id}>{repository.name}</option>
                          ))}
                        </select>
                        <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                        </div>
                      </div>
                      <input
                        value={filePath}
                        onChange={(event) => setFilePath(event.target.value)}
                        placeholder="Target file path (e.g. src/auth.ts)"
                        className={inputClass}
                        title="Optional target file path"
                      />
                    </div>

                    {/* Prompt Input */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          What would you like to do?
                        </label>
                        <button
                          type="button"
                          onClick={() => void savePrompt()}
                          title="Save this prompt to your library"
                          className="group flex items-center gap-1 text-xs font-medium accent-text-base transition-opacity hover:opacity-80"
                        >
                          <Save size={12} className="transition-transform group-hover:scale-110" />
                          Save prompt
                        </button>
                      </div>
                      <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder={config.placeholder}
                        rows={3}
                        className={`${inputClass} resize-none overflow-y-auto min-h-[72px] max-h-48`}
                      />
                    </div>

                    {/* Code Input */}
                    {config.needsCode && (
                      <div className="animate-fadeIn">
                        <label className={`mb-2 block text-sm font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          Code input
                        </label>
                        <textarea
                          value={inputCode}
                          onChange={(event) => setInputCode(event.target.value)}
                          placeholder="Paste the code to process..."
                          rows={8}
                          className={`${inputClass} resize-y font-mono text-xs leading-5 min-h-[120px]`}
                        />
                      </div>
                    )}

                    {/* Language Selectors */}
                    {config.needsLanguage && (
                      <div className="grid gap-3 sm:grid-cols-2 animate-fadeIn">
                        <div>
                          <label className={`mb-2 block text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Source Language</label>
                          <select
                            aria-label="Source language"
                            value={inputLanguage}
                            onChange={(event) => setInputLanguage(event.target.value)}
                            className={inputClass}
                          >
                            {["TypeScript", "JavaScript", "Python", "Java", "C#", "Go", "Ruby"].map((language) => (
                              <option key={language}>{language}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`mb-2 block text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Target Language</label>
                          <select
                            aria-label="Target language"
                            value={targetLanguage}
                            onChange={(event) => setTargetLanguage(event.target.value)}
                            className={inputClass}
                          >
                            {["TypeScript", "JavaScript", "Python", "Java", "C#", "Go", "Ruby"].map((language) => (
                              <option key={language}>{language}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void runGeneration()}
                        disabled={isGenerating}
                        className={`group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg accent-shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${
                          isGenerating ? "animate-pulseGlow" : ""
                        }`}
                        title={isGenerating ? "Generating..." : "Generate (Ctrl+Enter)"}
                      >
                        {isGenerating ? (
                          <>
                            <LoaderCircle size={18} className="animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Zap size={18} className="transition-transform group-hover:scale-110" />
                            <span>{config.label}</span>
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                        {!isGenerating && (
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        )}
                      </button>
                      {!isGenerating && (
                        <span className={`hidden text-[10px] font-medium sm:inline ${
                          isDark ? "text-slate-600" : "text-slate-400"
                        }`}>
                          or press <kbd className={`rounded border px-1 py-0.5 font-mono text-[10px] ${
                            isDark ? "border-white/10 bg-white/5 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}>Ctrl+Enter</kbd>
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                {/* ─── Preview Section ─── */}
                {(generation || isGenerating) && (
                  <section className={`rounded-2xl border animate-fadeInUp ${
                    isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-slate-200 bg-white"
                  }`}>
                    {/* Preview Header */}
                    <div className={`flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5 ${
                      isDark ? "border-white/[0.08]" : "border-slate-100"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5">
                          <Code2 size={19} className="text-emerald-500" />
                        </div>
                        <div>
                          <h2 className={`font-[Outfit] text-lg font-bold sm:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            Preview
                          </h2>
                          <p className={`mt-0.5 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            Review before applying
                          </p>
                        </div>
                      </div>

                      {generation && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* View mode toggles */}
                          {["split", "generated", "raw"].map((view) => (
                            <button
                              key={view}
                              type="button"
                              onClick={() => setPreviewView(view as PreviewView)}
                              title={`${view === "split" ? "Side-by-side" : view === "generated" ? "Generated only" : "Raw text"} view`}
                              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${
                                previewView === view
                                  ? isDark
                                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 accent-text-base"
                                    : "border-[var(--accent)]/30 accent-bg-light accent-text-base"
                                  : isDark
                                    ? "border-white/10 text-slate-400 hover:bg-white/5"
                                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              {view === "split" ? <Columns2 size={12} className="inline-block mr-1" /> : view === "generated" ? <Code2 size={12} className="inline-block mr-1" /> : <WrapText size={12} className="inline-block mr-1" />}
                              {view === "split" ? "Split" : view === "generated" ? "Generated" : "Raw"}
                            </button>
                          ))}

                          <div className={`mx-1 h-5 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            title={isEditing ? "Switch to preview" : "Edit generated code"}
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200 hover:scale-105 ${
                              isEditing
                                ? isDark
                                  ? "border-[var(--accent)]/30 bg-[var(--accent)]/10 accent-text-base"
                                  : "border-[var(--accent)]/30 accent-bg-light accent-text-base"
                                : isDark
                                  ? "border-white/10 text-slate-400 hover:bg-white/5"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <Edit3 size={12} />
                            {isEditing ? "Preview" : "Edit"}
                          </button>

                          {/* Copy */}
                          <button
                            type="button"
                            onClick={() => void handleCopy()}
                            title="Copy to clipboard"
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200 hover:scale-105 ${
                              isDark
                                ? "border-white/10 text-slate-400 hover:bg-white/5"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy"}
                          </button>

                          {/* Regenerate */}
                          <button
                            type="button"
                            onClick={() => void runGeneration()}
                            title="Regenerate with same prompt"
                            className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-200 hover:scale-105 ${
                              isDark
                                ? "border-white/10 text-slate-400 hover:bg-white/5"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <RefreshCw size={12} className="transition-transform group-hover:rotate-180 duration-500" />
                            Regenerate
                          </button>

                          <div className={`mx-1 h-5 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

                          {/* Apply to File */}
                          <button
                            type="button"
                            onClick={() => void applyToFile()}
                            title="Write generated code to file"
                            className="group inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600 hover:shadow-lg"
                          >
                            <Check size={12} />
                            Apply
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            onClick={() => void recordAction("rejected")}
                            title="Reject this generation"
                            className="group inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-red-500 transition-all duration-200 hover:scale-105 hover:bg-red-500/20"
                          >
                            <X size={12} />
                            Reject
                          </button>

                          {/* Accept */}
                          <button
                            type="button"
                            onClick={() => void recordAction("accepted")}
                            title="Accept this generation"
                            className="group inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-500 transition-all duration-200 hover:scale-105 hover:bg-emerald-500/20"
                          >
                            <Check size={12} />
                            Accept
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Preview Body */}
                    <div className="p-4 sm:p-5">
                      {isGenerating ? (
                        <div className="flex min-h-48 flex-col items-center justify-center gap-4">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute h-16 w-16 rounded-full accent-gradient opacity-20 blur-xl" />
                            <LoaderCircle size={32} className="animate-spin accent-text-base" />
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              Reading repository context and generating
                              <span className="inline-flex overflow-hidden ml-1">
                                <span className="animate-bounce [animation-delay:0ms]">.</span>
                                <span className="animate-bounce [animation-delay:150ms]">.</span>
                                <span className="animate-bounce [animation-delay:300ms]">.</span>
                              </span>
                            </p>
                            <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              This may take a few seconds
                            </p>
                          </div>
                          <div className={`mt-4 w-full max-w-xl space-y-2 ${isDark ? "opacity-30" : "opacity-40"}`}>
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className="shimmer-line h-3.5 rounded-lg"
                                style={{ width: `${85 - i * 12}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : isEditing ? (
                        <div className="animate-fadeIn">
                          <textarea
                            aria-label="Edit generated output"
                            value={preview}
                            onChange={(event) => setPreview(event.target.value)}
                            rows={18}
                            className={`${inputClass} font-mono text-xs leading-5`}
                          />
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                                isDark
                                  ? "border-white/10 text-slate-300 hover:bg-white/5"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void recordAction("edited")}
                              className="inline-flex items-center gap-2 rounded-lg accent-gradient px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-105"
                            >
                              <Check size={14} /> Save Edit
                            </button>
                          </div>
                        </div>
                      ) : previewView === "split" ? (
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="animate-slideInLeft">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-slate-400" />
                              <p className={`text-[10px] font-semibold uppercase tracking-wider ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}>
                                Original Input
                              </p>
                            </div>
                            <CodeBlock language={getOutputLanguage(tab, inputLanguage)} filename="original">
                              {inputCode || "No source code was supplied."}
                            </CodeBlock>
                          </div>
                          <div className="animate-slideInRight">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                                Generated Output
                              </p>
                            </div>
                            <CodeBlock language={getOutputLanguage(tab, targetLanguage)} filename="ai-generation">
                              {preview}
                            </CodeBlock>
                          </div>
                        </div>
                      ) : previewView === "generated" ? (
                        <div className="animate-fadeIn">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                              Generated Output
                            </p>
                          </div>
                          <CodeBlock language={getOutputLanguage(tab, targetLanguage)} filename="ai-generation">
                            {preview}
                          </CodeBlock>
                        </div>
                      ) : (
                        <div className="animate-fadeIn">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                              Raw Output
                            </p>
                          </div>
                          <pre className={`max-h-96 overflow-auto rounded-xl border p-4 text-xs leading-6 font-mono ${
                            isDark
                              ? "border-white/10 bg-[#1a1a2e] text-slate-300"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}>
                            {preview}
                          </pre>
                          <p className={`mt-2 text-[10px] font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                            {preview.split("\n").length} lines | {preview.length} characters
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
