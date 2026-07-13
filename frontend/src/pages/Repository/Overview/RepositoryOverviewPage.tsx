import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderGit2,
  FileCode2,
  Layers,
  Clock,
  ArrowUpRight,
  Search,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import RepositoryAnalytics from "@/components/repository/RepositoryAnalytics";
import { getRepository } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, formatFileSize, getFileExtension } from "@/utils/fileIcons";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function RepositoryOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [fileSearch, setFileSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  const totalChunks =
    data?.files.reduce((sum, f) => sum + f.chunks.length, 0) ?? 0;
  const extensions = data
    ? [...new Set(data.files.map((f) => f.extension))]
    : [];

  const filteredFiles =
    data?.files.filter(
      (f) => !fileSearch || f.path.toLowerCase().includes(fileSearch.toLowerCase())
    ) ?? [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className={`text-lg font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
            Loading repository...
          </div>
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
            {data.name}
          </h1>
          <p className={`mt-1 text-sm break-all ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {data.githubUrl}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { icon: FolderGit2, label: "Files", value: data.files.length, color: "from-violet-500 to-purple-600" },
            { icon: Layers, label: "Chunks", value: totalChunks, color: "from-fuchsia-500 to-pink-600" },
            { icon: FileCode2, label: "Languages", value: extensions.length, color: "from-cyan-500 to-blue-600" },
            { icon: Clock, label: "Created", value: new Date(data.createdAt).toLocaleDateString(), color: "from-emerald-500 to-teal-600" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              }`}
            >
              <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.color}`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <stat.icon size={16} />
              </div>
              <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RepositoryAnalytics repositoryId={data.id} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border shadow-sm ${
              isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Repository Files
                  </h2>
                  <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {data.files.length} indexed files · Click to open in workspace
                  </p>
                </div>
                <div className="relative">
                  <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className={`w-44 rounded-lg border py-1.5 pl-8 pr-3 text-xs outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div style={{ maxHeight: `${Math.max(140, Math.min(filteredFiles.length * 40 + 20, 520))}px` }} className="overflow-y-auto">
              {filteredFiles.length === 0 && (
                <p className={`py-8 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
              )}
              {filteredFiles.map((file) => {
                const ext = getFileExtension(file.path);
                const typeInfo = getFileTypeInfo(ext);
                const Icon = typeInfo.icon;
                return (
                  <Link
                    key={file.id}
                    to={`/repositories/${data.id}`}
                    state={{ selectedFilePath: file.path }}
                    className={`group flex items-center gap-3 border-b px-5 py-3 transition-colors last:border-b-0 ${
                      isDark
                        ? "border-white/5 hover:bg-white/[0.03]"
                        : "border-slate-50 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeInfo.bg}`}>
                      <Icon size={15} className={typeInfo.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {file.path}
                      </p>
                      <p className={`mt-0.5 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {typeInfo.label} · {file.chunks.length} chunks · {formatFileSize(file.size)}
                      </p>
                    </div>
                    <ArrowUpRight size={14} className={`shrink-0 opacity-0 transition-all group-hover:opacity-100 ${
                      isDark ? "text-violet-400" : "text-violet-500"
                    }`} />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
