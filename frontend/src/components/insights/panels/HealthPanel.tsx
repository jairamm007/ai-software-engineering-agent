import { useTheme } from "@/context/ThemeContext";
import type { ProjectInsights } from "@/types/insights";

const scoreToLabel = (score: number | null): string => {
  if (score === null) return "No data";
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Fair";
  if (score >= 40) return "At risk";
  return "Critical";
};

const scoreToColor = (score: number | null): string => {
  if (score === null) return "bg-slate-300 dark:bg-white/15";
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

export default function HealthPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const rows: { area: string; score: number | null }[] = [
    { area: "Documentation", score: insights.docHealth },
    { area: "Security", score: insights.securityHealth },
    { area: "Performance", score: insights.performanceHealth },
    { area: "Maintainability", score: insights.maintainabilityHealth },
    { area: "Overall", score: insights.overallHealth },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.area}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{row.area}</p>
            <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {row.score === null ? "N/A" : `${row.score}/100`} · {scoreToLabel(row.score)}
            </span>
          </div>
          <div className={`mt-1.5 h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
            <div
              className={`h-full rounded-full transition-all ${scoreToColor(row.score)}`}
              style={{ width: row.score === null ? "0%" : `${row.score}%` }}
            />
          </div>
        </div>
      ))}

      <p className={`rounded-lg border p-3 text-xs leading-relaxed ${isDark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
        Scores are derived from the latest documentation, security, performance and code-review data. When a
        source has no data, its score is shown as N/A rather than 0, and the overall score averages only the
        areas with data.
      </p>
    </div>
  );
}
