import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { getLanguageStatistics, type LanguageStat } from "@/services/repositoryIntelligence";

interface Props {
  repositoryId: string;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function BarChart({ stats, isDark }: { stats: LanguageStat[]; isDark: boolean }) {
  const maxLines = Math.max(...stats.map(s => s.lines), 1);
  return (
    <div className="space-y-2">
      {stats.map((stat) => (
        <div key={stat.language} className="flex items-center gap-3">
          <span className={`w-36 shrink-0 truncate text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {stat.language}
          </span>
          <div className="relative flex-1 h-6 overflow-hidden rounded-md">
            <div
              className="absolute inset-0 rounded-md opacity-80 transition-all"
              style={{
                width: `${Math.max((stat.lines / maxLines) * 100, 2)}%`,
                backgroundColor: stat.color,
              }}
            />
            <span className="relative z-10 flex h-full items-center px-2 text-xs font-medium text-white mix-blend-difference">
              {formatNumber(stat.lines)} lines
            </span>
          </div>
          <span className={`w-14 text-right text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {stat.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ stats }: { stats: LanguageStat[] }) {
  const total = stats.reduce((sum, s) => sum + s.bytes, 0);
  let cumulative = 0;
  const radius = 60;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const segments = stats.slice(0, 10).map((stat) => {
    const pct = total > 0 ? stat.bytes / total : 0;
    const offset = cumulative;
    cumulative += pct;
    return { ...stat, offset, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.pct * circumference} ${circumference}`}
            strokeDashoffset={`${-seg.offset * circumference}`}
            transform="rotate(-90 80 80)"
            className="transition-all"
          />
        ))}
        <text x="80" y="76" textAnchor="middle" fill="currentColor" className="text-lg font-bold">
          {stats.length}
        </text>
        <text x="80" y="94" textAnchor="middle" fill="currentColor" className="text-xs opacity-50">
          languages
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="truncate">{seg.language}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LanguageStatistics({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const query = useQuery({
    queryKey: ["language-stats", repositoryId],
    queryFn: () => getLanguageStatistics(repositoryId),
  });

  const totals = useMemo(() => {
    if (!query.data) return { files: 0, lines: 0, bytes: 0 };
    return query.data.reduce(
      (acc, s) => ({ files: acc.files + s.files, lines: acc.lines + s.lines, bytes: acc.bytes + s.bytes }),
      { files: 0, lines: 0, bytes: 0 }
    );
  }, [query.data]);

  if (query.isLoading) return <div className={`h-[300px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data?.length) return <p className="text-slate-500">No language data found.</p>;

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap gap-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="text-center px-4">
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{query.data.length}</p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Languages</p>
        </div>
        <div className="text-center px-4">
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{formatNumber(totals.files)}</p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Files</p>
        </div>
        <div className="text-center px-4">
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{formatNumber(totals.lines)}</p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines</p>
        </div>
      </div>
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines of Code by Language</h3>
        <BarChart stats={query.data} isDark={isDark} />
      </div>
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Distribution</h3>
        <DonutChart stats={query.data} />
      </div>
    </div>
  );
}
