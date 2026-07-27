import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GitBranch,
  MessageSquare,
  Bot,
  Database,
  Globe,
  TrendingUp,
  BarChart3,
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
} from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getAdminAnalytics, type AdminAnalytics } from "@/services/admin";

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
        {formatShortDate(label)}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
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
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userChartType, setUserChartType] = useState<"bar" | "area">("bar");
  const [repoChartType, setRepoChartType] = useState<"bar" | "area">("bar");

  useEffect(() => {
    getAdminAnalytics()
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0";
  const tickFill = isDark ? "#475569" : "#64748b";

  const stats = [
    {
      icon: Users,
      label: "Users by Day",
      value: data?.usersByDay.length ?? 0,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: GitBranch,
      label: "Repos by Day",
      value: data?.reposByDay.length ?? 0,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageSquare,
      label: "Messages by Day",
      value: data?.messagesByDay.length ?? 0,
      gradient: "from-rose-500 to-orange-500",
    },
    {
      icon: Database,
      label: "Storage by Day",
      value: data?.storageByDay.length ?? 0,
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const usersChartData = (data?.usersByDay ?? []).map((d) => ({
    date: d.date,
    Users: d.count,
  }));
  const reposChartData = (data?.reposByDay ?? []).map((d) => ({
    date: d.date,
    Repos: d.count,
  }));
  const messagesChartData = (data?.messagesByDay ?? []).map((d) => ({
    date: d.date,
    Messages: d.count,
  }));
  const storageChartData = (data?.storageByDay ?? []).map((d) => ({
    date: d.date,
    "Storage (MB)": Number(d.sizeMB.toFixed(2)),
  }));

  const languagePieData = (data?.languageDistribution ?? []).map((l) => ({
    name: l.language,
    value: l.count,
  }));

  const aiProviderData = (() => {
    const totals = new Map<string, { count: number; inputTokens: number; outputTokens: number }>();
    (data?.aiUsageByDay ?? []).forEach((d) => {
      const existing = totals.get(d.provider) ?? { count: 0, inputTokens: 0, outputTokens: 0 };
      totals.set(d.provider, {
        count: existing.count + d.count,
        inputTokens: existing.inputTokens + d.inputTokens,
        outputTokens: existing.outputTokens + d.outputTokens,
      });
    });
    return [...totals.entries()].map(([provider, s]) => ({
      name: provider,
      Requests: s.count,
      "Input Tokens": s.inputTokens,
      "Output Tokens": s.outputTokens,
    }));
  })();

  const barRadius: [number, number, number, number] = [4, 4, 0, 0];

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

  const renderBarAreaChart = (
    chartData: any[],
    dataKey: string,
    color: string,
    chartType: "bar" | "area",
    gradientId: string,
    height = 260
  ) => (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === "bar" ? (
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
          <Bar dataKey={dataKey} fill={`url(#${gradientId})`} radius={barRadius} maxBarSize={36} />
        </BarChart>
      ) : (
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip isDark={isDark} />} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId}-area)`} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color, stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );

  const chartCard = (title: string, subtitle: string, gradient: string, icon: React.ReactNode, children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
          <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Analytics</h1>
        <p className={`mt-1.5 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Platform usage and growth metrics</p>
      </motion.div>

      {/* Quick Stats */}
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
            <p className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* User Growth */}
      {chartCard(
        "User Growth",
        "Daily new user registrations",
        "from-blue-500 to-cyan-500",
        <Users size={15} className="text-white" />,
        loading ? (
          <div className="flex h-[260px] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : usersChartData.length > 0 ? (
          <>
            <div className="flex justify-end mb-2">{toggleButton(userChartType, setUserChartType)}</div>
            {renderBarAreaChart(usersChartData, "Users", "#3b82f6", userChartType, "usersGrad")}
          </>
        ) : (
          <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No user data yet</p>
        )
      )}

      {/* Repository Growth */}
      {chartCard(
        "Repository Growth",
        "Daily new repositories created",
        "from-emerald-500 to-teal-500",
        <GitBranch size={15} className="text-white" />,
        loading ? (
          <div className="flex h-[260px] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : reposChartData.length > 0 ? (
          <>
            <div className="flex justify-end mb-2">{toggleButton(repoChartType, setRepoChartType)}</div>
            {renderBarAreaChart(reposChartData, "Repos", "#10b981", repoChartType, "reposGrad")}
          </>
        ) : (
          <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No repository data yet</p>
        )
      )}

      {/* Message & Storage row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Messages */}
        {chartCard(
          "Message Activity",
          "Daily message volume",
          "from-rose-500 to-orange-500",
          <MessageSquare size={15} className="text-white" />,
          loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          ) : messagesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={messagesChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="msgsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="Messages" fill="url(#msgsGrad)" radius={barRadius} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No message data yet</p>
          )
        )}

        {/* Storage */}
        {chartCard(
          "Storage Growth",
          "Cumulative storage usage (MB)",
          "from-violet-500 to-purple-500",
          <Database size={15} className="text-white" />,
          loading ? (
            <div className="flex h-[220px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : storageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={storageChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Area type="monotone" dataKey="Storage (MB)" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#storageGrad)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#8b5cf6", stroke: isDark ? "#111118" : "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No storage data yet</p>
          )
        )}
      </div>

      {/* Language & AI Usage row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Language Distribution */}
        {chartCard(
          "Language Distribution",
          "Repository count by language",
          "from-amber-500 to-orange-500",
          <Globe size={15} className="text-white" />,
          loading ? (
            <div className="flex h-[260px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : languagePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={languagePieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
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
                        <p style={{ color: PIE_COLORS[0] }} className="font-medium">{payload[0].value} repos</p>
                      </div>
                    ) : null
                  }
                />
                <Legend content={<CustomLegend isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No language data yet</p>
          )
        )}

        {/* AI Usage by Provider */}
        {chartCard(
          "AI Usage by Provider",
          "Request volume per provider",
          "from-emerald-500 to-teal-500",
          <Bot size={15} className="text-white" />,
          loading ? (
            <div className="flex h-[260px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : aiProviderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={aiProviderData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiReqsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="Requests" fill="url(#aiReqsGrad)" radius={barRadius} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={`py-16 text-center text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No AI usage data yet</p>
          )
        )}
      </div>
    </div>
  );
}
