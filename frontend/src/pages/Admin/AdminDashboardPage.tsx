import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users,
  UserCog,
  FolderGit2,
  Activity,
  MessageSquare,
  FileCode2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
  ArrowUpRight,
  LayoutDashboard,
  HardDrive,
  BarChart3,
  LineChart,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getAdminStats, getSystemHealth, type AdminStats, type SystemHealth } from "@/services/admin";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  useEffect(() => {
    Promise.all([getAdminStats(), getSystemHealth()])
      .then(([stats, healthData]) => { setData(stats); setHealth(healthData); setError(""); })
      .catch((err) => { setError(err?.message || "Failed to load dashboard data"); })
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0, sub: `+${stats?.newUsersToday ?? 0} today`, gradient: "from-rose-500 to-orange-500" },
    { icon: UserCog, label: "Admins", value: stats?.adminCount ?? 0, sub: "Platform admins", gradient: "from-violet-500 to-purple-500" },
    { icon: FolderGit2, label: "Repositories", value: stats?.totalRepos ?? 0, sub: `+${stats?.reposLast7Days ?? 0} this week`, gradient: "from-cyan-500 to-blue-500" },
    { icon: FileCode2, label: "Indexed Files", value: stats?.totalFiles ?? 0, sub: `${stats?.totalChunks ?? 0} chunks`, gradient: "from-emerald-500 to-teal-500" },
    { icon: MessageSquare, label: "Conversations", value: stats?.totalConversations ?? 0, sub: `${stats?.conversationsToday ?? 0} today`, gradient: "from-amber-500 to-orange-500" },
    { icon: Activity, label: "Active Sessions", value: stats?.activeSessions ?? 0, sub: "Currently online", gradient: "from-pink-500 to-rose-500" },
    { icon: HardDrive, label: "Storage Used", value: `${stats?.storageUsedMB ?? 0} MB`, sub: "Total file storage", gradient: "from-teal-500 to-cyan-600" },
    { icon: TrendingUp, label: "New Users (7d)", value: stats?.newUsers7Days ?? 0, sub: `${stats?.newUsers30Days ?? 0} this month`, gradient: "from-indigo-500 to-blue-500" },
    { icon: Ban, label: "Suspended", value: stats?.suspendedUsers ?? 0, sub: "Blocked accounts", gradient: "from-red-500 to-orange-600" },
  ];

  const chartData = data?.charts.usersByDay ?? [];
  const repoChartData = data?.charts.reposByDay ?? [];

  function pieData(s: NonNullable<AdminStats["stats"]>) {
    return [
      { name: "Users", value: s.totalUsers, color: "#f43f5e" },
      { name: "Repos", value: s.totalRepos, color: "#06b6d4" },
      { name: "Files", value: s.totalFiles, color: "#10b981" },
      { name: "Conversations", value: s.totalConversations, color: "#f59e0b" },
      { name: "Chunks", value: Math.min(s.totalChunks, 9999), color: "#8b5cf6" },
    ];
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen px-1 py-1">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative mb-8 overflow-hidden rounded-2xl border p-6 sm:p-8 ${
          isDark
            ? "border-white/[0.06] bg-[#111118]"
            : "border-slate-200 bg-white shadow-lg shadow-slate-200/50"
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br opacity-[0.03] ${
          isDark ? "from-rose-500 to-orange-500" : "from-rose-500 to-orange-500"
        }`} />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20`}>
                <LayoutDashboard size={20} />
              </div>
              <div>
                <p className={`text-[13px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {getGreeting()}, Admin
                </p>
                <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  Dashboard Overview
                </h1>
              </div>
            </div>
            <p className={`mt-2 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Platform metrics and recent activity — {today}
            </p>
          </div>
          <div className={`hidden sm:block rounded-xl border px-4 py-2 text-xs font-medium ${
            isDark ? "border-white/[0.06] bg-white/[0.04] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}>
            <div className="flex items-center gap-2">
              {health && (
                <>
                  <div className={`h-2 w-2 rounded-full ${
                    health.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`} />
                  <span className={health.status === "healthy" ? "text-emerald-500" : "text-amber-500"}>
                    System {health.status === "healthy" ? "Operational" : "Degraded"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${
            isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-400" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(""); Promise.all([getAdminStats(), getSystemHealth()]).then(([s, h]) => { setData(s); setHealth(h); }).catch((e) => setError(e?.message || "Failed to load")).finally(() => setLoading(false)); }}
            className={`ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
            }`}
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
              isDark
                ? "border-white/[0.06] bg-[#111118] hover:bg-white/[0.04] shadow-lg shadow-black/20"
                : "border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/60 shadow-md shadow-slate-200/40"
            }`}
          >
            {/* Top gradient bar */}
            <div className={`absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

            {/* Glassmorphism overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-[0.015] ${stat.gradient}`} />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  <stat.icon size={19} strokeWidth={2} />
                </div>
                <ArrowUpRight size={14} className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              </div>

              <p className={`mt-4 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {stat.label}
              </p>
              <p className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                {loading ? (
                  <span className={`inline-block h-8 w-16 animate-pulse rounded-lg ${isDark ? "bg-white/[0.06]" : "bg-slate-200"}`} />
                ) : (
                  stat.value.toLocaleString()
                )}
              </p>
              <p className={`mt-1.5 text-[13px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {stat.sub}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Users Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>User Growth</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>New users over the last 30 days</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChartType("bar")}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  chartType === "bar"
                    ? "bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-500"
                    : isDark ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <BarChart3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setChartType("line")}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  chartType === "line"
                    ? "bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-500"
                    : isDark ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <LineChart size={14} />
              </button>
            </div>
          </div>
          <div className="p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                      labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="Users"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                      labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Users"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fill="url(#lineGradient)"
                      dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#f43f5e", stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className={`flex h-64 items-center justify-center rounded-xl border border-dashed ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
                <p className={`text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {loading ? "Loading chart data..." : "No data yet"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Repository Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Repository Growth</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Repos created over the last 30 days</p>
            </div>
            <div className={`flex h-8 items-center rounded-lg px-3 text-xs font-medium ${
              isDark ? "bg-white/[0.04] text-slate-400" : "bg-slate-50 text-slate-500"
            }`}>
              <FolderGit2 size={13} className="mr-1.5" />
              {chartType === "bar" ? "Bar" : "Line"}
            </div>
          </div>
          <div className="p-6">
            {repoChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "bar" ? (
                  <BarChart data={repoChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                      labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                    />
                    <Bar dataKey="count" name="Repos" fill="url(#repoBarGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <defs>
                      <linearGradient id="repoBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                ) : (
                  <AreaChart data={repoChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="repoLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      }}
                      labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      cursor={{ stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Repos"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fill="url(#repoLineGradient)"
                      dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#06b6d4", stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className={`flex h-64 items-center justify-center rounded-xl border border-dashed ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
                <p className={`text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {loading ? "Loading chart data..." : "No data yet"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Users</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Latest registrations</p>
            </div>
            <Link
              to="/admin/users"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="px-2 py-2">
            {(data?.recent.users ?? []).slice(0, 5).map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"
                }`}
              >
                {u.image ? (
                  <img src={u.image} alt={u.name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold text-white shadow-md shadow-rose-500/20">
                    {u.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{u.name}</p>
                  <p className={`truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{u.email}</p>
                </div>
                {u.role && u.role !== "user" && (
                  <span className={`shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                    isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500"
                  }`}>
                    {u.role}
                  </span>
                )}
              </div>
            ))}
            {(!data?.recent.users || data.recent.users.length === 0) && (
              <p className={`py-12 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {loading ? "Loading..." : "No users yet"}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Second row: Repositories, Activity Pie, Recent Repos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Activity Distribution (Pie) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Platform Activity</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Content distribution overview</p>
            </div>
          </div>
          <div className="p-6">
            {stats ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData(stats)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData(stats).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex h-64 items-center justify-center rounded-xl border border-dashed ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
                <p className={`text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {loading ? "Loading..." : "No data yet"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Repositories</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Latest added repos</p>
            </div>
            <Link
              to="/admin/repositories"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              View all
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="px-2 py-2">
            {(data?.recent.repositories ?? []).slice(0, 5).map((repo) => (
              <div
                key={repo.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isDark ? "bg-white/[0.06]" : "bg-slate-100"
                }`}>
                  <FolderGit2 size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{repo.name}</p>
                  <p className={`truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {repo.githubUrl.replace(/^https?:\/\/github\.com\//, "").slice(0, 35)}
                  </p>
                </div>
                <span className={`shrink-0 text-[11px] tabular-nums ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {new Date(repo.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
            {(!data?.recent.repositories || data.recent.repositories.length === 0) && (
              <p className={`py-12 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {loading ? "Loading..." : "No repositories yet"}
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Growth Summary</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Key metrics at a glance</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Users (7d)", value: stats?.newUsers7Days ?? 0, total: stats?.totalUsers ?? 0, color: "from-rose-500 to-orange-500" },
              { label: "Repos (7d)", value: stats?.reposLast7Days ?? 0, total: stats?.totalRepos ?? 0, color: "from-cyan-500 to-blue-500" },
              { label: "Conversations (today)", value: stats?.conversationsToday ?? 0, total: stats?.totalConversations ?? 0, color: "from-amber-500 to-orange-500" },
            ].map((m) => {
              const pct = m.total > 0 ? Math.min(100, Math.max(2, (m.value / Math.max(m.total, 1)) * 100)) : 0;
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[13px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.label}</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {m.value.toLocaleString()} / {m.total.toLocaleString()}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
        className={`mt-8 rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118] shadow-lg shadow-black/20" : "border-slate-200 bg-white shadow-md shadow-slate-200/40"}`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              health?.status === "healthy"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }`}>
              <Activity size={16} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>System Health</h3>
              <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Service status and performance</p>
            </div>
          </div>
          {health && (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              health.status === "healthy"
                ? isDark
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-emerald-200 bg-emerald-50 text-emerald-600"
                : isDark
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-amber-200 bg-amber-50 text-amber-600"
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${
                health.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`} />
              {health.status === "healthy" ? "All Systems Operational" : "Degraded"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-4 ${isDark ? "bg-white/[0.02]" : "bg-slate-50/50"}`}>
                <div className={`h-3 w-3 animate-pulse rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="space-y-1.5">
                  <div className={`h-3 w-16 animate-pulse rounded-md ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                  <div className={`h-2.5 w-12 animate-pulse rounded-md ${isDark ? "bg-white/[0.06]" : "bg-slate-200/60"}`} />
                </div>
              </div>
            ))
          ) : (
            health?.checks.map((check) => (
              <div
                key={check.name}
                className={`flex items-center gap-3 px-5 py-4 transition-colors ${
                  isDark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                {check.status === "operational" ? (
                  <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle size={14} className="shrink-0 text-red-500" />
                )}
                <div className="min-w-0">
                  <p className={`truncate text-[13px] font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{check.name}</p>
                  <p className={`text-[11px] font-medium ${
                    check.status === "operational"
                      ? isDark ? "text-emerald-500/80" : "text-emerald-600"
                      : isDark ? "text-red-400" : "text-red-500"
                  }`}>
                    {check.status === "operational" ? `${check.latencyMs}ms` : "Down"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {health && (
          <div className={`flex items-center gap-6 border-t px-6 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <span className={`flex items-center gap-1.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Clock size={12} />
              Uptime: {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
            </span>
            <span className={`flex items-center gap-1.5 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <Activity size={12} />
              Memory: {(health.memoryUsage.heapUsed / 1024 / 1024).toFixed(0)}MB / {(health.memoryUsage.heapTotal / 1024 / 1024).toFixed(0)}MB
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
