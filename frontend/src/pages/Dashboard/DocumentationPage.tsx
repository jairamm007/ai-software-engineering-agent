import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Play, BookOpen, FolderGit2, ArrowRight, Download, Copy, Check, FileText, Code2, Layers, Database, Route, Cpu, File, FolderOpen, CheckSquare, Square, FileStack } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import AIResult from "@/components/repository/AIResult";
import { getRepositories, getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type DocScope = "single" | "multiple" | "repository";

const scopeOptions: { id: DocScope; label: string; icon: typeof File; description: string }[] = [
  { id: "single", label: "Single File", icon: File, description: "Generate docs for one file" },
  { id: "multiple", label: "Multiple Files", icon: FileStack, description: "Select several files to document" },
  { id: "repository", label: "Entire Repository", icon: FolderOpen, description: "Generate docs for the whole repo" },
];

const categories = [
  { id: "auto", label: "Auto", icon: Cpu, prompt: "Generate comprehensive documentation" },
  { id: "readme", label: "README", icon: FileText, prompt: "Generate a README-style documentation" },
  { id: "api", label: "API Reference", icon: Code2, prompt: "Generate API reference documentation" },
  { id: "architecture", label: "Architecture", icon: Layers, prompt: "Document the architecture and design patterns" },
  { id: "database", label: "Database", icon: Database, prompt: "Document database schemas and data models" },
  { id: "routes", label: "Routes", icon: Route, prompt: "Document API routes and endpoints" },
];

export default function DocumentationPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [scope, setScope] = useState<DocScope>("single");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState("auto");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const { data: repoData, isLoading: repoLoading } = useQuery({
    queryKey: ["repository", selectedRepoId],
    queryFn: () => getRepository(selectedRepoId),
    enabled: !!selectedRepoId,
  });

  const files = useMemo(
    () => repoData?.files.filter((f) => !search || f.path.toLowerCase().includes(search.toLowerCase())) ?? [],
    [repoData, search]
  );

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepoId(repoId);
    setSelectedFile("");
    setSelectedFiles(new Set());
    setResult("");
    setSearch("");
    setScope("single");
  };

  const toggleFileSelection = (path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const toggleAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.path)));
    }
  };

  const canGenerate = useMemo(() => {
    if (!repoData) return false;
    if (scope === "single") return !!selectedFile;
    if (scope === "multiple") return selectedFiles.size > 0;
    return true; // repository scope
  }, [repoData, scope, selectedFile, selectedFiles]);

  const runDocs = async () => {
    if (!repoData || !canGenerate) return;
    setLoading(true);
    setResult("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const cat = categories.find((c) => c.id === activeCategory) ?? categories[0];
      let question = "";
      let filePath: string | undefined;

      if (scope === "single") {
        question = `${cat.prompt} for this file including purpose, parameters, return values, and usage examples: ${selectedFile}`;
        filePath = selectedFile;
      } else if (scope === "multiple") {
        const fileList = Array.from(selectedFiles).join(", ");
        question = `${cat.prompt} for the following files including purpose, API references, parameters, return values, and usage examples: ${fileList}`;
        filePath = undefined;
      } else {
        question = `${cat.prompt} for this entire repository including project overview, module descriptions, architecture, setup instructions, and API references`;
        filePath = undefined;
      }

      const response = await askRepository({ question, repositoryId: repoData.id, filePath, signal: controller.signal });
      setResult(response.answer ?? JSON.stringify(response));
    } catch {
      if (controller.signal.aborted) return;
      setResult("Failed to generate documentation. Please try again.");
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMd = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = scope === "repository"
      ? `docs-${repoData?.name ?? "repo"}`
      : scope === "multiple"
        ? `docs-${selectedFiles.size}-files`
        : `docs-${selectedFile.split("/").pop() ?? "file"}`;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = scope === "repository"
      ? `docs-${repoData?.name ?? "repo"}`
      : scope === "multiple"
        ? `docs-${selectedFiles.size}-files`
        : `docs-${selectedFile.split("/").pop() ?? "file"}`;
    a.download = `${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scopeSummary = useMemo(() => {
    if (scope === "repository") return "Entire repository";
    if (scope === "multiple") return `${selectedFiles.size} file${selectedFiles.size !== 1 ? "s" : ""} selected`;
    return selectedFile || "No file selected";
  }, [scope, selectedFile, selectedFiles]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                Documentation
              </h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Generate AI-powered docs for files, multiple files, or entire repositories
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step 1: Select Repository */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              1. Select Repository
            </h2>
            <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose a repository to generate documentation for
            </p>
          </div>

          <div className="p-5">
            {reposLoading ? (
              <div className="flex h-20 items-center justify-center">
                <LoadingIndicator size="sm" />
              </div>
            ) : !repos || repos.length === 0 ? (
              <div className={`rounded-xl border border-dashed p-8 text-center ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <FolderGit2 size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No repositories found
                </p>
                <p className={`mt-1 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  Add a repository first to generate documentation.
                </p>
                <Link
                  to="/repositories"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  Add Repository
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => handleRepoSelect(repo.id)}
                    className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedRepoId === repo.id
                        ? isDark
                          ? "border-emerald-500/30 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/20"
                          : "border-emerald-200 bg-emerald-50 shadow-sm ring-1 ring-emerald-200"
                        : isDark
                          ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selectedRepoId === repo.id
                        ? isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                        : isDark ? "bg-white/5" : "bg-slate-100"
                    }`}>
                      <FolderGit2 size={16} className={
                        selectedRepoId === repo.id
                          ? "text-emerald-500"
                          : isDark ? "text-slate-400" : "text-slate-500"
                      } />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium font-[Inter] ${
                        selectedRepoId === repo.id
                          ? isDark ? "text-white" : "text-emerald-700"
                          : isDark ? "text-slate-200" : "text-slate-700"
                      }`}>
                        {repo.name}
                      </p>
                      <p className={`mt-0.5 truncate text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {repo._count?.files ?? 0} files
                      </p>
                    </div>
                    <ArrowRight size={14} className={`shrink-0 transition-colors ${
                      selectedRepoId === repo.id
                        ? "text-emerald-500"
                        : isDark ? "text-slate-600 group-hover:text-slate-400" : "text-slate-300 group-hover:text-slate-500"
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Step 2: Scope + File Selection + Generate */}
        {selectedRepoId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border shadow-sm ${
              isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                2. Choose Documentation Scope
              </h2>
              <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Select what to document, then configure and generate
              </p>
            </div>

            {repoLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingIndicator size="sm" />
              </div>
            ) : (
              <>
                {/* Scope Selector */}
                <div className="px-5 pt-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {scopeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = scope === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setScope(opt.id);
                            setSelectedFile("");
                            setSelectedFiles(new Set());
                            setResult("");
                          }}
                          className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            isActive
                              ? isDark
                                ? "border-emerald-500/30 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                                : "border-emerald-200 bg-emerald-50 ring-1 ring-emerald-200"
                              : isDark
                                ? "border-white/10 bg-white/[0.02] hover:border-white/20"
                                : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isActive
                              ? isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                              : isDark ? "bg-white/5" : "bg-slate-100"
                          }`}>
                            <Icon size={16} className={isActive ? "text-emerald-500" : isDark ? "text-slate-400" : "text-slate-500"} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium font-[Inter] ${isActive ? (isDark ? "text-white" : "text-emerald-700") : isDark ? "text-slate-200" : "text-slate-700"}`}>
                              {opt.label}
                            </p>
                            <p className={`mt-0.5 text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* File List (hidden for repository scope) */}
                {scope !== "repository" && (
                  <>
                    <div className="px-5 pt-4">
                      <div className="relative">
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none font-[Inter] ${
                            isDark
                              ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-emerald-500"
                              : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="overflow-hidden overflow-y-auto px-3 py-2" style={{ maxHeight: `${Math.max(140, Math.min(files.length * 40 + 20, 480))}px` }}>
                      {scope === "multiple" && files.length > 0 && (
                        <button
                          type="button"
                          onClick={toggleAllFiles}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all font-[Inter] ${
                            isDark ? "text-slate-400 hover:bg-white/[0.03]" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {selectedFiles.size === files.length ? (
                            <CheckSquare size={14} className="shrink-0 text-emerald-500" />
                          ) : (
                            <Square size={14} className="shrink-0" />
                          )}
                          <span className="font-medium">
                            {selectedFiles.size === files.length ? "Deselect all" : `Select all (${files.length})`}
                          </span>
                        </button>
                      )}

                      {files.length === 0 && (
                        <p className={`py-4 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
                      )}

                      {files.map((file) => {
                        const ext = getFileExtension(file.path);
                        const typeInfo = getFileTypeInfo(ext);
                        const Icon = typeInfo.icon;
                        const isSingleSelected = selectedFile === file.path;
                        const isMultiSelected = selectedFiles.has(file.path);
                        const isSelected = scope === "multiple" ? isMultiSelected : isSingleSelected;

                        return (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => {
                              if (scope === "multiple") {
                                toggleFileSelection(file.path);
                              } else {
                                setSelectedFile(file.path);
                              }
                            }}
                            className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all font-[Inter] ${
                              isSelected
                                ? isDark
                                  ? "bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-500/20"
                                  : "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                                : isDark
                                  ? "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {scope === "multiple" && (
                              <span className="shrink-0">
                                {isMultiSelected ? (
                                  <CheckSquare size={14} className="text-emerald-500" />
                                ) : (
                                  <Square size={14} className={isDark ? "text-slate-600" : "text-slate-300"} />
                                )}
                              </span>
                            )}
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                              isSelected ? (isDark ? "bg-emerald-500/20" : "bg-emerald-100") : typeInfo.bg
                            }`}>
                              <Icon size={13} className={isSelected ? "text-emerald-500" : typeInfo.color} />
                            </div>
                            <span className="truncate">{file.path}</span>
                            <span className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                              isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                            }`}>
                              {file.chunks.length} chunks · {formatFileSize(file.size)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Repository scope info */}
                {scope === "repository" && (
                  <div className="px-5 py-4">
                    <div className={`rounded-xl border border-dashed p-6 text-center ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/50"}`}>
                      <FolderOpen size={28} className={`mx-auto mb-2 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
                      <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                        Documentation will cover the entire repository
                      </p>
                      <p className={`mt-1 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        AI will analyze all indexed files and generate comprehensive documentation
                      </p>
                    </div>
                  </div>
                )}

                {/* Category + Generate */}
                <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <p className={`mb-2 text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Documentation Category
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-[Inter] ${
                            activeCategory === cat.id
                              ? isDark
                                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : isDark
                                ? "bg-white/5 text-slate-400 hover:bg-white/10"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <Icon size={12} />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void runDocs()}
                      disabled={!canGenerate || loading}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none font-[Inter]"
                    >
                      {loading ? (
                        <>
                          <LoadingIndicator size="sm" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Generate Documentation
                        </>
                      )}
                    </button>
                    <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {scopeSummary}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Result */}
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className={`rounded-2xl border shadow-sm ${
              isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
            }`}>
              <div className={`flex items-center justify-between border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <h3 className={`text-sm font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                  Generated Documentation
                </h3>
                {result && !loading && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-[Inter] ${
                        isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMd}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-[Inter] ${
                        isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Download size={12} />
                      .md
                    </button>
                    <button
                      type="button"
                      onClick={handleExportTxt}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-[Inter] ${
                        isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <Download size={12} />
                      .txt
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                <AIResult title="Documentation" content={result} loading={loading} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
