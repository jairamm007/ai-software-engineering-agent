import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Play, Square, Shield, Zap, Palette, Layers } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import AIResult from "@/components/repository/AIResult";
import { getRepository } from "@/services/repository";
import { streamChat } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type ReviewScope = "all" | "security" | "performance" | "style";

const REVIEW_SCOPES: { key: ReviewScope; label: string; icon: React.ReactNode; color: string; prompt: string }[] = [
  { key: "all", label: "Full Review", icon: <Layers size={14} />, color: "from-[var(--accent)] to-purple-600", prompt: "Perform a thorough code review of this file including security vulnerabilities, performance issues, code style, best practices, and potential bugs" },
  { key: "security", label: "Security", icon: <Shield size={14} />, color: "from-red-500 to-orange-600", prompt: "Perform a security-focused review of this file. Identify vulnerabilities, injection risks, authentication issues, data exposure, and security best practices" },
  { key: "performance", label: "Performance", icon: <Zap size={14} />, color: "from-amber-500 to-yellow-600", prompt: "Perform a performance-focused review of this file. Identify bottlenecks, memory leaks, inefficient algorithms, unnecessary re-renders, and optimization opportunities" },
  { key: "style", label: "Code Style", icon: <Palette size={14} />, color: "from-emerald-500 to-teal-600", prompt: "Perform a code style review of this file. Check naming conventions, code organization, documentation, DRY principles, readability, and maintainability" },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function RepositoryReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedFile, setSelectedFile] = useState<string>("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewScope, setReviewScope] = useState<ReviewScope>("all");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  const files =
    data?.files.filter(
      (f) => !search || f.path.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const runReview = async () => {
    if (!selectedFile || !data) return;
    setLoading(true);
    setResult("");
    const controller = new AbortController();
    abortRef.current = controller;
    let fullContent = "";

    const scope = REVIEW_SCOPES.find((s) => s.key === reviewScope) ?? REVIEW_SCOPES[0];

    try {
      await streamChat({
        question: `${scope.prompt}: ${selectedFile}`,
        repositoryId: data.id,
        filePath: selectedFile,
        signal: controller.signal,
        onToken: (token) => {
          fullContent += token;
          setResult(fullContent);
        },
        onDone: () => {
          setLoading(false);
          abortRef.current = null;
        },
        onError: (message) => {
          if (controller.signal.aborted) return;
          setResult(message || "Failed to generate code review. Please try again.");
          setLoading(false);
          abortRef.current = null;
        },
      });
    } catch {
      if (controller.signal.aborted) return;
      setResult("Failed to generate code review. Please try again.");
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <LoadingIndicator size="md" />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading repository...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">Repository not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BackButton />
        <RepositoryTabs repositoryId={data.id} />

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Code Review
          </h1>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Get AI-powered code reviews with real-time streaming results
          </p>
        </motion.div>

        {/* Review Scope Selector */}
        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REVIEW_SCOPES.map((scope) => (
            <motion.button
              key={scope.key}
              variants={item}
              type="button"
              onClick={() => setReviewScope(scope.key)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                reviewScope === scope.key
                  ? isDark
                    ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 shadow-lg shadow-[var(--accent)]/10"
                    : "border-[var(--accent)]/50 bg-[var(--accent)]/5 shadow-lg shadow-[var(--accent)]/10"
                  : isDark
                    ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${scope.color} text-white`}>
                {scope.icon}
              </div>
              <p className={`mt-2.5 text-sm font-semibold ${reviewScope === scope.key ? "text-[var(--accent)]" : isDark ? "text-slate-200" : "text-slate-700"}`}>
                {scope.label}
              </p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Select File to Review
            </h2>
            <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose a file below, then run the AI review
            </p>
          </div>

          <div className="px-5 pt-4">
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:accent-border"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:accent-border"
                }`}
              />
            </div>
          </div>

          <div style={{ maxHeight: `${Math.max(140, Math.min(files.length * 40 + 20, 520))}px` }} className="overflow-hidden overflow-y-auto px-3 py-2">
            {files.length === 0 && (
              <p className={`py-4 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
            )}
            {files.map((file) => {
              const ext = getFileExtension(file.path);
              const typeInfo = getFileTypeInfo(ext);
              const Icon = typeInfo.icon;
              const isSelected = selectedFile === file.path;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFile(file.path)}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    isSelected
                        ? isDark
                          ? "accent-bg-light text-white shadow-sm accent-ring"
                          : "accent-bg-light accent-text-base shadow-sm accent-ring"
                      : isDark
                        ? "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    isSelected ? (isDark ? "accent-bg-light" : "accent-bg-light") : typeInfo.bg
                  }`}>
                    <Icon size={13} className={isSelected ? "accent-text-base" : typeInfo.color} />
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

          <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-2 rounded-xl bg-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30"
                >
                  <Square size={14} />
                  Stop Review
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void runReview()}
                  disabled={!selectedFile}
                  className="flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  <Play size={14} />
                  Run Code Review
                </button>
              )}
              {selectedFile && (
                <span className={`min-w-0 truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`} title={selectedFile}>
                  {selectedFile}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AIResult title="Code Review" content={result} loading={loading} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
