import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, GitBranch, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getSharedRepositories, shareRepository, unshareRepository } from "@/services/team";
import { getRepositories } from "@/services/repository";
import type { Team, TeamRepository, TeamRole } from "@/types/team";

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

export default function TeamReposPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const isAdmin = myRole === "owner" || myRole === "admin";
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: sharedRepos = [] } = useQuery({
    queryKey: ["team-repos", team.id],
    queryFn: () => getSharedRepositories(team.id),
  });

  const { data: userRepos = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
    enabled: isAdmin,
  });

  const shareMutation = useMutation({
    mutationFn: ({ repositoryId, permission }: { repositoryId: string; permission: string }) =>
      shareRepository(team.id, repositoryId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-repos", team.id] });
      setShowShareDialog(false);
    },
  });

  const unshareMutation = useMutation({
    mutationFn: (repositoryId: string) => unshareRepository(team.id, repositoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-repos", team.id] }),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
            Repositories
          </h1>
          <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {sharedRepos.length} shared repositories
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white"
          >
            <FolderGit2 size={13} />
            Share Repository
          </button>
        )}
      </motion.div>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-[var(--bg-secondary)]" : "border-slate-200 bg-white"}`}
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

      {/* Shared Repos List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
        {sharedRepos.length === 0 ? (
          <div className="py-12 text-center">
            <FolderGit2 size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No shared repositories</p>
          </div>
        ) : (
          sharedRepos.map((repo: TeamRepository, idx: number) => (
            <div
              key={repo.id}
              className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? `border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}` : ""}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light">
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
    </div>
  );
}
