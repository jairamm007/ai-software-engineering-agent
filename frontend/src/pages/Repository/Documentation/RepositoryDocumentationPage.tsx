import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Play, RotateCcw, BookOpen,
  File, FolderOpen, CheckSquare, Square, FileStack,
  Copy, Download, Check,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import AIResult from "@/components/repository/AIResult";
import { getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";

type DocScope = "single" | "multiple" | "repository";

const scopeOptions: { id: DocScope; label: string; icon: typeof File; description: string }[] = [
  { id: "single", label: "Single File", icon: File, description: "Generate docs for one file" },
  { id: "multiple", label: "Multiple Files", icon: FileStack, description: "Select several files to document" },
  { id: "repository", label: "Entire Repository", icon: FolderOpen, description: "Generate docs for the whole repo" },
];

export default function RepositoryDocumentationPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [scope, setScope] = useState<DocScope>("single");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  const files = useMemo(
    () => data?.files.filter((f) => !search || f.path.toLowerCase().includes(search.toLowerCase())) ?? [],
    [data, search]
  );

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
    if (!data) return false;
    if (scope === "single") return !!selectedFile;
    if (scope === "multiple") return selectedFiles.size > 0;
    return true;
  }, [data, scope, selectedFile, selectedFiles]);

  const runDocs = async () => {
    if (!data || !canGenerate) return;
    setLoading(true);
    setResult("");
    try {
      let question = "";
      let filePath: string | undefined;

      if (scope === "single") {
        question = `Generate comprehensive documentation for this file including purpose, API reference, parameters, return values, and usage examples: ${selectedFile}`;
        filePath = selectedFile;
      } else if (scope === "multiple") {
        const fileList = Array.from(selectedFiles).join(", ");
        question = `Generate comprehensive documentation for the following files including purpose, API references, parameters, return values, and usage examples: ${fileList}`;
        filePath = undefined;
      } else {
        question = `Generate comprehensive documentation for this entire repository including project overview, module descriptions, architecture, setup instructions, and API references`;
        filePath = undefined;
      }

      const response = await askRepository({ question, repositoryId: data.id, filePath });
      setResult(response.answer ?? JSON.stringify(response));
    } catch {
      setResult("Failed to generate documentation. Please try again.");
    } finally {
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
      ? `docs-${data?.name ?? "repo"}`
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
      ? `docs-${data?.name ?? "repo"}`
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                Documentation
              </h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Generate AI-powered docs for files, multiple files, or this entire repository
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scope Selector */}
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
              Documentation Scope
            </h2>
            <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose what to document for <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{data.name}</span>
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* Scope Options */}
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

            {/* File List (hidden for repository scope) */}
            {scope !== "repository" && (
              <>
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

                <div style={{ maxHeight: `${Math.max(140, Math.min(files.length * 40 + 20, 480))}px` }} className="overflow-hidden overflow-y-auto px-1 py-1">
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
              <div className={`rounded-xl border border-dashed p-6 text-center ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/50"}`}>
                <FolderOpen size={28} className={`mx-auto mb-2 ${isDark ? "text-emerald-400" : "text-emerald-500"}`} />
                <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  Documentation will cover the entire repository
                </p>
                <p className={`mt-1 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  AI will analyze all indexed files and generate comprehensive documentation
                </p>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void runDocs()}
                disabled={!canGenerate || loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none font-[Inter]"
              >
                {loading ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
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
        </motion.div>

        {/* Result */}
        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
