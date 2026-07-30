import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Loader2, Filter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getActivities } from "@/services/activity";
import type { Team, TeamActivity, TeamRole } from "@/types/team";
import { useState } from "react";

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

export default function TeamActivityPage() {
  const { team } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filter, setFilter] = useState<string>("");

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["team-activity", team.id, filter],
    queryFn: () => getActivities(team.id, { limit: 100, action: filter || undefined }),
  });

  const actions = [...new Set(activities.map((a: TeamActivity) => a.action))];

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
            Activity
          </h1>
          <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {activities.length} activities
          </p>
        </div>
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`rounded-lg border px-2 py-1 text-[10px] font-[Inter] outline-none ${
                isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <option value="">All</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={20} className="animate-spin accent-text" />
        </div>
      ) : activities.length === 0 ? (
        <div className={`rounded-2xl border py-16 text-center ${isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
          <Activity size={40} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No activity yet</p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          {activities.map((activity: TeamActivity, idx: number) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full accent-gradient text-[10px] font-bold text-white font-[Inter] mt-0.5">
                {activity.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <span className="font-medium">{activity.user?.name || "Someone"}</span>{" "}
                  {activity.details || activity.action.replace(/_/g, " ")}
                </p>
                <p className={`text-[10px] font-[Inter] mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
