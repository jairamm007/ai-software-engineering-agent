import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, FolderGit2, FileCode2, Layers, ExternalLink, Star, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteRepository, toggleFavorite, reindexRepository } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { RepositoryListItem } from "@/types/repository";

interface Props {
  repositories: RepositoryListItem[];
}

export default function RepositoryTable({ repositories }: Props) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this repository?\n\nThis action cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteRepository(id);
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    } catch {
      alert("Failed to delete repository.");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    } catch {
      alert("Failed to toggle favorite.");
    }
  };

  const handleReindex = async (id: string) => {
    const confirmed = window.confirm("Re-index this repository?\n\nThis may take a while.");
    if (!confirmed) return;
    setReindexingId(id);
    try {
      await reindexRepository(id);
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    } catch {
      alert("Failed to re-index repository.");
    } finally {
      setReindexingId(null);
    }
  };

  return (
    <div className={`overflow-x-auto rounded-2xl border shadow-sm ${
      isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
    }`}>
      <table className="w-full border-collapse min-w-[600px]">
        <thead className={isDark ? "bg-white/[0.03]" : "bg-slate-50/80"}>
          <tr>
            {[
              { label: "Repository", icon: FolderGit2 },
              { label: "Files", icon: FileCode2 },
              { label: "Chunks", icon: Layers },
              { label: "Created", icon: null },
              { label: "Actions", icon: null },
            ].map((h) => (
              <th key={h.label} className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                <div className="flex items-center gap-1.5">
                  {h.icon && <h.icon size={12} />}
                  {h.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {repositories.map((repo) => {
            const files = repo._count.files;
            const chunks = repo.files.reduce((sum, file) => sum + file._count.chunks, 0);
            return (
              <tr key={repo.id} className={`group border-t transition-colors ${
                isDark ? "border-white/5 hover:bg-white/[0.03]" : "border-slate-100 hover:bg-slate-50/80"
              }`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isDark ? "bg-[var(--accent)]/15" : "bg-[var(--accent-light)]"
                    }`}>
                      <FolderGit2 size={16} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <Link
                        to={`/repositories/${repo.id}`}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${
                          isDark ? "text-white hover:text-[var(--accent)]" : "text-slate-900 hover:text-[var(--accent)]"
                        }`}
                      >
                        {repo.name}
                        <ExternalLink size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                      <p className={`mt-0.5 max-w-[300px] truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {repo.githubUrl}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}>
                    <FileCode2 size={12} />
                    {files}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    isDark ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--accent-light)] text-[var(--accent)]"
                  }`}>
                    <Layers size={12} />
                    {chunks}
                  </div>
                </td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {new Date(repo.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={repo.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => handleToggleFavorite(repo.id)}
                      className={`rounded-lg p-2 transition-all ${
                        isDark
                          ? repo.isFavorite
                            ? "text-amber-400 hover:bg-amber-500/10"
                            : "text-slate-500 hover:bg-amber-500/10 hover:text-amber-400"
                          : repo.isFavorite
                            ? "text-amber-500 hover:bg-amber-50"
                            : "text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                      }`}
                    >
                      <Star size={16} fill={repo.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      title="Re-index Repository"
                      disabled={reindexingId === repo.id}
                      onClick={() => handleReindex(repo.id)}
                      className={`rounded-lg p-2 transition-all disabled:opacity-50 ${
                        isDark
                          ? "text-slate-500 hover:bg-violet-500/10 hover:text-violet-400"
                          : "text-slate-400 hover:bg-violet-50 hover:text-violet-500"
                      }`}
                    >
                      <RefreshCw size={16} className={reindexingId === repo.id ? "animate-spin" : ""} />
                    </button>
                    <button
                      type="button"
                      title="Delete Repository"
                      onClick={() => handleDelete(repo.id)}
                      className={`rounded-lg p-2 transition-all ${
                        isDark
                          ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                          : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
