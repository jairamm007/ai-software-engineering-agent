import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FolderGit2, Activity, MessageSquare, Settings, BarChart3, Bell, ArrowLeft, Crown, UserMinus, Mail, Trash2, Check, Send, GitBranch, Plus } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  getTeam,
  inviteMember,
  removeMember,
  changeMemberRole,
  deleteTeam,
  shareRepository,
  unshareRepository,
  getSharedRepositories,
  getInvitations,
  cancelInvitation,
  updateTeam,
} from "@/services/team";
import { getActivities } from "@/services/activity";
import { getComments, createComment, deleteComment, resolveComment } from "@/services/comment";
import { getRepositories } from "@/services/repository";
import { getTeamAnalytics } from "@/services/teamAnalytics";
import { getUnreadCount } from "@/services/teamNotification";
import type { TeamMember, TeamInvitation, TeamActivity, Comment, TeamRole } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type Tab = "dashboard" | "members" | "repos" | "activity" | "comments" | "settings";

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "members", label: "Members", icon: Users },
  { key: "repos", label: "Repositories", icon: FolderGit2 },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "comments", label: "Comments", icon: MessageSquare },
  { key: "settings", label: "Settings", icon: Settings },
];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-amber-500/15 text-amber-400",
  admin: "bg-blue-500/15 text-blue-400",
  member: "bg-emerald-500/15 text-emerald-400",
  viewer: "bg-slate-500/15 text-slate-400",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeam(teamId!),
    enabled: !!teamId,
  });

  const { data: analytics } = useQuery({
    queryKey: ["team-analytics", teamId],
    queryFn: () => getTeamAnalytics(teamId!),
    enabled: !!teamId,
  });

  const { data: unreadNotifs } = useQuery({
    queryKey: ["team-notifications-unread", teamId],
    queryFn: () => getUnreadCount(teamId!),
    enabled: !!teamId,
  });

  const myMember = team?.members?.find((m: TeamMember) => m.userId === user?.id);
  const myRole = myMember?.role as TeamRole | undefined;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "owner" || myRole === "admin";
  const isMember = myRole !== "viewer";

  // Members tab
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  const inviteMutation = useMutation({
    mutationFn: () => inviteMember(teamId!, inviteEmail, inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      setInviteEmail("");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(teamId!, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", teamId] }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      changeMemberRole(teamId!, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", teamId] }),
  });

  // Repos tab
  const { data: sharedRepos = [] } = useQuery({
    queryKey: ["team-repos", teamId],
    queryFn: () => getSharedRepositories(teamId!),
    enabled: !!teamId && activeTab === "repos",
  });

  const { data: userRepos = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
    enabled: activeTab === "repos" && isAdmin,
  });

  const [showShareDialog, setShowShareDialog] = useState(false);

  const shareMutation = useMutation({
    mutationFn: ({ repositoryId, permission }: { repositoryId: string; permission: string }) =>
      shareRepository(teamId!, repositoryId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-repos", teamId] });
      setShowShareDialog(false);
    },
  });

  const unshareMutation = useMutation({
    mutationFn: (repositoryId: string) => unshareRepository(teamId!, repositoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-repos", teamId] }),
  });

  // Activity tab
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["team-activity", teamId],
    queryFn: () => getActivities(teamId!, { limit: 50 }),
    enabled: !!teamId && activeTab === "activity",
  });

  // Comments tab
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["team-comments", teamId],
    queryFn: () => getComments(teamId!),
    enabled: !!teamId && activeTab === "comments",
  });

  const postCommentMutation = useMutation({
    mutationFn: () => createComment(teamId!, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-comments", teamId] });
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(teamId!, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-comments", teamId] }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      resolveComment(teamId!, commentId, resolved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-comments", teamId] }),
  });

  // Settings tab
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => updateTeam(teamId!, { name: editName, description: editDesc || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeam(teamId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      window.location.href = "/teams";
    },
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["team-invitations", teamId],
    queryFn: () => getInvitations(teamId!),
    enabled: !!teamId && activeTab === "settings" && isAdmin,
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(teamId!, invitationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-invitations", teamId] }),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <LoadingIndicator size="md" />
        </div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Team not found</p>
          <Link to="/teams" className="text-sm accent-text hover:underline">Back to Teams</Link>
        </div>
      </DashboardLayout>
    );
  }

  // Initialize settings form
  if (!settingsLoaded && team) {
    setEditName(team.name);
    setEditDesc(team.description || "");
    setSettingsLoaded(true);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/teams" className={`inline-flex items-center gap-1.5 text-xs font-medium font-[Inter] mb-4 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
            <ArrowLeft size={13} />
            Back to Teams
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl accent-bg-light`}>
              <Users size={18} className="accent-text-base" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {team.name}
              </h1>
              {team.description && (
                <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {team.description}
                </p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${ROLE_COLORS[myRole || "viewer"]}`}>
                {ROLE_LABELS[myRole || "viewer"]}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className={`flex flex-wrap gap-1 overflow-hidden rounded-xl border p-1 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* ── Dashboard Tab ── */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: "Members", value: analytics?.stats.members ?? team?.members?.length ?? 0, icon: Users, color: "text-blue-400 bg-blue-500/10" },
                  { label: "Repositories", value: analytics?.stats.repositories ?? 0, icon: FolderGit2, color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "AI Chats", value: analytics?.stats.chats ?? 0, icon: MessageSquare, color: "text-violet-400 bg-violet-500/10" },
                  { label: "Comments", value: analytics?.stats.comments ?? 0, icon: MessageSquare, color: "text-cyan-400 bg-cyan-500/10" },
                  { label: "Activities", value: analytics?.stats.recentActivityCount ?? 0, icon: Activity, color: "text-amber-400 bg-amber-500/10" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                    className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.color}`}>
                        <stat.icon size={13} />
                      </div>
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
                    to={`/teams/${teamId}/chat`}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                      isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <MessageSquare size={18} className="text-violet-400" />
                    </div>
                    <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      AI Chat
                    </span>
                  </Link>
                  <Link
                    to={`/teams/${teamId}/analytics`}
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
                    to={`/teams/${teamId}/notifications`}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors relative ${
                      isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Bell size={18} className="text-amber-400" />
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
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("members")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                        isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Plus size={18} className="text-emerald-400" />
                      </div>
                      <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Invite
                      </span>
                    </button>
                  )}
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
                  <div className="max-h-48 overflow-y-auto">
                    {analytics.recentActivities.map((activity, idx) => (
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
            </motion.div>
          )}

          {/* ── Members Tab ── */}
          {activeTab === "members" && (
            <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              {/* Invite */}
              {isAdmin && (
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && inviteEmail.trim() && inviteMutation.mutate()}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                        isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                      }`}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-[Inter] outline-none ${
                        isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
                      }`}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => inviteMutation.mutate()}
                      disabled={!inviteEmail.trim() || inviteMutation.isPending}
                      className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {inviteMutation.isPending ? <LoadingIndicator size="sm" /> : <Send size={13} />}
                      Invite
                    </button>
                  </div>
                  {inviteMutation.isError && (
                    <p className="mt-2 text-xs text-red-400">{(inviteMutation.error as Error)?.message}</p>
                  )}
                </div>
              )}

              {/* Member list */}
              <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                {team.members?.map((member: TeamMember, idx: number) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full accent-gradient text-xs font-bold text-white font-[Inter]">
                      {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                        {member.user?.name || "Unknown"}
                      </p>
                      <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {member.user?.email}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_COLORS[member.role] || ROLE_COLORS.viewer}`}>
                      {member.role === "owner" && <Crown size={8} className="inline mr-1" />}
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                    {isAdmin && member.userId !== user?.id && member.role !== "owner" && (
                      <div className="flex items-center gap-1">
                        <select
                          value={member.role}
                          onChange={(e) => changeRoleMutation.mutate({ memberId: member.userId, role: e.target.value })}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-[Inter] outline-none ${isDark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Remove member"
                        >
                          <UserMinus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Repos Tab ── */}
          {activeTab === "repos" && (
            <motion.div key="repos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowShareDialog(true)}
                    className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white"
                  >
                    <FolderGit2 size={13} />
                    Share Repository
                  </button>
                </div>
              )}

              {/* Share Dialog */}
              <AnimatePresence>
                {showShareDialog && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>Share a Repository</h3>
                      <button type="button" onClick={() => setShowShareDialog(false)} className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userRepos.filter((r) => !sharedRepos.some((s) => s.repositoryId === r.id)).map((repo) => (
                        <div key={repo.id} className={`flex items-center justify-between rounded-xl px-3 py-2 ${isDark ? "bg-white/[0.02]" : "bg-slate-50"}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <GitBranch size={12} className="shrink-0 accent-text" />
                            <span className={`text-sm font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{repo.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => shareMutation.mutate({ repositoryId: repo.id, permission: "read" })}
                            className="rounded-lg accent-bg-light px-2.5 py-1 text-[10px] font-bold accent-text-base"
                          >
                            Share
                          </button>
                        </div>
                      ))}
                      {userRepos.filter((r) => !sharedRepos.some((s) => s.repositoryId === r.id)).length === 0 && (
                        <p className={`text-xs text-center py-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>No repositories available to share</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shared repos list */}
              <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                {sharedRepos.length === 0 ? (
                  <div className="py-12 text-center">
                    <FolderGit2 size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                    <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No shared repositories</p>
                  </div>
                ) : (
                  sharedRepos.map((repo, idx: number) => (
                    <div
                      key={repo.id}
                      className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light`}>
                        <GitBranch size={13} className="accent-text-base" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {repo.repository?.name || repo.repositoryId}
                        </p>
                        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {repo.permission} access &middot; shared {timeAgo(repo.sharedAt)}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => unshareMutation.mutate(repo.repositoryId)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Remove from team"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── Activity Tab ── */}
          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                {activitiesLoading ? (
                  <div className="py-12 flex justify-center">
                    <LoadingIndicator size="md" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-12 text-center">
                    <Activity size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                    <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No activity yet</p>
                  </div>
                ) : (
                  activities.map((activity: TeamActivity, idx: number) => (
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
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── Comments Tab ── */}
          {activeTab === "comments" && (
            <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              {/* Post comment */}
              {isMember && (
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                  <textarea
                    placeholder="Write a comment... Use @username to mention"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors resize-none ${
                      isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                    }`}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => postCommentMutation.mutate()}
                      disabled={!commentText.trim() || postCommentMutation.isPending}
                      className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {postCommentMutation.isPending ? <LoadingIndicator size="sm" /> : <Send size={13} />}
                      Post
                    </button>
                  </div>
                </div>
              )}

              {/* Comment list */}
              <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                {commentsLoading ? (
                  <div className="py-12 flex justify-center">
                    <LoadingIndicator size="md" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                    <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment: Comment, idx: number) => (
                    <div
                      key={comment.id}
                      className={`px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"} ` : ""}${comment.resolved ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full accent-gradient text-[10px] font-bold text-white font-[Inter] mt-0.5">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                              {comment.user?.name || "Unknown"}
                            </span>
                            <span className={`text-[10px] font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                              {timeAgo(comment.createdAt)}
                            </span>
                            {comment.resolved && (
                              <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                                <Check size={8} /> Resolved
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-[Inter] mt-1 whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {isMember && (
                              <button
                                type="button"
                                onClick={() => resolveMutation.mutate({ commentId: comment.id, resolved: !comment.resolved })}
                                className={`text-[10px] font-[Inter] transition-colors ${comment.resolved ? "text-emerald-400" : isDark ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-500"}`}
                              >
                                {comment.resolved ? "Unresolve" : "Resolve"}
                              </button>
                            )}
                            {(comment.userId === user?.id || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                className={`text-[10px] font-[Inter] transition-colors ${isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              {/* Edit Team */}
              {isAdmin && (
                <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                  <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>Team Details</h3>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                      isDark ? "border-white/10 bg-white/5 text-white focus:border-[var(--accent)]"
                        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[var(--accent)]"
                    }`}
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    placeholder="Description (optional)"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors resize-none ${
                      isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <LoadingIndicator size="sm" /> : <Check size={13} />}
                    Save Changes
                  </button>
                </div>
              )}

              {/* Pending Invitations */}
              {isAdmin && (
                <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
                  <div className={`px-4 py-3 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                    <h3 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>Pending Invitations</h3>
                  </div>
                  {invitations.length === 0 ? (
                    <div className="py-8 text-center">
                      <Mail size={24} className={`mx-auto mb-2 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                      <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No pending invitations</p>
                    </div>
                  ) : (
                    invitations.map((inv: TeamInvitation, idx: number) => (
                      <div
                        key={inv.id}
                        className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
                      >
                        <Mail size={14} className="shrink-0 accent-text" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{inv.email}</p>
                          <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {inv.role} &middot; expires {formatDate(inv.expiresAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelInvitationMutation.mutate(inv.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Danger Zone */}
              {isOwner && (
                <div className={`rounded-2xl border border-red-500/20 p-6 ${isDark ? "bg-red-500/[0.03]" : "bg-red-50/50"}`}>
                  <h3 className="text-sm font-semibold text-red-400 font-[Inter] mb-2">Danger Zone</h3>
                  <p className={`text-xs font-[Inter] mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Deleting this team will remove all members, shared repositories, and activity history. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this team? This cannot be undone.")) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? <LoadingIndicator size="sm" /> : <Trash2 size={13} />}
                    Delete Team
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
