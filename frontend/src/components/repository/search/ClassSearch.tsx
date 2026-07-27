import { useTheme } from "@/context/ThemeContext";
import { Box, Share, Lock } from "lucide-react";
import type { ClassSearchResult } from "@/services/semanticSearch";

interface Props {
  results: ClassSearchResult[];
}

export default function ClassSearch({ results }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (results.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <Box size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          No classes found matching your query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Classes
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
              <th className={`px-4 py-2.5 text-left text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>File</th>
              <th className={`px-4 py-2.5 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Methods</th>
              <th className={`px-4 py-2.5 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Exported</th>
              <th className={`px-4 py-2.5 text-right text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {results.map((cls, i) => (
              <tr
                key={`${cls.file}:${cls.line}-${i}`}
                className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Box size={14} className="text-blue-400" />
                    <span className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {cls.name}
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-2.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {cls.file}
                </td>
                <td className={`px-4 py-2.5 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {cls.methods}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {cls.exported ? (
                    <Share size={14} className="mx-auto text-emerald-400" />
                  ) : (
                    <Lock size={14} className={`mx-auto ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                  )}
                </td>
                <td className={`px-4 py-2.5 text-right text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  L{cls.line}-{cls.endLine}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
