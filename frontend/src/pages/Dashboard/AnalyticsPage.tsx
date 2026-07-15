import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Clock, Zap, GitCommitHorizontal } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const stats = [
  { label: "Total Analyses", value: "1,247", change: "+12%", icon: BarChart3, color: "violet" },
  { label: "AI Queries", value: "8,934", change: "+24%", icon: Zap, color: "fuchsia" },
  { label: "Active Users", value: "312", change: "+8%", icon: Users, color: "cyan" },
  { label: "Avg Response", value: "1.2s", change: "-15%", icon: Clock, color: "emerald" },
];

const weeklyData = [
  { day: "Mon", analyses: 45, queries: 230 },
  { day: "Tue", analyses: 52, queries: 310 },
  { day: "Wed", analyses: 61, queries: 285 },
  { day: "Thu", analyses: 48, queries: 340 },
  { day: "Fri", analyses: 73, queries: 420 },
  { day: "Sat", analyses: 28, queries: 150 },
  { day: "Sun", analyses: 19, queries: 95 },
];

const maxVal = Math.max(...weeklyData.map((d) => d.queries));

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                <s.icon size={16} className={`text-${s.color}-500`} />
              </div>
              <div className="flex items-end gap-2">
                <p className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</p>
                <span className={`mb-1 text-xs font-medium font-[Inter] ${s.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{s.change}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Weekly Activity</h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs font-[Inter]"><span className="h-2 w-2 rounded-full bg-violet-500" /> Queries</span>
              <span className="flex items-center gap-1.5 text-xs font-[Inter]"><span className="h-2 w-2 rounded-full bg-fuchsia-500/40" /> Analyses</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end gap-1 h-40">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.queries / maxVal) * 100}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400" />
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.analyses / maxVal) * 100}%` }} transition={{ delay: 0.35 + i * 0.05, duration: 0.6 }} className="flex-1 rounded-t-md bg-fuchsia-500/40" />
                </div>
                <span className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Repositories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Most Analyzed Repositories</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { name: "ai-software-engineering-agent", analyses: 342, queries: 2140 },
              { name: "frontend-dashboard", analyses: 189, queries: 1023 },
              { name: "api-gateway", analyses: 156, queries: 876 },
            ].map((repo, i) => (
              <motion.div key={repo.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.05 }} className="flex items-center gap-4 px-6 py-3">
                <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>#{i + 1}</span>
                <span className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{repo.name}</span>
                <span className={`ml-auto text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{repo.analyses} analyses · {repo.queries} queries</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
