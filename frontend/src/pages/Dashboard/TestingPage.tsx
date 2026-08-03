import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FlaskConical, Play, Search, FileCode2, FolderGit2, CheckCircle2, XCircle, TrendingUp, FileStack, FolderOpen, CheckSquare, Square } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import AIResult from "@/components/repository/AIResult";
import { getRepositories, getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stats = [
  { label: "Total Tests", value: "248", icon: FlaskConical, colorClass: "accent-text-base" },
  { label: "Passed", value: "231", icon: CheckCircle2, color: "emerald" },
  { label: "Failed", value: "12", icon: XCircle, color: "red" },
  { label: "Coverage", value: "87.3%", icon: TrendingUp, color: "cyan" },
];

type TestScope = "single" | "multiple" | "repository";

export default function TestingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<TestScope>("single");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const { data: repoData, isLoading: repoLoading } = useQuery({
    queryKey: ["repository", selectedRepoId],
    queryFn: () => getRepository(selectedRepoId),
    enabled: !!selectedRepoId,
  });

  const files = useMemo(() => repoData?.files.filter((file) => !search || file.path.toLowerCase().includes(search.toLowerCase())) ?? [], [repoData, search]);

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepoId(repoId);
    setSelectedFile("");
    setSelectedFiles(new Set());
    setScope("single");
    setResult("");
    setSearch("");
  };

  const toggleSelectedFile = (path: string) => setSelectedFiles((previous) => {
    const next = new Set(previous);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    return next;
  });
  const canGenerate = !!repoData && (scope === "repository" || (scope === "single" ? !!selectedFile : selectedFiles.size > 0));

  const runTestGen = async (type: "unit" | "integration") => {
    if (!repoData || !canGenerate) return;
    setLoading(true);
    setResult("");
    try {
      const targets = scope === "single" ? selectedFile : Array.from(selectedFiles).join(", ");
      const response = await askRepository({
        question: scope === "repository"
          ? `Generate comprehensive ${type} tests for this entire repository, covering critical modules, integration boundaries, mocks, and edge cases.`
          : `Generate comprehensive ${type} tests for the following ${scope === "multiple" ? "files" : "file"}: ${targets}`,
        repositoryId: repoData.id,
        filePath: scope === "single" ? selectedFile : undefined,
      });
      setResult(response.answer ?? JSON.stringify(response));
    } catch {
      setResult("Failed to generate tests. Please try again.");
    } finally {
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
              <FlaskConical size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                Generate Tests
              </h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Select a repository, choose a file, and generate AI-powered tests
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
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
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              1. Select Repository
            </h2>
            <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose a repository to generate tests for
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
                  Add a repository first to generate tests.
                </p>
                <Link
                  to="/repositories"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg accent-bg px-4 py-2 text-xs font-medium text-white transition-colors hover:opacity-90"
                >
                  Add Repository
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
                          ? "border-[var(--accent)]/30 accent-bg-light shadow-sm ring-1 ring-[var(--accent)]/20"
                          : "border-[var(--accent)]/20 accent-bg-light shadow-sm ring-1 ring-[var(--accent)]/20"
                        : isDark
                          ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selectedRepoId === repo.id
                        ? "accent-bg-light"
                        : isDark ? "bg-white/5" : "bg-slate-100"
                    }`}>
                      <FolderGit2 size={16} className={
                        selectedRepoId === repo.id
                          ? "accent-text-base"
                          : isDark ? "text-slate-400" : "text-slate-500"
                      } />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium font-[Inter] ${
                        selectedRepoId === repo.id
                          ? isDark ? "text-white" : "accent-text-base"
                          : isDark ? "text-slate-200" : "text-slate-700"
                      }`}>
                        {repo.name}
                      </p>
                      <p className={`mt-0.5 truncate text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {repo.githubUrl}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Step 2: Select File + Actions */}
        {selectedRepoId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border shadow-sm ${
              isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                2. Select File to Test
              </h2>
              <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Choose a source file, then pick a test type
              </p>
            </div>

            {repoLoading ? (
              <div className="flex h-32 items-center justify-center">
                <LoadingIndicator size="sm" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 px-5 pt-5 sm:grid-cols-3">
                  {[
                    ["single", "Single File", FileCode2],
                    ["multiple", "Multiple Files", FileStack],
                    ["repository", "Entire Repository", FolderOpen],
                  ].map(([value, label, Icon]) => <button key={value as string} type="button" onClick={() => { setScope(value as TestScope); setSelectedFile(""); setSelectedFiles(new Set()); }} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium ${scope === value ? "accent-bg-light accent-text-base border-[var(--accent)]/30" : isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600"}`}><Icon size={16} /><span>{label as string}</span></button>)}
                </div>
                {scope !== "repository" && <>
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
                  {scope === "multiple" && files.length > 0 && <button type="button" onClick={() => setSelectedFiles(selectedFiles.size === files.length ? new Set() : new Set(files.map((file) => file.path)))} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{selectedFiles.size === files.length ? <CheckSquare size={14} /> : <Square size={14} />}{selectedFiles.size === files.length ? "Deselect all" : `Select all (${files.length})`}</button>}
                  {files.length === 0 && (
                    <p className={`py-4 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
                  )}
                  {files.map((file) => {
                    const ext = getFileExtension(file.path);
                    const typeInfo = getFileTypeInfo(ext);
                    const Icon = typeInfo.icon;
                    const isSelected = scope === "multiple" ? selectedFiles.has(file.path) : selectedFile === file.path;
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => scope === "multiple" ? toggleSelectedFile(file.path) : setSelectedFile(file.path)}
                        className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all font-[Inter] ${
                          isSelected
                            ? isDark
                              ? "accent-bg-light text-white shadow-sm ring-1 ring-[var(--accent)]/20"
                              : "accent-bg-light text-slate-700 shadow-sm ring-1 ring-[var(--accent)]/20"
                            : isDark
                              ? "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isSelected ? "accent-bg-light" : typeInfo.bg
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
                </>}

                <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void runTestGen("unit")}
                      disabled={!canGenerate || loading}
                      className="flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none font-[Inter]"
                    >
                      {loading ? (
                        <>
                          <LoadingIndicator size="sm" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          Generate Unit Tests
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => void runTestGen("integration")}
                      disabled={!canGenerate || loading}
                      className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50 font-[Inter] border-[var(--accent)]/30 accent-text-base accent-bg-light"
                    >
                      {loading ? (
                        <>
                          <LoadingIndicator size="sm" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FlaskConical size={14} />
                          Generate Integration Tests
                        </>
                      )}
                    </button>
                    {(selectedFile || selectedFiles.size > 0 || scope === "repository") && (
                      <div className="flex items-center gap-2 ml-1">
                        <FileCode2 size={14} className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                        <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {scope === "repository" ? "Entire repository" : scope === "multiple" ? `${selectedFiles.size} files selected` : selectedFile}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Result */}
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <AIResult title="Generated Tests" content={result} loading={loading} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
