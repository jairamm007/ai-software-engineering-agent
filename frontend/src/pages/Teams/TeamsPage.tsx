import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Plus, FolderGit2, Crown, X, Search, LogIn, KeyRound, Copy, Check, MailQuestion, Mail } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";
import { getTeams, createTeam, searchTeamsByCode, searchUsers, joinTeamByCode, getPendingInvitations, acceptInvitationById, rejectInvitationById, inviteByUserCode } from "@/services/team";
import type { Team, SearchedUser } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function TeamsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastCreatedCode, setLastCreatedCode] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [teamForInvite, setTeamForInvite] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  const createMutation = useMutation({
    mutationFn: () => createTeam(newName, newDesc || undefined),
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setLastCreatedCode(newTeam.teamCode);
      setCreateError(null);
      setNewName("");
      setNewDesc("");
      setTimeout(() => {
        setShowCreate(false);
        setLastCreatedCode(null);
      }, 4000);
    },
    onError: (error: any) => {
      setCreateError(error?.response?.data?.message || error?.message || "Failed to create team. Please try again.");
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => joinTeamByCode(joinCode.trim()),
    onSuccess: (result) => {
      setJoinSuccess(result.team.name);
      setJoinCode("");
      setTimeout(() => {
        setShowJoin(false);
        setJoinSuccess(null);
      }, 4000);
    },
    onError: () => {},
  });

  const { data: pendingInvitations = [] } = useQuery({
    queryKey: ["pending-invitations"],
    queryFn: getPendingInvitations,
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => acceptInvitationById(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (invitationId: string) => rejectInvitationById(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["team-search", searchQuery],
    queryFn: () => searchTeamsByCode(searchQuery.trim()),
    enabled: searchQuery.trim().length > 0,
  });

  const { data: userSearchResults = [] } = useQuery({
    queryKey: ["user-search", userSearchQuery],
    queryFn: () => searchUsers(userSearchQuery.trim()),
    enabled: userSearchQuery.trim().length > 0,
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isDark ? "bg-[var(--accent)]/10" : "accent-bg-light"
            }`}>
              <Users size={16} className="accent-text" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                Teams
              </h1>
              <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {teams.length} {teams.length === 1 ? "team" : "teams"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LogIn size={15} />
              Join by Code
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              New Team
            </button>
          </div>
        </motion.div>

        {/* Create Dialog */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                  Create Team
                </h2>
                <button type="button" onClick={() => { setShowCreate(false); setCreateError(null); }} className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Team name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                  }`}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors resize-none ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                  }`}
                />
                {createError && !lastCreatedCode && (
                  <p className="text-xs text-red-400 font-[Inter]">{createError}</p>
                )}
                {lastCreatedCode ? (
                  <div className={`rounded-xl border p-4 text-center ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                    <Check size={20} className="mx-auto mb-2 text-emerald-400" />
                    <p className={`text-xs font-medium font-[Inter] mb-2 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                      Team created! Share this code:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <code className={`rounded-lg border px-4 py-2 text-lg font-bold font-mono tracking-wider ${
                        isDark ? "border-emerald-500/20 bg-black/20 text-emerald-300" : "border-emerald-200 bg-white text-emerald-700"
                      }`}>
                        {lastCreatedCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => { try { navigator.clipboard.writeText(lastCreatedCode!); } catch {} setCopiedCode(lastCreatedCode); setTimeout(() => setCopiedCode(null), 2000); }}
                        className="rounded-lg accent-bg-light p-2"
                      >
                        {copiedCode === lastCreatedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="accent-text" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setLastCreatedCode(null); }}
                      className={`mt-3 text-xs font-[Inter] ${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => createMutation.mutate()}
                      disabled={!newName.trim() || createMutation.isPending}
                      className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {createMutation.isPending && <LoadingIndicator size="sm" />}
                      Create
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join by Code Dialog */}
        <AnimatePresence>
          {showJoin && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound size={15} className="accent-text" />
                  <h2 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                    Join Team by Code
                  </h2>
                </div>
                <button type="button" onClick={() => { setShowJoin(false); setJoinSuccess(null); }} className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}>
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {joinSuccess ? (
                  <div className={`rounded-xl border p-4 text-center ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                    <MailQuestion size={24} className="mx-auto mb-2 text-emerald-400" />
                    <p className={`text-xs font-medium font-[Inter] ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                      Join request sent to <span className="font-bold">{joinSuccess}</span>!
                    </p>
                    <p className={`mt-1 text-[10px] font-[Inter] ${isDark ? "text-emerald-400/60" : "text-emerald-600/60"}`}>
                      Team members will review your request
                    </p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter team code (e.g. ABC12345)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={8}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm font-mono tracking-widest font-[Inter] uppercase outline-none transition-colors ${
                        isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                      }`}
                    />
                    {joinMutation.isError && (
                      <p className="text-xs text-red-400 font-[Inter]">
                        {joinMutation.error?.message || "Invalid or expired team code"}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowJoin(false)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => joinMutation.mutate()}
                        disabled={joinCode.trim().length !== 8 || joinMutation.isPending}
                        className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {joinMutation.isPending && <LoadingIndicator size="sm" />}
                        <LogIn size={13} />
                        Join Team
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Code Search */}
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search teams by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm font-mono font-[Inter] outline-none transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
            }`}
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
            <p className={`text-xs font-medium font-[Inter] mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Search results for &quot;{searchQuery}&quot;
            </p>
            {searchResults.length === 0 ? (
              <p className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                No teams found with that code
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((team: Team) => (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${
                      isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light shrink-0">
                      <Users size={14} className="accent-text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                        {team.name}
                      </p>
                      <p className={`text-[10px] font-mono font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {team.teamCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`flex items-center gap-1 text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        <Users size={10} />
                        {team._count?.members ?? 0}
                      </div>
                      <KeyRound size={12} className={isDark ? "text-slate-600" : "text-slate-300"} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Search */}
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search users by name or code..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value.toUpperCase())}
            className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm font-mono font-[Inter] outline-none transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
            }`}
          />
        </div>

        {/* User Search Results */}
        {userSearchQuery.trim().length >= 2 && (
          <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
            <p className={`text-xs font-medium font-[Inter] mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Users found for &quot;{userSearchQuery}&quot;
            </p>
            {userSearchResults.length === 0 ? (
              <p className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                No users found
              </p>
            ) : (
              <div className="space-y-2">
                {userSearchResults.map((user: SearchedUser) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setTeamForInvite(teams.length > 0 ? teams[0].id : "");
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 transition-colors text-left ${
                      isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light shrink-0">
                      <Users size={14} className="accent-text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                        {user.name}
                      </p>
                      <p className={`text-[10px] font-mono font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {user.userCode}
                      </p>
                    </div>
                    <div className={`text-[10px] font-[Inter] shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {user.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-200 bg-blue-50"}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <MailQuestion size={14} className="text-blue-400" />
              <p className={`text-xs font-semibold font-[Inter] ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                Pending Invitations ({pendingInvitations.length})
              </p>
            </div>
            <div className="space-y-2">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className={`flex items-center justify-between rounded-xl p-3 ${
                    isDark ? "bg-white/[0.03]" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                      <Users size={14} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {inv.team.name}
                      </p>
                      <p className={`text-[10px] font-mono font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {inv.team.teamCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => acceptMutation.mutate(inv.id)}
                      disabled={acceptMutation.isPending}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {acceptMutation.isPending ? <LoadingIndicator size="sm" /> : "Accept"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate(inv.id)}
                      disabled={rejectMutation.isPending}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Team List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingIndicator size="md" />
          </div>
        ) : teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center rounded-2xl border py-20 ${
              isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"
            }`}
          >
            <Users size={40} className={`mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm font-medium font-[Inter] mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              No teams yet
            </p>
            <p className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Create a team to start collaborating
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                whileHover={{ y: -3 }}
                className={`group relative rounded-2xl border p-5 transition-shadow ${
                  isDark
                    ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-[var(--accent)]/5"
                    : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"
                }`}
              >
                <Link to={`/teams/${team.id}`} className="absolute inset-0 rounded-2xl" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light shrink-0`}>
                      <Users size={14} className="accent-text-base" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                        {team.name}
                      </p>
                      {team.description && (
                        <p className={`text-xs font-[Inter] line-clamp-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {team.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {team.teamCode && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <code className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md ${
                      isDark ? "bg-white/[0.04] text-slate-400" : "bg-slate-100 text-slate-500"
                    }`}>
                      {team.teamCode}
                    </code>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try { navigator.clipboard.writeText(team.teamCode!); } catch {}
                        setCopiedCode(team.teamCode!);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="relative shrink-0 rounded p-0.5 transition-colors"
                    >
                      {copiedCode === team.teamCode ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className={isDark ? "text-slate-500" : "text-slate-400"} />}
                    </button>
                  </div>
                )}
                <div className={`flex items-center gap-4 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {team._count?.members ?? team.members?.length ?? 0} members
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderGit2 size={10} />
                    {team._count?.repositories ?? team.repositories?.length ?? 0} repos
                  </span>
                  {team.ownerId && (
                    <span className="flex items-center gap-1 ml-auto">
                      <Crown size={10} className="text-amber-400" />
                      {team.owner?.name || "Owner"}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Team Info Modal ── */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setSelectedTeam(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm rounded-2xl border p-6 ${isDark ? "border-white/10 bg-[#0e0e0e]" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light">
                      <Users size={14} className="accent-text" />
                    </div>
                    <h2 className={`text-sm font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                      {selectedTeam.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(null)}
                    className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  {selectedTeam.description && (
                    <p className={`text-xs font-[Inter] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {selectedTeam.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <code className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md ${
                        isDark ? "bg-white/[0.04] text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}>
                        {selectedTeam.teamCode}
                      </code>
                    </div>
                    <span className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <Users size={10} className="inline mr-0.5" />
                      {selectedTeam._count?.members ?? 0} members
                    </span>
                    <span className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <FolderGit2 size={10} className="inline mr-0.5" />
                      {selectedTeam._count?.repositories ?? 0} repos
                    </span>
                  </div>
                  {selectedTeam.owner && (
                    <div className={`flex items-center gap-1.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <Crown size={11} className="text-amber-400" />
                      {selectedTeam.owner.name}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const result = await joinTeamByCode(selectedTeam.teamCode);
                      setSelectedTeam(null);
                      setJoinSuccess(result.team.name);
                      setShowJoin(true);
                      queryClient.invalidateQueries({ queryKey: ["teams"] });
                      setTimeout(() => {
                        setShowJoin(false);
                        setJoinSuccess(null);
                      }, 4000);
                    } catch {}
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <LogIn size={14} />
                  Send Join Request
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── User Info Modal ── */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm rounded-2xl border p-6 ${isDark ? "border-white/10 bg-[#0e0e0e]" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light">
                      <Users size={14} className="accent-text" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
                        {selectedUser.name}
                      </h2>
                      <p className={`text-[10px] font-mono font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {selectedUser.userCode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className={`rounded-lg p-1 ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  <p className={`text-xs font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {selectedUser.email}
                  </p>
                  {selectedUser.bio && (
                    <p className={`text-xs font-[Inter] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {selectedUser.bio}
                    </p>
                  )}
                </div>

                {teams.length > 0 && (
                  <div className="space-y-3">
                    <select
                      value={teamForInvite}
                      onChange={(e) => setTeamForInvite(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-[Inter] outline-none transition-colors ${
                        isDark
                          ? "border-white/10 bg-white/5 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-900"
                      }`}
                    >
                      {teams.map((t: Team) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={inviteLoading}
                      onClick={async () => {
                        if (!teamForInvite) return;
                        setInviteLoading(true);
                        try {
                          await inviteByUserCode(teamForInvite, selectedUser.userCode);
                          setSelectedUser(null);
                          setInviteLoading(false);
                        } catch {
                          setInviteLoading(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {inviteLoading ? <LoadingIndicator size="sm" /> : <Mail size={14} />}
                      {inviteLoading ? "Sending..." : "Invite to Team"}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
