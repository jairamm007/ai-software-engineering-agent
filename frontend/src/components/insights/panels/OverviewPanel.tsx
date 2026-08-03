import { Sparkles, Quote } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ProjectInsights } from "@/types/insights";

export default function OverviewPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = insights.summary;

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {insights.overview}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Sparkles size={15} />} label="Primary language" value={s.primaryLanguage} />
        <Stat icon={<Quote size={15} />} label="Modules" value={String(s.moduleCount)} />
        <Stat icon={<Quote size={15} />} label="Files" value={String(s.totalFiles)} />
        <Stat icon={<Quote size={15} />} label="Folders" value={String(s.totalFolders)} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {icon}
        {label}
      </div>
      <p className={`mt-1 truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
