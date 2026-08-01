import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, FolderGit2, MessageSquare, Activity, FileText, Code2, FlaskConical, BarChart3 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeamAnalytics } from "@/services/teamAnalytics";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const STAT_CARDS = [
  { key: "members", label: "Members", icon: Users, color: "text-blue-400 bg-blue-500/10" },
  { key: "repositories", label: "Repositories", icon: FolderGit2, color: "text-emerald-400 bg-emerald-500/10" },
  { key: "chats", label: "AI Chats", icon: MessageSquare, color: "text-violet-400 bg-violet-500/10" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-cyan-400 bg-cyan-500/10" },
  { key: "documentation", label: "Documentation", icon: FileText, color: "text-amber-400 bg-amber-500/10" },
  { key: "codeReviews", label: "Code Reviews", icon: Code2, color: "text-rose-400 bg-rose-500/10" },
  { key: "testReports", label: "Test Reports", icon: FlaskConical, color: "text-emerald-400 bg-emerald-500/10" },
  { key: "comments", label: "Comments", icon: MessageSquare, color: "text-blue-400 bg-blue-500/10" },
  { key: "activities", label: "Total Activities", icon: Activity, color: "text-violet-400 bg-violet-500/10" },
  { key: "recentActivityCount", label: "This Week", icon: BarChart3, color: "text-cyan-400 bg-cyan-500/10" },
];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-500/15 text-amber-400",
  admin: "bg-blue-500/15 text-blue-400",
  member: "bg-emerald-500/15 text-emerald-400",
  viewer: "bg-slate-500/15 text-slate-400",
};

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

export default function TeamAnalyticsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["team-analytics", teamId],
    queryFn: () => getTeamAnalytics(teamId!),
    enabled: !!teamId,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingIndicator size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl accent-bg-light`}>
              <BarChart3 size={18} className="accent-text-base" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Team Analytics
              </h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Overview of your team's activity and metrics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon size={13} />
                </div>
              </div>
              <p className={`text-2xl font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                {(analytics?.stats as any)?.[card.key] ?? 0}
              </p>
              <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Member Roles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <h3 className={`text-sm font-semibold font-[Inter] mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Member Roles
            </h3>
            <div className="space-y-3">
              {analytics?.memberRoles.map((r) => (
                <div key={r.role} className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_COLORS[r.role] || ROLE_COLORS.viewer}`}>
                    {r.role}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full accent-gradient"
                      style={{
                        width: `${analytics.stats.members > 0 ? (r.count / analytics.stats.members) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <h3 className={`text-sm font-semibold font-[Inter] mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Activity Breakdown
            </h3>
            <div className="space-y-3">
              {analytics?.activityByType.slice(0, 8).map((a) => (
                <div key={a.action} className="flex items-center gap-3">
                  <span className={`text-xs font-[Inter] w-28 truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {a.action.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full accent-gradient"
                      style={{
                        width: `${analytics.stats.activities > 0 ? (a.count / analytics.stats.activities) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <div className={`px-6 py-4 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                Recent Activity
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {analytics?.recentActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className={`px-6 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.04]" : "border-slate-50"}` : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full accent-gradient text-[8px] font-bold text-white">
                      {activity.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <p className={`text-xs font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <span className="font-medium">{activity.user?.name}</span>{" "}
                      {activity.details || activity.action.replace(/_/g, " ")}
                    </p>
                  </div>
                  <p className={`text-[10px] font-[Inter] ml-7 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Chats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <div className={`px-6 py-4 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                Recent Chats
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {analytics?.recentChats.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare size={24} className={`mx-auto mb-2 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No chats yet</p>
                </div>
              ) : (
                analytics?.recentChats.map((chat, idx) => (
                  <div
                    key={chat.id}
                    className={`px-6 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.04]" : "border-slate-50"}` : ""}`}
                  >
                    <p className={`text-sm font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                      {chat.title || "Untitled Chat"}
                    </p>
                    <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {timeAgo(chat.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
