import type { Repository } from "@/types/repository";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  repository: Repository;
}

export default function RepositoryCard({ repository }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
    }`}>
      <h2 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{repository.name}</h2>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        Files: {repository.files.length}
      </p>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        URL: {repository.githubUrl}
      </p>
    </div>
  );
}
