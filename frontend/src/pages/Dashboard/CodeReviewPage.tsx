import { motion } from "framer-motion";
import { GitPullRequest, CheckCircle2, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const reviews = [
  { repo: "ai-software-engineering-agent", pr: "#142", title: "Add WebSocket streaming for AI chat", status: "approved", files: 8, additions: 234, deletions: 45, time: "2h ago" },
  { repo: "ai-software-engineering-agent", pr: "#141", title: "Fix auth token refresh race condition", status: "changes", files: 3, additions: 67, deletions: 23, time: "5h ago" },
  { repo: "ai-software-engineering-agent", pr: "#139", title: "Implement repository chunking pipeline", status: "pending", files: 12, additions: 521, deletions: 0, time: "1d ago" },
];

const statusConfig = {
  approved: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10", label: "Approved" },
  changes: { icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10", label: "Changes Requested" },
  pending: { icon: Clock, color: "text-slate-400 bg-slate-500/10", label: "Pending Review" },
};

export default function CodeReviewPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Open Reviews", value: "3", icon: GitPullRequest, color: "violet" },
            { label: "Approved This Week", value: "7", icon: CheckCircle2, color: "emerald" },
            { label: "Avg Review Time", value: "2.4h", icon: Clock, color: "amber" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
                <s.icon size={16} className={`text-${s.color}-500`} />
              </div>
              <p className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Review List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Code Reviews</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {reviews.map((review, i) => {
              const sc = statusConfig[review.status as keyof typeof statusConfig];
              const StatusIcon = sc.icon;
              return (
                <motion.div key={review.pr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sc.color}`}>
                    <StatusIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{review.pr}</span>
                      <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-300"}`}>·</span>
                      <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{review.time}</span>
                    </div>
                    <p className={`text-sm font-medium font-[Inter] truncate mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>{review.title}</p>
                    <p className={`text-xs font-[Inter] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{review.files} files · +{review.additions} -{review.deletions}</p>
                  </div>
                  <ArrowRight size={14} className={`shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
