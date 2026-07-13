import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteRepository } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { Repository } from "@/types/repository";

interface Props {
  repositories: Repository[];
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
    <div className={`overflow-hidden rounded-xl border shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
    }`}>
      <table className="w-full border-collapse">
        <thead className={isDark ? "bg-white/5" : "bg-slate-100"}>
          <tr>
            <th className={`p-4 text-left font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Repository</th>
            <th className={`p-4 text-left font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Files</th>
            <th className={`p-4 text-left font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Chunks</th>
            <th className={`p-4 text-left font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Created</th>
            <th className={`w-20 text-center font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repo) => {
            const files = repo.files.length;
            const chunks = repo.files.reduce((sum, file) => sum + file.chunks.length, 0);
            return (
              <tr key={repo.id} className={`border-t transition-colors ${
                isDark ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50"
              }`}>
                <td className="p-4">
                  <Link to={`/repositories/${repo.id}`} className="font-medium text-violet-500 hover:text-violet-400 hover:underline">
                    {repo.name}
                  </Link>
                </td>
                <td className={`p-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{files}</td>
                <td className={`p-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{chunks}</td>
                <td className={`p-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {new Date(repo.createdAt).toLocaleDateString()}
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    title="Delete Repository"
                    onClick={() => handleDelete(repo.id)}
                    className={`rounded-lg p-2 transition-colors ${
                      isDark ? "hover:bg-red-500/10 hover:text-red-400" : "hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Trash2 size={18} />
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
