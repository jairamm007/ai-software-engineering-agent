import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FolderGit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  User,
  HardDrive,
  Database,
  BarChart3,
  GitBranch,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  listAllRepositories,
  deleteRepository,
  getRepositoryStats,
  type AdminRepository,
  type RepositoryStats,
} from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function AdminRepositoriesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [repos, setRepos] = useState<AdminRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState<RepositoryStats | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAllRepositories({
        search: search || undefined,
        page,
        limit: 10,
      });
      setRepos(result.repositories);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void (async () => {
      await fetchRepos();
    })();
    getRepositoryStats()
      .then(setRepoStats)
      .catch(() => {});
  }, [fetchRepos]);

  const handleDelete = async (repoId: string) => {
    try {
      await deleteRepository(repoId);
      toast.success("Repository deleted");
      setConfirmDelete(null);
      fetchRepos();
    } catch {
      toast.error("Failed to delete repository");
    }
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`space-y-6 ${isDark ? "bg-[#0a0a0f] text-white" : "bg-[#f8fafc] text-slate-900"} min-h-full`}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <GitBranch size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Repository Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              View and manage all indexed repositories
            </p>
          </div>
        </div>
      </motion.div>

      {repoStats && (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: FolderGit2,
              label: "Total Repos",
              value: repoStats.totalRepos,
              gradient: "from-cyan-500 to-blue-600",
            },
            {
              icon: FileCode2,
              label: "Total Files",
              value: repoStats.totalFiles,
              gradient: "from-emerald-500 to-teal-600",
            },
            {
              icon: Database,
              label: "Total Chunks",
              value: repoStats.totalChunks,
              gradient: "from-violet-500 to-purple-600",
            },
            {
              icon: HardDrive,
              label: "Storage Used",
              value: `${repoStats.totalStorageMB} MB`,
              gradient: "from-amber-500 to-orange-600",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:scale-[1.02] ${
                isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`}
              />
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
              >
                <s.icon size={18} />
              </div>
              <p
                className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {repoStats && repoStats.filesByExtension.length > 0 && (
        <motion.div
          variants={fadeUp}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}
        >
          <div
            className={`flex items-center gap-2 border-b px-5 py-3.5 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            <BarChart3 size={15} className="text-rose-400" />
            <h3 className="text-sm font-bold">File Types Distribution</h3>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {repoStats.filesByExtension.slice(0, 10).map((ext, i) => {
              const pillColors = [
                isDark
                  ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/20"
                  : "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200",
                isDark
                  ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
                isDark
                  ? "bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20"
                  : "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
                isDark
                  ? "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20"
                  : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
                isDark
                  ? "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20"
                  : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
                isDark
                  ? "bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20"
                  : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
                isDark
                  ? "bg-pink-500/10 text-pink-300 ring-1 ring-inset ring-pink-500/20"
                  : "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200",
                isDark
                  ? "bg-teal-500/10 text-teal-300 ring-1 ring-inset ring-teal-500/20"
                  : "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
              ];
              return (
                <span
                  key={ext.extension}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${
                    pillColors[i % pillColors.length]
                  }`}
                >
                  {ext.extension || "no ext"}
                  <span className="opacity-60">{ext.count}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
            <input
              type="text"
              placeholder="Search repositories by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-[13px] outline-none transition-all ${
                isDark
                  ? "border-white/[0.06] bg-[var(--card-bg)] text-white placeholder:text-slate-600 focus:border-rose-500/50"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50"
              }`}
            />
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                {["Repository", "Owner", "Files", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                      h === "Actions" ? "text-right " : ""
                    }${h === "Files" ? "hidden md:table-cell " : ""}${h === "Created" ? "hidden lg:table-cell " : ""}${h === "Owner" ? "hidden sm:table-cell " : ""}${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <LoadingIndicator size="sm" />
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Loading repositories...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : repos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-5 py-16 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    No repositories found
                  </td>
                </tr>
              ) : (
                repos.map((repo) => (
                  <tr
                    key={repo.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isDark ? "bg-white/[0.04]" : "bg-slate-100"
                          }`}
                        >
                          <FolderGit2 size={16} className="text-cyan-500" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                          >
                            {repo.name}
                          </p>
                          <p
                            className={`truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {repo.githubUrl}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <User
                          size={12}
                          className={isDark ? "text-slate-500" : "text-slate-400"}
                        />
                        <span
                          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {repo.userName}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span
                        className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        <FileCode2 size={12} /> {repo.fileCount}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span
                        className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={repo.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDark
                              ? "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          title="Open in GitHub"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(repo.id)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDark
                              ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                              : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                          title="Delete repository"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-5 py-3 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Page {page} of {pagination.pages} ({pagination.total} repos)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"
                } disabled:opacity-30`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"
                } disabled:opacity-30`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold">Delete Repository</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                This will permanently delete this repository and all its indexed data. This action
                cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark
                      ? "text-slate-300 hover:bg-white/[0.04]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(confirmDelete)}
                  className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600"
                >
                  Delete Repository
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
