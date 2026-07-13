import type { Repository } from "@/types/repository";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  repository: Repository;
}

export default function RepositoryOverview({ repository }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const totalChunks = repository.files.reduce((sum, file) => sum + file.chunks.length, 0);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className={`rounded-xl border p-6 shadow-sm ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        <h3 className={`mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Files</h3>
        <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{repository.files.length}</p>
      </div>
      <div className={`rounded-xl border p-6 shadow-sm ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        <h3 className={`mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Chunks</h3>
        <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{totalChunks}</p>
      </div>
      <div className={`rounded-xl border p-6 shadow-sm ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        <h3 className={`mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Indexed</h3>
        <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          {new Date(repository.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
