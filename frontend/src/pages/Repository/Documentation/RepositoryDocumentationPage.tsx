import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Play, RotateCcw, BookOpen } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import AIResult from "@/components/repository/AIResult";
import { getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, getFileExtension, formatFileSize } from "@/utils/fileIcons";

export default function RepositoryDocumentationPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedFile, setSelectedFile] = useState<string>("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  const files =
    data?.files.filter(
      (f) => !search || f.path.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const runDocs = async () => {
    if (!selectedFile || !data) return;
    setLoading(true);
    setResult("");
    try {
      const response = await askRepository({
        question: `Generate comprehensive documentation for this file including purpose, API reference, parameters, return values, and usage examples: ${selectedFile}`,
        repositoryId: data.id,
        filePath: selectedFile,
      });
      setResult(response.answer ?? JSON.stringify(response));
    } catch {
      setResult("Failed to generate documentation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className={`text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Loading repository...</p>
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
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Documentation
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Generate AI-powered documentation with API references and usage examples
              </p>
            </div>
          </div>
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
              Select File to Document
            </h2>
            <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Choose a file below, then generate AI documentation
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
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-emerald-500"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          <div style={{ maxHeight: `${Math.max(140, Math.min(files.length * 40 + 20, 520))}px` }} className="overflow-y-auto px-3 py-2">
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
                        ? "bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                      : isDark
                        ? "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
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

          <div className={`border-t px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void runDocs()}
                disabled={!selectedFile || loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
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
              {selectedFile && (
                <span className={`self-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {selectedFile}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {(result || loading) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <AIResult title="Documentation" content={result} />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
