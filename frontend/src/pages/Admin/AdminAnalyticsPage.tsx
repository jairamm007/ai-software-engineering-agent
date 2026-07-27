import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, FolderGit2, TrendingUp, Activity, Globe, Bot, ArrowUpRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getAdminStats, getAnalytics, type AdminStats, type AnalyticsData } from "@/services/admin";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } };

export default function AdminAnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAnalytics()])
      .then(([stats, analyticsData]) => { setData(stats); setAnalytics(analyticsData); })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const userGrowth = data?.charts.usersByDay ?? [];
  const repoGrowth = data?.charts.reposByDay ?? [];
  const maxUserCount = Math.max(...userGrowth.map((d) => d.count), 1);
  const maxRepoCount = Math.max(...repoGrowth.map((d) => d.count), 1);
  const maxLangCount = Math.max(...(analytics?.languages?.map((l) => l.count) ?? [1]), 1);

  const extToLang: Record<string, string> = {
    ".ts": "TypeScript", ".tsx": "React/TSX", ".js": "JavaScript", ".jsx": "React/JSX",
    ".py": "Python", ".java": "Java", ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
    ".cpp": "C++", ".c": "C", ".cs": "C#", ".php": "PHP", ".swift": "Swift",
    ".kt": "Kotlin", ".scala": "Scala", ".r": "R", ".lua": "Lua", ".sh": "Shell",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS", ".json": "JSON",
    ".yaml": "YAML", ".yml": "YAML", ".md": "Markdown", ".sql": "SQL",
    ".prisma": "Prisma", ".graphql": "GraphQL", ".vue": "Vue",
  };

  const langColors = [
    "from-rose-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-teal-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-fuchsia-500 to-pink-500",
  ];

  const dauMau = [
    { label: "DAU", value: analytics?.dailyActiveUsers ?? 0, icon: Users, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10" },
    { label: "MAU", value: analytics?.monthlyActiveUsers ?? 0, icon: Users, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10" },
    { label: "New Users (30d)", value: data?.stats.newUsers30Days ?? 0, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
    { label: "New Repos (7d)", value: data?.stats.reposLast7Days ?? 0, icon: FolderGit2, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Analytics
        </h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Platform trends and usage metrics
        </p>
      </motion.div>

      {/* DAU / MAU Cards */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dauMau.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
              isDark
                ? "border-white/[0.06] bg-[#111118] hover:border-white/[0.1] hover:bg-[#13131b]"
                : "border-slate-200 bg-white shadow-sm hover:shadow-md"
            }`}
          >
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg ${s.shadow}`}>
              <s.icon size={18} strokeWidth={2} />
            </div>
            <p className={`mt-3.5 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {s.label}
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {loading ? (
                  <span className={`inline-block h-7 w-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                ) : (
                  s.value.toLocaleString()
                )}
              </p>
              {!loading && s.value > 0 && (
                <ArrowUpRight size={14} className="text-emerald-500" />
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500">
              <Users size={15} className="text-white" />
            </div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              User Registrations
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              </div>
            ) : userGrowth.length > 0 ? (
              <div className="space-y-3">
                {userGrowth.map((d, i) => (
                  <motion.div
                    key={d.date}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="flex items-center gap-4"
                  >
                    <span className={`w-20 text-right text-[11px] font-medium tabular-nums ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className={`h-6 flex-1 overflow-hidden rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                      <div
                        className="h-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, (d.count / maxUserCount) * 100)}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right text-[13px] font-semibold tabular-nums ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {d.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                  <Users size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                </div>
                <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No registration data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Repository Growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <FolderGit2 size={15} className="text-white" />
            </div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Repository Growth
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              </div>
            ) : repoGrowth.length > 0 ? (
              <div className="space-y-3">
                {repoGrowth.map((d, i) => (
                  <motion.div
                    key={d.date}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="flex items-center gap-4"
                  >
                    <span className={`w-20 text-right text-[11px] font-medium tabular-nums ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className={`h-6 flex-1 overflow-hidden rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                      <div
                        className="h-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, (d.count / maxRepoCount) * 100)}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right text-[13px] font-semibold tabular-nums ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {d.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                  <FolderGit2 size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                </div>
                <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No repository data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <Globe size={15} className="text-white" />
            </div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Popular Languages
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              </div>
            ) : analytics?.languages && analytics.languages.length > 0 ? (
              <div className="space-y-3">
                {analytics.languages.map((l, i) => (
                  <motion.div
                    key={l.extension}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="flex items-center gap-4"
                  >
                    <span className={`w-24 truncate text-[12px] font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {extToLang[l.extension] || l.extension}
                    </span>
                    <div className={`h-6 flex-1 overflow-hidden rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                      <div
                        className={`h-full rounded-xl bg-gradient-to-r ${langColors[i % langColors.length]} transition-all duration-500`}
                        style={{ width: `${Math.max(4, (l.count / maxLangCount) * 100)}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right text-[13px] font-semibold tabular-nums ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {l.count}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                  <Globe size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                </div>
                <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No language data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Usage Trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
              <Bot size={15} className="text-white" />
            </div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              AI Usage Trend
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              </div>
            ) : analytics?.aiUsageByDay && analytics.aiUsageByDay.length > 0 ? (
              <div className="space-y-3">
                {analytics.aiUsageByDay.slice(-14).map((d, i) => {
                  const maxAi = Math.max(...analytics.aiUsageByDay.map((x) => x.count), 1);
                  return (
                    <motion.div
                      key={d.date}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className="flex items-center gap-4"
                    >
                      <span className={`w-20 text-right text-[11px] font-medium tabular-nums ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div className={`h-6 flex-1 overflow-hidden rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                        <div
                          className="h-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${Math.max(4, (d.count / maxAi) * 100)}%` }}
                        />
                      </div>
                      <span className={`w-10 text-right text-[13px] font-semibold tabular-nums ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        {d.count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                  <Bot size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                </div>
                <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No AI usage data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Growth Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
      >
        <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500">
            <TrendingUp size={15} className="text-white" />
          </div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Growth Summary
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
          {[
            { label: "New Users (Today)", value: data?.stats.newUsersToday ?? 0 },
            { label: "New Users (7d)", value: data?.stats.newUsers7Days ?? 0 },
            { label: "New Users (30d)", value: data?.stats.newUsers30Days ?? 0 },
            { label: "New Repos (7d)", value: data?.stats.reposLast7Days ?? 0 },
          ].map((s) => (
            <div key={s.label} className={`px-6 py-5 ${isDark ? "bg-white/[0.02]" : "bg-slate-50/80"}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {s.label}
              </p>
              <p className={`mt-1.5 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {loading ? (
                  <span className={`inline-block h-7 w-12 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                ) : (
                  s.value.toLocaleString()
                )}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
