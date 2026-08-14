import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Cpu, MessageSquare, Activity, Users, Clock, TrendingUp, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getAIStats, type AIStats } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number | string }>;
  label?: string | number;
  isDark: boolean;
}

function ChartTooltip({ active, payload, label, isDark }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 text-[12px] shadow-xl ${
        isDark ? "border-white/[0.08] bg-[#1a1a24]" : "border-slate-200 bg-white"
      }`}
    >
      <p className={`font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
        {typeof label === "string" ? formatShortDate(label) : ""}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminAIServicesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  useEffect(() => {
    getAIStats()
      .then(setData)
      .catch(() => toast.error("Failed to load AI stats"))
      .finally(() => setLoading(false));
  }, []);

  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0";
  const tickFill = isDark ? "#475569" : "#64748b";
  const barRadius: [number, number, number, number] = [4, 4, 0, 0];

  const chartData = (data?.messagesByDay ?? []).map((d) => ({
    date: d.date,
    Messages: d.count,
  }));

  const stats = [
    { icon: MessageSquare, label: "Total Conversations", value: data?.totalConversations ?? 0, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10" },
    { icon: Activity, label: "Total Messages", value: data?.totalMessages ?? 0, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10" },
    { icon: Bot, label: "AI Responses", value: data?.aiResponses ?? 0, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
    { icon: Clock, label: "Last 24h", value: data?.conversationsLast24h ?? 0, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10" },
    { icon: Users, label: "User Messages", value: data?.userMessages ?? 0, gradient: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/10" },
    { icon: TrendingUp, label: "Last 7 Days", value: data?.conversationsLast7d ?? 0, gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/10" },
  ];

  const providerGradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-orange-600",
    "from-amber-500 to-yellow-600",
    "from-pink-500 to-fuchsia-600",
    "from-indigo-500 to-blue-600",
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          AI Service Monitoring
        </h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Monitor AI models, requests, and token usage
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
              isDark
                ? "border-white/[0.06] bg-[var(--card-bg)] hover:border-white/[0.1] hover:bg-[#13131b]"
                : "border-slate-200 bg-white shadow-sm hover:shadow-md"
            }`}
          >
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow}`}>
              <stat.icon size={18} strokeWidth={2} />
            </div>
            <p className={`mt-3.5 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {stat.label}
            </p>
            <p className={`mt-1 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {loading ? (
                <span className={`inline-block h-7 w-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
              ) : (
                stat.value.toLocaleString()
              )}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white shadow-sm"}`}
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                AI Activity
              </h3>
              <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Last 7 days
              </p>
            </div>
          </div>
          <div className={`flex rounded-lg border overflow-hidden text-[11px] font-medium ${
            isDark ? "border-white/[0.06]" : "border-slate-200"
          }`}>
            {(["bar", "area"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1.5 transition-colors ${
                  chartType === t
                    ? isDark
                      ? "bg-white/[0.08] text-white"
                      : "bg-slate-100 text-slate-900"
                    : isDark
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t === "bar" ? <BarChart3 size={12} /> : <TrendingUp size={12} />}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoadingIndicator size="md" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiActivityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="Messages" fill="url(#aiActivityGrad)" radius={barRadius} maxBarSize={40} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aiActivityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="Messages" stroke="#f43f5e" strokeWidth={2.5} fill="url(#aiActivityAreaGrad)" dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f43f5e", stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <TrendingUp size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
              </div>
              <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No activity data yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Providers */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white shadow-sm"}`}
      >
        <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
            <Cpu size={15} className="text-white" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              AI Providers
            </h3>
            <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Multi-provider fallback chain
            </p>
          </div>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingIndicator size="md" />
            </div>
          ) : (
            data?.providers.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${providerGradients[i % providerGradients.length]} text-white shadow-lg`}>
                  <Cpu size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {p.name}
                  </p>
                  <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {p.model}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                    isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500"
                  }`}>
                    {p.tier}
                  </span>
                  <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                    p.status === "active"
                      ? isDark
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                      : isDark
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-amber-50 text-amber-600"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      p.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
