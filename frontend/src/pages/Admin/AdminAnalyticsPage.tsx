import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Bot,
  Database,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as ReBarChart,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getAnalytics, type AnalyticsData } from "@/services/admin";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 text-[12px] shadow-xl ${
        isDark
          ? "border-white/[0.08] bg-[#1a1a24]"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className={`font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
        {typeof label === "string" && label.includes("-") ? formatShortDate(label) : label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

function CustomLegend({ payload, isDark }: any) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-2">
      {payload?.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f43f5e", "#8b5cf6",
  "#f59e0b", "#ec4899", "#6366f1", "#14b8a6",
  "#f97316", "#06b6d4",
];

export default function AdminAnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiChartType, setAiChartType] = useState<"bar" | "area">("bar");
  const [storageChartType, setStorageChartType] = useState<"bar" | "area">("bar");

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0";
  const tickFill = isDark ? "#475569" : "#64748b";
  const barRadius: [number, number, number, number] = [4, 4, 0, 0];

  const stats = [
    {
      icon: Users,
      label: "Daily Active Users",
      value: data?.dailyActiveUsers ?? 0,
      gradient: "from-blue-500 to-cyan-500",
      desc: "Active in last 24h",
    },
    {
      icon: Calendar,
      label: "Monthly Active Users",
      value: data?.monthlyActiveUsers ?? 0,
      gradient: "from-emerald-500 to-teal-500",
      desc: "Active in last 30 days",
    },
    {
      icon: Globe,
      label: "Languages Tracked",
      value: data?.languages?.length ?? 0,
      gradient: "from-amber-500 to-orange-500",
      desc: "Unique file extensions",
    },
    {
      icon: Activity,
      label: "AI Activity Days",
      value: data?.aiUsageByDay?.length ?? 0,
      gradient: "from-rose-500 to-orange-500",
      desc: "Days with AI usage",
    },
  ];

  const aiChartData = (data?.aiUsageByDay ?? []).map((d) => ({
    date: d.date,
    Messages: d.count,
  }));

  const storageChartData = (data?.storageByDay ?? []).map((d) => ({
    date: d.date,
    "Size (MB)": Number((d.totalSize / (1024 * 1024)).toFixed(2)),
  }));

  const languagePieData = (data?.languages ?? []).map((l) => ({
    name: l.extension.replace(".", "").toUpperCase() || l.extension,
    value: l.count,
  }));

  const dauMauData = [
    { name: "DAU", value: data?.dailyActiveUsers ?? 0 },
    { name: "MAU", value: data?.monthlyActiveUsers ?? 0 },
  ];

  const toggleButton = (type: "bar" | "area", setType: (t: "bar" | "area") => void) => (
    <div className={`flex rounded-lg border overflow-hidden text-[11px] font-medium ${
      isDark ? "border-white/[0.06]" : "border-slate-200"
    }`}>
      {(["bar", "area"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setType(t)}
          className={`px-3 py-1.5 transition-colors ${
            type === t
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
  );

  const chartCard = (title: string, subtitle: string, gradient: string, icon: React.ReactNode, headerRight?: React.ReactNode, children: React.ReactNode = null) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
            {icon}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
            <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>
          </div>
        </div>
        {headerRight}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );

  const renderBarArea = (chartData: any[], dataKey: string, color: string, chartType: "bar" | "area", gradId: string, height = 260) => (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === "bar" ? (
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
          <Bar dataKey={dataKey} fill={`url(#${gradId})`} radius={barRadius} maxBarSize={36} />
        </BarChart>
      ) : (
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip isDark={isDark} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradId}-area)`} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color, stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Analytics</h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Platform usage, activity, and storage metrics
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={`relative overflow-hidden rounded-2xl border p-5 ${
              isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
              <stat.icon size={18} />
            </div>
            <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {loading ? (
                <span className={`inline-block h-7 w-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
              ) : (
                stat.value.toLocaleString()
              )}
            </p>
            <p className={`mt-1 text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{stat.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Usage Trend */}
      {chartCard(
        "AI Usage Trend",
        "Daily AI message volume (last 30 days)",
        "from-rose-500 to-orange-500",
        <Bot size={15} className="text-white" />,
        toggleButton(aiChartType, setAiChartType),
        loading ? (
          <div className="flex h-[260px] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          </div>
        ) : aiChartData.length > 0 ? (
          renderBarArea(aiChartData, "Messages", "#f43f5e", aiChartType, "aiGrad")
        ) : (
          <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No AI usage data yet</p>
        )
      )}

      {/* Storage & DAU/MAU row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Storage Growth */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-2 rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Database size={15} className="text-white" />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Storage Growth</h3>
                <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Cumulative file storage (MB)</p>
              </div>
            </div>
            {toggleButton(storageChartType, setStorageChartType)}
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              </div>
            ) : storageChartData.length > 0 ? (
              renderBarArea(storageChartData, "Size (MB)", "#8b5cf6", storageChartType, "storageGrad", 220)
            ) : (
              <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No storage data yet</p>
            )}
          </div>
        </motion.div>

        {/* DAU vs MAU */}
        {chartCard(
          "DAU vs MAU",
          "Daily vs monthly active users",
          "from-emerald-500 to-teal-500",
          <Users size={15} className="text-white" />,
          undefined,
          loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dauMauData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickFill, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {dauMauData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "url(#dauGrad)" : "url(#mauGrad)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Language Distribution */}
      {chartCard(
        "Language Distribution",
        "Top file extensions by count",
        "from-amber-500 to-orange-500",
        <Globe size={15} className="text-white" />,
        undefined,
        loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : languagePieData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {languagePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className={`rounded-xl border px-3 py-2 text-[12px] shadow-xl ${
                        isDark ? "border-white/[0.08] bg-[#1a1a24]" : "border-slate-200 bg-white"
                      }`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{payload[0].name}</p>
                        <p style={{ color: PIE_COLORS[0] }} className="font-medium">{payload[0].value?.toLocaleString()} files</p>
                      </div>
                    ) : null
                  }
                />
                <Legend content={<CustomLegend isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {languagePieData.slice(0, 8).map((lang, i) => {
                const total = languagePieData.reduce((s, l) => s + l.value, 0);
                const pct = total > 0 ? ((lang.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className={`text-[13px] font-medium flex-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{lang.name}</span>
                    <span className={`text-[12px] tabular-nums ${isDark ? "text-slate-500" : "text-slate-400"}`}>{pct}%</span>
                    <span className={`text-[12px] font-semibold tabular-nums w-12 text-right ${isDark ? "text-slate-300" : "text-slate-600"}`}>{lang.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No language data yet</p>
        )
      )}
    </div>
  );
}
