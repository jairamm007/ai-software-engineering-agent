import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Copy, Trash2, Mail } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { updateTeam, deleteTeam, getInvitations, cancelInvitation } from "@/services/team";
import type { Team, TeamInvitation, TeamRole } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface OutletContext {
  team: Team;
  myRole: TeamRole;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TeamSettingsPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOwner = myRole === "owner";
  const isAdmin = myRole === "owner" || myRole === "admin";

  const [editName, setEditName] = useState(team.name);
  const [editDesc, setEditDesc] = useState(team.description || "");
  const [copied, setCopied] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => updateTeam(team.id, { name: editName, description: editDesc || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", team.id] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeam(team.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      navigate("/teams");
    },
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["team-invitations", team.id],
    queryFn: () => getInvitations(team.id),
    enabled: isAdmin,
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(team.id, invitationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-invitations", team.id] }),
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
          Settings
        </h1>
      </motion.div>

      {/* Team Code */}
      <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
        <h3 className={`text-sm font-semibold font-[Inter] mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          Team Code
        </h3>
        <p className={`text-xs font-[Inter] mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Share this code with others so they can join your team
        </p>
        <div className="flex items-center gap-2">
          <code className={`rounded-lg border px-4 py-2 text-lg font-bold font-mono tracking-wider ${
            isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
          }`}>
            {team.teamCode}
          </code>
          <button
            type="button"
            onClick={() => {
              try { navigator.clipboard.writeText(team.teamCode); } catch { /* clipboard unavailable */ }
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-lg accent-bg-light px-3 py-2 text-xs font-medium accent-text transition-colors"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Edit Team */}
      {isAdmin && (
        <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
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
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
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
    </div>
  );
}
