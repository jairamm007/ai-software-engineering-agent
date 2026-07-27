import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Cpu, MessageSquare, Activity, Users, Clock, TrendingUp, Zap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getAIStats, type AIStats } from "@/services/admin";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } };

export default function AdminAIServicesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIStats()
      .then(setData)
      .catch(() => toast.error("Failed to load AI stats"))
      .finally(() => setLoading(false));
  }, []);

  const maxMsgCount = Math.max(...(data?.messagesByDay?.map((d) => d.count) ?? [1]), 1);

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
                ? "border-white/[0.06] bg-[#111118] hover:border-white/[0.1] hover:bg-[#13131b]"
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
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
      >
        <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
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
        <div className="p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          ) : data?.messagesByDay && data.messagesByDay.length > 0 ? (
            <div className="space-y-3">
              {data.messagesByDay.map((d, i) => (
                <motion.div
                  key={d.date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-4"
                >
                  <span className={`w-20 text-right text-[11px] font-medium tabular-nums ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className={`h-7 flex-1 overflow-hidden rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                    <div
                      className="h-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${Math.max(4, (d.count / maxMsgCount) * 100)}%` }}
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
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
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
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
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
