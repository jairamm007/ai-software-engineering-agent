import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FlaskConical, Loader2, CheckCircle2, XCircle, SkipForward, Target } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeamTestReports } from "@/services/team";
import type { Team, TeamTestReport, TeamRole } from "@/types/team";

interface OutletContext {
  team: Team;
  myRole: TeamRole;
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TeamTestingPage() {
  const { team } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["team-test-reports", team.id],
    queryFn: () => getTeamTestReports(team.id),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
          Testing
        </h1>
        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {reports.length} test reports
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={20} className="animate-spin accent-text" />
        </div>
      ) : reports.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center ${isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
          <FlaskConical size={40} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No test reports yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reports.map((report: TeamTestReport, idx: number) => {
            const passRate = report.totalTests > 0 ? Math.round((report.passedTests / report.totalTests) * 100) : 0;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FlaskConical size={14} className="accent-text shrink-0" />
                    <span className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                      {report.repository?.name || "Unknown"}
                    </span>
                  </div>
                  {report.coverage != null && (
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {report.coverage}% cov
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} /> {report.passedTests} passed
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle size={12} /> {report.failedTests} failed
                  </span>
                  {report.skippedTests > 0 && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <SkipForward size={12} /> {report.skippedTests} skipped
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${passRate}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {passRate}%
                  </span>
                </div>
                <p className={`text-[10px] font-[Inter] mt-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {timeAgo(report.createdAt)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
