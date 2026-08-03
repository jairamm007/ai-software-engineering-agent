import { GitCommitHorizontal, Users, Clock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ProjectInsights } from "@/types/insights";

const EVENT_DOT: Record<string, string> = {
  created: "bg-slate-400",
  initial_commit: "bg-emerald-500",
  milestone: "bg-blue-500",
  last_commit: "bg-amber-500",
  module_added: "bg-purple-500",
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

export default function TimelinePanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = insights.timeline;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={<GitCommitHorizontal size={15} />} label="Total commits" value={String(t.totalCommits)} />
        <Stat icon={<Users size={15} />} label="Contributors" value={String(t.contributors)} />
        <Stat icon={<Clock size={15} />} label="Last active" value={t.lastActiveAt ? formatDate(t.lastActiveAt) : "N/A"} />
      </div>

      {t.events.length === 0 ? (
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          No timeline events available. Run an insight refresh once the repository has commits.
        </p>
      ) : (
        <ol className="relative ml-3 space-y-4 border-l-2 border-slate-200 dark:border-white/10">
          {t.events.map((event) => (
            <li key={`${event.date}-${event.label}`} className="relative pl-6">
              <span className={`absolute -left-[5.5px] top-1 h-2.5 w-2.5 rounded-full ${EVENT_DOT[event.type] ?? "bg-slate-400"}`} />
              <div className="flex flex-wrap items-center gap-2">
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{event.label}</p>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{formatDate(event.date)}</span>
                {event.author && (
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>· {event.author}</span>
                )}
              </div>
              {event.description && (
                <p className={`mt-0.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{event.description}</p>
              )}
            </li>
          ))}
        </ol>
      )}
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
      <p className={`mt-1 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
