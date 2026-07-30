import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Code2, Loader2, AlertTriangle, Info, Shield } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeamCodeReviews } from "@/services/team";
import type { Team, TeamCodeReview, TeamRole } from "@/types/team";

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

export default function TeamCodeReviewsPage() {
  const { team } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["team-code-reviews", team.id],
    queryFn: () => getTeamCodeReviews(team.id),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
          Code Reviews
        </h1>
        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {reviews.length} code reviews
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={20} className="animate-spin accent-text" />
        </div>
      ) : reviews.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center ${isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
          <Code2 size={40} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No code reviews yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {reviews.map((review: TeamCodeReview, idx: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={14} className="accent-text" />
                <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                  {review.repository?.name || "Unknown repo"}
                </span>
              </div>
              <p className={`text-xs font-[Inter] mb-3 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {review.summary || `Found ${review.issuesFound} issues`}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-red-400">
                  <Shield size={10} /> {review.criticalCount} critical
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertTriangle size={10} /> {review.warningCount} warnings
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <Info size={10} /> {review.infoCount} info
                </span>
              </div>
              <p className={`text-[10px] font-[Inter] mt-2 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {timeAgo(review.createdAt)}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
