import { useTheme } from "@/context/ThemeContext";
import type { ProjectInsights } from "@/types/insights";

export default function DependenciesPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (insights.dependencies.edges.length === 0) {
    return (
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        No inter-module dependencies detected.
      </p>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className={isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}>
            <th className="px-4 py-2.5 font-semibold">From</th>
            <th className="px-4 py-2.5 font-semibold">To</th>
            <th className="px-4 py-2.5 text-right font-semibold">Weight</th>
          </tr>
        </thead>
        <tbody>
          {insights.dependencies.edges.map((edge, index) => (
            <tr key={`${edge.from}->${edge.to}`} className={index % 2 === 0 ? (isDark ? "bg-white/[0.02]" : "bg-slate-50/60") : ""}>
              <td className={`px-4 py-2.5 font-mono text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{edge.from}</td>
              <td className={`px-4 py-2.5 font-mono text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>→ {edge.to}</td>
              <td className={`px-4 py-2.5 text-right ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                  {edge.weight}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={`px-4 py-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {insights.dependencies.nodes.length} modules · {insights.dependencies.edges.length} dependency edges
      </p>
    </div>
  );
}
