import { useTheme } from "@/context/ThemeContext";
import { FunctionSquare, Export, Lock } from "lucide-react";
import type { FunctionSearchResult } from "@/services/semanticSearch";

interface Props {
  results: FunctionSearchResult[];
}

export default function FunctionSearch({ results }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (results.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <FunctionSquare size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          No functions found matching your query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Functions
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
              <th className={`px-4 py-2.5 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Params</th>
              <th className={`px-4 py-2.5 text-center text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Exported</th>
              <th className={`px-4 py-2.5 text-right text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
            {results.map((fn, i) => (
              <tr
                key={`${fn.file}:${fn.line}-${i}`}
                className={`transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FunctionSquare size={14} className="text-purple-400" />
                    <span className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                      {fn.name}
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-2.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {fn.file}
                </td>
                <td className={`px-4 py-2.5 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {fn.params}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {fn.exported ? (
                    <Export size={14} className="mx-auto text-emerald-400" />
                  ) : (
                    <Lock size={14} className={`mx-auto ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                  )}
                </td>
                <td className={`px-4 py-2.5 text-right text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  L{fn.line}-{fn.endLine}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
