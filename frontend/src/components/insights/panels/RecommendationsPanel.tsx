import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/pipeline/Badge";
import type { ProjectInsights, Recommendation } from "@/types/insights";

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-500/15 text-red-500",
  medium: "bg-amber-500/15 text-amber-600",
  low: "bg-slate-500/15 text-slate-500",
};

const CATEGORY_BADGE: Record<string, string> = {
  security: "bg-red-500/10 text-red-500",
  performance: "bg-amber-500/10 text-amber-600",
  code_quality: "bg-blue-500/10 text-blue-500",
  documentation: "bg-purple-500/10 text-purple-500",
  general: "bg-slate-500/10 text-slate-500",
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  security: <AlertTriangle size={14} />,
  performance: <Info size={14} />,
  code_quality: <AlertCircle size={14} />,
  documentation: <Info size={14} />,
  general: <Info size={14} />,
};

export default function RecommendationsPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (insights.recommendations.length === 0) {
    return (
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        No recommendations available yet. Refresh insights after a security scan, performance run or code review.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {insights.recommendations.map((rec: Recommendation, index) => (
        <div key={`${rec.category}-${index}`} className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SEVERITY_BADGE[rec.severity] ?? SEVERITY_BADGE.low}>
              {rec.severity.toUpperCase()}
            </Badge>
            <Badge className={CATEGORY_BADGE[rec.category] ?? CATEGORY_BADGE.general}>
              {CATEGORY_ICON[rec.category]}
              {rec.category.replace("_", " ")}
            </Badge>
          </div>
          <p className={`mt-2 text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{rec.text}</p>
          {rec.detail && (
            <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{rec.detail}</p>
          )}
        </div>
      ))}
    </div>
  );
}
