import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  Play,
  RotateCcw,
  Search,
  FileCode2,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import AIResult from "@/components/repository/AIResult";
import { getRepositories, getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";

const statCards = [
  { label: "Overall Score", value: "87%", icon: CheckCircle2, color: "emerald" },
  { label: "Security", value: "92%", icon: Shield, colorClass: "accent-text-base" },
  { label: "Performance", value: "85%", icon: Zap, color: "amber" },
  { label: "Maintainability", value: "83%", icon: FileCode2, color: "cyan" },
];

interface ReviewHistoryEntry {
  id: string;
  repoName: string;
  filePath: string;
  score: string;
  time: string;
}

export default function CodeReviewPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewHistory] = useState<ReviewHistoryEntry[]>([]);
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

  const files =
    repoData?.files.filter(
      (f) => !search || f.path.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepoId(repoId);
    setSelectedFile("");
    setResult("");
    setSearch("");
  };

  const runReview = async () => {
    if (!selectedFile || !repoData) return;
    setLoading(true);
    setResult("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await askRepository({
        question: `Perform a thorough code review of this file including security, performance, maintainability, and code quality: ${selectedFile}`,
        repositoryId: repoData.id,
        filePath: selectedFile,
        signal: controller.signal,
      });
      setResult(response.answer ?? JSON.stringify(response));
    } catch {
      if (controller.signal.aborted) return;
      setResult("Failed to perform code review. Please try again.");
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
              <GitPullRequest size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                Code Review
              </h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Select a file and get an AI-powered code review
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }} className={`rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                <s.icon size={16} className={s.colorClass ?? `text-${s.color}-500`} />
              </div>
              <p className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Step 1: Select Repository */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"}`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              1. Select Repository
            </h2>
            <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose a repository to review files from
            </p>
          </div>

          <div className="p-5">
            {reposLoading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            ) : !repos || repos.length === 0 ? (
                <div className={`rounded-xl border border-dashed p-8 text-center ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <AlertTriangle size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>No repositories found</p>
                <p className={`mt-1 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>Add a repository first to start reviewing code.</p>
                <Link to="/repositories" className="mt-4 inline-flex items-center gap-1.5 rounded-lg accent-bg px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90">
                  Add Repository
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => (
                  <button key={repo.id} type="button" onClick={() => handleRepoSelect(repo.id)} className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${selectedRepoId === repo.id ? isDark ? "border-[var(--accent)]/30 accent-bg-light shadow-sm ring-1 ring-[var(--accent)]/20" : "border-[var(--accent)]/20 accent-bg-light shadow-sm ring-1 ring-[var(--accent)]/20" : isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selectedRepoId === repo.id ? "accent-bg-light" : isDark ? "bg-white/5" : "bg-slate-100"}`}>
                      <FileCode2 size={16} className={selectedRepoId === repo.id ? "accent-text-base" : isDark ? "text-slate-400" : "text-slate-500"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium font-[Inter] ${selectedRepoId === repo.id ? isDark ? "text-white" : "accent-text-base" : isDark ? "text-slate-200" : "text-slate-700"}`}>{repo.name}</p>
                      <p className={`mt-0.5 truncate text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{repo._count.files} files</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Step 2: Select File + Review */}
        {selectedRepoId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                2. Select File to Review
              </h2>
              <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Pick a file, then launch the AI code review
              </p>
            </div>

            {repoLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            ) : (
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
                          ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-[var(--accent)]"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                      }`}
                    />
                  </div>
                </div>

                <div className="overflow-hidden overflow-y-auto px-3 py-2" style={{ maxHeight: `${Math.max(140, Math.min(files.length * 40 + 20, 480))}px` }}>
                  {files.length === 0 && (
                    <p className={`py-4 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
                  )}
                  {files.map((file) => {
                    const ext = getFileExtension(file.path);
                    const typeInfo = getFileTypeInfo(ext);
                    const Icon = typeInfo.icon;
                    const isSelected = selectedFile === file.path;
                    return (
                      <button key={file.id} type="button" onClick={() => setSelectedFile(file.path)} className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all font-[Inter] ${isSelected ? isDark ? "accent-bg-light text-white shadow-sm ring-1 ring-[var(--accent)]/20" : "accent-bg-light text-slate-700 shadow-sm ring-1 ring-[var(--accent)]/20" : isDark ? "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${isSelected ? "accent-bg-light" : typeInfo.bg}`}>
                          <Icon size={13} className={isSelected ? "accent-text-base" : typeInfo.color} />
                        </div>
                        <span className="truncate">{file.path}</span>
                        <span className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}>{formatFileSize(file.size)}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void runReview()}
                      disabled={!selectedFile || loading}
                      className="flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg accent-shadow disabled:opacity-50 disabled:shadow-none font-[Inter]"
                    >
                      {loading ? (
                        <>
                          <RotateCcw size={14} className="animate-spin" />
                          Reviewing...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Review Code
                        </>
                      )}
                    </button>
                    {selectedFile && (
                      <div className="flex min-w-0 items-center gap-1.5">
                        <FileCode2 size={14} className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                        <span className={`truncate text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {selectedFile}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* AI Review Result */}
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AIResult title="Code Review" content={result} loading={loading} />
          </motion.div>
        )}

        {/* Review History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
        >
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Review History</h2>
          </div>
          {reviewHistory.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Clock size={28} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
              <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No reviews yet</p>
              <p className={`mt-1 text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>Your completed code reviews will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {reviewHistory.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.04 }} className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><CheckCircle2 size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{entry.repoName}</p>
                    <p className={`text-xs font-[Inter] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{entry.filePath} · Score: {entry.score}</p>
                  </div>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-300"}`}>{entry.time}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
