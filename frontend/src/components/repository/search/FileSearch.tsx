import { useTheme } from "@/context/ThemeContext";
import { FileText } from "lucide-react";
import type { FileSearchResult } from "@/services/semanticSearch";

interface Props {
  results: FileSearchResult[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtColor(ext: string): string {
  const colors: Record<string, string> = {
    ".ts": "bg-blue-500/20 text-blue-400",
    ".tsx": "bg-blue-500/20 text-blue-400",
    ".js": "bg-yellow-500/20 text-yellow-400",
    ".jsx": "bg-yellow-500/20 text-yellow-400",
    ".py": "bg-green-500/20 text-green-400",
    ".java": "bg-red-500/20 text-red-400",
    ".go": "bg-cyan-500/20 text-cyan-400",
    ".rs": "bg-orange-500/20 text-orange-400",
    ".json": "bg-yellow-500/20 text-yellow-300",
    ".md": "bg-slate-500/20 text-slate-300",
  };
  return colors[ext] || "bg-slate-500/20 text-slate-400";
}

export default function FileSearch({ results }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (results.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <FileText size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          No files found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Files
        </h3>
        <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {results.length} results
        </span>
      </div>

      <div className={`overflow-hidden rounded-xl border ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={isDark ? "bg-white/5" : "bg-slate-50"}>
              <th className={`px-4 py-2.5 text-left text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Name</th>
              <th className={`px-4 py-2.5 text-left text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Path</th>
              <th className={`px-4 py-2.5 text-right text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines</th>
              <th className={`px-4 py-2.5 text-right text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Size</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {results.map((file) => (
              <tr
                key={file.path}
                className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                    <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {file.name}
                    </span>
                    {file.extension && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getExtColor(file.extension)}`}>
                        {file.extension.slice(1)}
                      </span>
                    )}
                  </div>
                </td>
                <td className={`px-4 py-2.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {file.path}
                </td>
                <td className={`px-4 py-2.5 text-right text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {file.lines}
                </td>
                <td className={`px-4 py-2.5 text-right text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {formatSize(file.size)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
