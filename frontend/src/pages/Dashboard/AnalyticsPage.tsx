import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FileCode2,
  FolderGit2,
  Layers,
  Code2,
  GitBranch,
} from "lucide-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getRepositories, getRepository } from "@/services/repository";

const EXT_COLORS: Record<string, string> = {
  ts: "#3b82f6",
  tsx: "#60a5fa",
  js: "#facc15",
  jsx: "#fde047",
  py: "#22c55e",
  css: "#a855f7",
  html: "#f97316",
  json: "#9ca3af",
  md: "#64748b",
  yml: "#f472b6",
  yaml: "#f472b6",
  sh: "#14b8a6",
  go: "#06b6d4",
  rs: "#ef4444",
  java: "#eab308",
};

const formatBytes = (b: number) => {
  if (b === 0) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const card = isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200";
  const heading = `font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`;
  const muted = `text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`;
  const bigVal = `text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`;
  const rowVal = `text-sm font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`;

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const repoQueries = useQueries({
    queries: (repos ?? []).map((r) => ({
      queryKey: ["repository", r.id],
      queryFn: () => getRepository(r.id),
      enabled: !!repos,
    })),
  });

  const allFiles = useMemo(
    () =>
      repoQueries
        .filter((q) => q.isSuccess && q.data)
        .flatMap((q) => q.data!.files),
    [repoQueries]
  );

  const stats = useMemo(() => {
    const totalRepos = repos?.length ?? 0;
    const totalFiles = allFiles.length;
    const totalChunks = allFiles.reduce((sum, f) => sum + f.chunks.length, 0);
    const totalSymbols = allFiles.reduce(
      (sum, f) =>
        sum +
        f.chunks.reduce(
          (cs, c) =>
            cs + (c.content.match(/\b[a-zA-Z_]\w*\b/g)?.length ?? 0),
          0
        ),
      0
    );
    const extMap: Record<string, number> = {};
    allFiles.forEach((f) => {
      const ext = f.extension?.replace(".", "") || "other";
      extMap[ext] = (extMap[ext] || 0) + 1;
    });
    const languages = Object.entries(extMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const sizes = allFiles.map((f) => f.size).filter((s) => s > 0);
    const largest = sizes.length ? Math.max(...sizes) : 0;
    const smallest = sizes.length ? Math.min(...sizes) : 0;
    const avgSize = sizes.length
      ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)
      : 0;
    return { totalRepos, totalFiles, totalChunks, totalSymbols, languages, largest, smallest, avgSize };
  }, [repos, allFiles]);

  const maxLang = stats.languages.length ? stats.languages[0][1] : 1;
  const topCards = [
    { label: "Total Repositories", value: stats.totalRepos, icon: FolderGit2, color: "accent-text-base" },
    { label: "Total Files", value: stats.totalFiles, icon: FileCode2, color: "accent-text-base" },
    { label: "Total Chunks", value: stats.totalChunks, icon: Layers, color: "text-cyan-500" },
    { label: "Code Symbols", value: stats.totalSymbols, icon: Code2, color: "text-emerald-500" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-64">
          <div className={muted}>Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (repos && repos.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-12 text-center ${card}`}>
            <BarChart3 size={40} className="mx-auto mb-4 accent-text-base opacity-60" />
            <h2 className={`font-[Outfit] text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>No Analytics Yet</h2>
            <p className={`text-sm font-[Inter] max-w-md mx-auto ${muted}`}>Analyze a repository to see language breakdown, file distribution, and code complexity metrics.</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`font-[Outfit] text-xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Analytics</h1>
          <p className={muted}>Insights across {stats.totalRepos} repositories</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topCards.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                <s.icon size={16} className={s.color} />
              </div>
              <p className={bigVal}>{s.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Language Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="accent-text-base" />
            <h2 className={heading}>Language Breakdown</h2>
          </div>
          {stats.languages.length === 0 ? (
            <p className={muted}>No file data available.</p>
          ) : (
            <div className="space-y-3">
              {stats.languages.map(([ext, count], i) => (
                <motion.div
                  key={ext}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className={`w-12 shrink-0 text-xs font-mono font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>.{ext}</span>
                  <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxLang) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: EXT_COLORS[ext] || "#64748b" }}
                    />
                  </div>
                  <span className={`w-14 text-right text-xs font-[Inter] tabular-nums ${isDark ? "text-slate-400" : "text-slate-500"}`}>{count}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Repo Stats + Complexity grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Repository Stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex items-center gap-2 mb-5">
              <GitBranch size={16} className="text-cyan-500" />
              <h2 className={heading}>Repository Stats</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Total Repos", v: stats.totalRepos },
                { label: "Total Files", v: stats.totalFiles },
                { label: "Total Chunks", v: stats.totalChunks },
                { label: "Code Symbols", v: stats.totalSymbols },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className={muted}>{r.label}</span>
                  <span className={rowVal}>{r.v.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* File Complexity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-emerald-500" />
              <h2 className={heading}>File Complexity</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Largest File", v: formatBytes(stats.largest) },
                { label: "Smallest File", v: formatBytes(stats.smallest) },
                { label: "Avg File Size", v: formatBytes(stats.avgSize) },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className={muted}>{r.label}</span>
                  <span className={rowVal}>{r.v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* File Distribution Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <FileCode2 size={16} className="accent-text-base" />
            <h2 className={heading}>File Distribution by Extension</h2>
          </div>
          {stats.languages.length === 0 ? (
            <p className={muted}>No data to display.</p>
          ) : (
            <div className="flex items-end gap-2 overflow-hidden sm:gap-3 h-44">
              {stats.languages.map(([ext, count], i) => (
                <div key={ext} className="flex flex-1 flex-col items-center gap-2">
                  <span className={`shrink-0 text-[10px] font-[Inter] tabular-nums ${isDark ? "text-slate-400" : "text-slate-500"}`}>{count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxLang) * 100}%` }}
                    transition={{ delay: 0.45 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className="w-full rounded-t-lg"
                    style={{ backgroundColor: EXT_COLORS[ext] || "#64748b" }}
                  />
                  <span className={`shrink-0 text-[10px] font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>.{ext}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
