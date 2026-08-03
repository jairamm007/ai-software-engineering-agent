import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/pipeline/Badge";
import type { ProjectInsights } from "@/types/insights";

export default function ModulesPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (insights.modules.length === 0) {
    return (
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        No modules detected for this repository.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}>
              <th className="px-4 py-2.5 font-semibold">Module</th>
              <th className="px-4 py-2.5 font-semibold">Path</th>
              <th className="px-4 py-2.5 text-right font-semibold">Files</th>
              <th className="px-4 py-2.5 text-right font-semibold">Lines</th>
              <th className="px-4 py-2.5 font-semibold">Dependencies</th>
            </tr>
          </thead>
          <tbody>
            {insights.modules.map((m, index) => (
              <tr key={m.path} className={`${index % 2 === 0 ? (isDark ? "bg-white/[0.02]" : "bg-slate-50/60") : ""}`}>
                <td className={`px-4 py-2.5 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{m.name}</td>
                <td className={`px-4 py-2.5 font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.path}</td>
                <td className={`px-4 py-2.5 text-right ${isDark ? "text-slate-300" : "text-slate-700"}`}>{m.fileCount}</td>
                <td className={`px-4 py-2.5 text-right ${isDark ? "text-slate-300" : "text-slate-700"}`}>{m.lineCount}</td>
                <td className="px-4 py-2.5">
                  {m.dependencies.length === 0 ? (
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.dependencies.map((d) => (
                        <Badge key={d} className="bg-slate-500/10 text-slate-500">{d}</Badge>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        {insights.modules.map((m) => (
          <div key={m.path} className={`rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{m.name}</p>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.responsibilities.join("; ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
