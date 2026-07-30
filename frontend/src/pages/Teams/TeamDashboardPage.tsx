import { useOutletContext, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, FolderGit2, MessageSquare, Activity, BarChart3,
  Bell, Plus, Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeam, getSharedRepositories } from "@/services/team";
import { getTeamAnalytics } from "@/services/teamAnalytics";
import { getUnreadCount } from "@/services/teamNotification";
import { getActivities } from "@/services/activity";
import type { Team, TeamActivity, TeamRole } from "@/types/team";

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

export default function TeamDashboardPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = myRole === "owner" || myRole === "admin";

  const { data: analytics } = useQuery({
    queryKey: ["team-analytics", team.id],
    queryFn: () => getTeamAnalytics(team.id),
  });

  const { data: unreadNotifs } = useQuery({
    queryKey: ["team-notifications-unread", team.id],
    queryFn: () => getUnreadCount(team.id),
  });

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl accent-bg-light">
            <Users size={22} className="accent-text-base" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {team.name}
            </h1>
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {team.description || `Team code: ${team.teamCode}`}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-400`}>
              {team.visibility}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Members", value: analytics?.stats.members ?? team.members?.length ?? 0, icon: Users, color: "text-blue-400 bg-blue-500/10" },
          { label: "Repositories", value: analytics?.stats.repositories ?? 0, icon: FolderGit2, color: "text-emerald-400 bg-emerald-500/10" },
          { label: "AI Chats", value: analytics?.stats.chats ?? 0, icon: MessageSquare, color: "text-violet-400 bg-violet-500/10" },
          { label: "Documents", value: analytics?.stats.documents ?? 0, icon: FolderGit2, color: "text-amber-400 bg-amber-500/10" },
          { label: "Code Reviews", value: analytics?.stats.codeReviews ?? 0, icon: BarChart3, color: "text-rose-400 bg-rose-500/10" },
          { label: "Activities", value: analytics?.stats.recentActivityCount ?? 0, icon: Activity, color: "text-cyan-400 bg-cyan-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.color} mb-2`}>
              <stat.icon size={13} />
            </div>
            <p className={`text-2xl font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
              {stat.value}
            </p>
            <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
        <h3 className={`text-sm font-semibold font-[Inter] mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
          Quick Actions
        </h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Link
            to={`/teams/${team.id}/chat`}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Sparkles size={18} className="text-violet-400" />
            </div>
            <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              AI Chat
            </span>
          </Link>
          <Link
            to={`/teams/${team.id}/docs`}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <FolderGit2 size={18} className="text-amber-400" />
            </div>
            <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Docs
            </span>
          </Link>
          <Link
            to={`/teams/${team.id}/analytics`}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <BarChart3 size={18} className="text-cyan-400" />
            </div>
            <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Analytics
            </span>
          </Link>
          <Link
            to={`/teams/${team.id}/notifications`}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors relative ${
              isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
              <Bell size={18} className="text-rose-400" />
            </div>
            <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Notifications
            </span>
            {(unreadNotifs?.count ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                {unreadNotifs!.count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {analytics?.recentActivities && analytics.recentActivities.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className={`px-6 py-4 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
              Recent Activity
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {analytics.recentActivities.map((activity: TeamActivity, idx: number) => (
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
        </div>
      )}
    </div>
  );
}
