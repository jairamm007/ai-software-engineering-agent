import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, Trash2 } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import {
  getTeamNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/services/teamNotification";
import type { TeamNotification } from "@/services/teamNotification";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const TYPE_ICONS: Record<string, string> = {
  member_joined: "text-emerald-400",
  repo_shared: "text-blue-400",
  comment_posted: "text-violet-400",
  chat_message: "text-cyan-400",
  code_review: "text-rose-400",
  invitation: "text-amber-400",
  general: "text-slate-400",
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

export default function TeamNotificationsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["team-notifications", teamId],
    queryFn: () => getTeamNotifications(teamId!),
    enabled: !!teamId,
  });

  const { data: unreadData } = useQuery({
    queryKey: ["team-notifications-unread", teamId],
    queryFn: () => getUnreadCount(teamId!),
    enabled: !!teamId,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-notifications", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-notifications-unread", teamId] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(teamId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-notifications", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-notifications-unread", teamId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-notifications", teamId] });
      queryClient.invalidateQueries({ queryKey: ["team-notifications-unread", teamId] });
    },
  });

  return (
    <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl accent-bg-light`}>
                <Bell size={18} className="accent-text-base" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Notifications
                </h1>
                <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {unreadData?.count ?? 0} unread
                </p>
              </div>
            </div>
            {(unreadData?.count ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white"
              >
                <CheckCheck size={13} />
                Mark All Read
              </button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingIndicator size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center rounded-2xl border py-20 ${
              isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-slate-50"
            }`}
          >
            <BellOff size={40} className={`mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              No notifications yet
            </p>
          </motion.div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
            {notifications.map((notif: TeamNotification, idx: number) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  !notif.read ? (isDark ? "bg-white/[0.02]" : "bg-slate-50/50") : ""
                } ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
              >
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!notif.read ? "accent-bg" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                      {notif.title}
                    </p>
                    <span className={`text-[10px] font-[Inter] ${TYPE_ICONS[notif.type] || "text-slate-400"}`}>
                      {notif.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className={`text-xs font-[Inter] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {notif.message}
                  </p>
                  <p className={`text-[10px] font-[Inter] mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5 hover:text-emerald-400" : "text-slate-400 hover:bg-slate-100 hover:text-emerald-500"}`}
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(notif.id)}
                    className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
