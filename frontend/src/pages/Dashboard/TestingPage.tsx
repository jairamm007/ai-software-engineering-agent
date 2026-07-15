import { motion } from "framer-motion";
import { FlaskConical, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const testSuites = [
  { name: "Unit Tests", total: 142, passed: 138, failed: 2, skipped: 2, time: "12.4s" },
  { name: "Integration Tests", total: 38, passed: 35, failed: 1, skipped: 2, time: "45.2s" },
  { name: "E2E Tests", total: 18, passed: 16, failed: 0, skipped: 2, time: "1m 23s" },
];

const recentRuns = [
  { id: "#847", branch: "main", status: "passed", coverage: "87.3%", time: "3m ago", commit: "a1b2c3d" },
  { id: "#846", branch: "feat/ws-streaming", status: "failed", coverage: "82.1%", time: "28m ago", commit: "e4f5g6h" },
  { id: "#845", branch: "fix/auth-refresh", status: "passed", coverage: "86.8%", time: "2h ago", commit: "i7j8k9l" },
  { id: "#844", branch: "main", status: "passed", coverage: "87.1%", time: "5h ago", commit: "m0n1o2p" },
];

export default function TestingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalTests = testSuites.reduce((a, s) => a + s.total, 0);
  const totalPassed = testSuites.reduce((a, s) => a + s.passed, 0);
  const totalFailed = testSuites.reduce((a, s) => a + s.failed, 0);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Tests", value: totalTests, icon: FlaskConical, color: "violet" },
            { label: "Passed", value: totalPassed, icon: CheckCircle2, color: "emerald" },
            { label: "Failed", value: totalFailed, icon: XCircle, color: "red" },
            { label: "Coverage", value: "87.3%", icon: TrendingUp, color: "cyan" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                <s.icon size={16} className={`text-${s.color}-500`} />
              </div>
              <p className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Test Suites */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Test Suites</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {testSuites.map((suite, i) => (
              <motion.div key={suite.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{suite.name}</span>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{suite.time}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(suite.passed / suite.total) * 100}%` }} transition={{ delay: 0.4, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  </div>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{suite.passed}/{suite.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Runs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Runs</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentRuns.map((run, i) => (
              <motion.div key={run.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.04 }} className={`flex items-center gap-4 px-6 py-3 transition-colors cursor-pointer ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{run.id}</span>
                <span className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{run.branch}</span>
                <span className={`ml-auto flex items-center gap-1 text-xs font-medium font-[Inter] ${run.status === "passed" ? "text-emerald-400" : "text-red-400"}`}>
                  {run.status === "passed" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {run.status}
                </span>
                <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{run.coverage}</span>
                <span className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-300"}`}>{run.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
