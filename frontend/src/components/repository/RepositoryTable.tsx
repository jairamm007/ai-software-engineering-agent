import { Link } from "react-router-dom";
import { Trash2, FolderGit2, FileCode2, Layers, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteRepository } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { RepositoryListItem } from "@/types/repository";

interface Props {
  repositories: RepositoryListItem[];
}

export default function RepositoryTable({ repositories }: Props) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-sm ${
      isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
    }`}>
      <table className="w-full border-collapse">
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
                      isDark ? "bg-violet-500/15" : "bg-violet-50"
                    }`}>
                      <FolderGit2 size={16} className="text-violet-500" />
                    </div>
                    <div>
                      <Link
                        to={`/repositories/${repo.id}`}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${
                          isDark ? "text-white hover:text-violet-400" : "text-slate-900 hover:text-violet-600"
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
                    isDark ? "bg-fuchsia-500/10 text-fuchsia-400" : "bg-fuchsia-50 text-fuchsia-600"
                  }`}>
                    <Layers size={12} />
                    {chunks}
                  </div>
                </td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {new Date(repo.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
