import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  FileCode2,
  Layers,
  Cpu,
  Plus,
  ArrowRight,
  Sparkles,
  GitBranch,
  MessageSquare,
  BookOpen,
  Shield,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { useTheme } from "@/context/ThemeContext";

import { getRepositories } from "@/services/repository";
import type { RepositoryListItem } from "@/types/repository";

const capabilities = [
  { icon: GitBranch, label: "Code Review & Analysis", color: "accent-text-base" },
  { icon: BookOpen, label: "Architecture Documentation", color: "accent-text-base" },
  { icon: Layers, label: "Dependency Graph Analysis", color: "text-cyan-500" },
  { icon: MessageSquare, label: "AI Chat Assistant", color: "text-emerald-500", link: "/chat" },
  { icon: Shield, label: "Security Scanning", color: "text-amber-500" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data = [], isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const totalRepositories = data.length;
  const totalFiles = data.reduce(
    (sum: number, repo: RepositoryListItem) => sum + repo._count.files,
    0
  );
  const totalChunks = data.reduce(
    (sum: number, repo: RepositoryListItem) =>
      sum + repo.files.reduce(
        (chunkSum: number, file: { _count: { chunks: number } }) => chunkSum + file._count.chunks,
        0
      ),
    0
  );

  const recentRepos = [...data]
    .sort((a: RepositoryListItem, b: RepositoryListItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
              Dashboard
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Overview of your AI-powered software engineering workspace
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard title="Repositories" value={totalRepositories} icon={<FolderGit2 size={20} />} gradient="accent-gradient" index={0} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Files Indexed" value={totalFiles} icon={<FileCode2 size={20} />} gradient="accent-gradient" index={1} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Code Chunks" value={totalChunks} icon={<Layers size={20} />} gradient="from-cyan-500 to-blue-600" index={2} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="AI Providers" value={4} icon={<Cpu size={20} />} gradient="from-emerald-500 to-teal-600" index={3} />
        </motion.div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              Recent Repositories
            </h2>
            {data.length > 0 && (
              <Link to="/repositories" className="flex items-center gap-1 text-sm font-medium accent-text-base hover:opacity-80">
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className={`rounded-2xl border p-10 text-center shadow-sm ${
              isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
            }`}>
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>Loading repositories...</p>
            </div>
          ) : recentRepos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border border-dashed p-12 text-center shadow-sm ${
                isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-white"
              }`}
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl accent-bg-light`}>
                <FolderGit2 size={28} className="accent-text-base" />
              </div>
              <p className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
                No repositories yet
              </p>
              <p className={`mb-6 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                Analyze a GitHub repository to get started.
              </p>
              <Link
                to="/repositories"
                className="inline-flex items-center gap-2 rounded-xl accent-gradient px-6 py-3 text-sm font-medium text-white shadow-lg accent-shadow transition-shadow hover:shadow-xl hover:accent-shadow-lg"
              >
                <Plus size={16} /> Add Repository
              </Link>
            </motion.div>
          ) : (
            <div className={`overflow-x-auto rounded-2xl border shadow-sm ${
              isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
            }`}>
              <table className="w-full border-collapse min-w-[500px]">
                <thead className={isDark ? "bg-slate-700/50" : "bg-slate-50/80"}>
                  <tr>
                    {["Repository", "Files", "Chunks", "Created"].map((h) => (
                      <th key={h} className={`p-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRepos.map((repo: RepositoryListItem, index: number) => {
                    const files = repo._count.files;
                    const chunks = repo.files.reduce(
                      (sum: number, file: { _count: { chunks: number } }) => sum + file._count.chunks, 0
                    );
                    return (
                      <motion.tr
                        key={repo.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className={`border-t transition-colors ${
                          isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="p-4">
                          <Link to={`/repositories/${repo.id}`} className="flex items-center gap-2 font-medium accent-text-base hover:opacity-80">
                            <FolderGit2 size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
                            {repo.name}
                          </Link>
                        </td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{files}</td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{chunks}</td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(repo.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/repositories"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 accent-bg-light text-slate-200 hover:border-[var(--accent)]/30 hover:shadow-md"
                    : "border-slate-100 accent-bg-light text-slate-700 hover:border-[var(--accent)]/20 hover:shadow-md"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-gradient text-white shadow-sm">
                  <Plus size={14} />
                </div>
                Add New Repository
              </Link>
              <Link
                to="/repositories"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 bg-slate-700/50 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"
                }`}>
                  <FolderGit2 size={14} />
                </div>
                Browse All Repositories
              </Link>
              <Link
                to="/chat"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 accent-bg-light text-slate-200 hover:border-[var(--accent)]/30 hover:shadow-md"
                    : "border-slate-100 accent-bg-light text-slate-700 hover:border-[var(--accent)]/20 hover:shadow-md"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-gradient text-white shadow-sm">
                  <MessageSquare size={14} />
                </div>
                Start AI Chat
              </Link>
            </div>
          </div>

          {/* AI Capabilities */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              AI Capabilities
            </h3>
            <ul className="space-y-3">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                const content = (
                  <motion.li
                    key={cap.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <Icon size={16} className={cap.color} />
                    <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {cap.label}
                    </span>
                  </motion.li>
                );

                if ("link" in cap && cap.link) {
                  return (
                    <Link key={cap.label} to={cap.link} className="block transition-opacity hover:opacity-80">
                      {content}
                    </Link>
                  );
                }

                return content;
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
