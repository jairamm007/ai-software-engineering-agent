import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown, UserMinus, Send } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { inviteMember, removeMember, changeMemberRole, inviteByUserCode } from "@/services/team";
import type { Team, TeamMember, TeamRole } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";

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

interface OutletContext {
  team: Team;
  myRole: TeamRole;
}

export default function TeamMembersPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = myRole === "owner" || myRole === "admin";

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [showCodeInvite, setShowCodeInvite] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: () => inviteMember(team.id, inviteEmail, inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", team.id] });
      setInviteEmail("");
    },
  });

  const inviteCodeMutation = useMutation({
    mutationFn: () => inviteByUserCode(team.id, inviteCode, inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", team.id] });
      setInviteCode("");
      setShowCodeInvite(false);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(team.id, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", team.id] }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      changeMemberRole(team.id, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", team.id] }),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
          Members
        </h1>
        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {team.members?.length ?? 0} members
        </p>
      </motion.div>

      {/* Invite */}
      {isAdmin && (
        <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Invite by email"
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCodeInvite(!showCodeInvite)}
              className={`text-xs font-[Inter] transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              {showCodeInvite ? "Hide" : "Invite by user code instead"}
            </button>
          </div>

          {showCodeInvite && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter user code (e.g. ABC12345)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && inviteCode.trim() && inviteCodeMutation.mutate()}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                  isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                }`}
              />
              <button
                type="button"
                onClick={() => inviteCodeMutation.mutate()}
                disabled={!inviteCode.trim() || inviteCodeMutation.isPending}
                className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {inviteCodeMutation.isPending ? <LoadingIndicator size="sm" /> : <Send size={13} />}
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {/* Member List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
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
                {member.user?.userCode && (
                  <span className={`ml-2 text-[9px] font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    #{member.user.userCode}
                  </span>
                )}
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
    </div>
  );
}
