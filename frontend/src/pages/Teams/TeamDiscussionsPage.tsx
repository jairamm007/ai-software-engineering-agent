import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageSquare, Send, Check, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getComments, createComment, deleteComment, resolveComment } from "@/services/comment";
import type { Team, Comment, TeamRole } from "@/types/team";

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

export default function TeamDiscussionsPage() {
  const { team, myRole } = useOutletContext<OutletContext>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMember = myRole !== "viewer";
  const isAdmin = myRole === "owner" || myRole === "admin";
  const [commentText, setCommentText] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["team-comments", team.id],
    queryFn: () => getComments(team.id),
  });

  const postCommentMutation = useMutation({
    mutationFn: () => createComment(team.id, commentText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-comments", team.id] });
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(team.id, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-comments", team.id] }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      resolveComment(team.id, commentId, resolved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-comments", team.id] }),
  });

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-lg font-bold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
          Discussions
        </h1>
        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {comments.length} comments
        </p>
      </motion.div>

      {/* Post Comment */}
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
              {postCommentMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comment List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 size={20} className="animate-spin accent-text" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No discussions yet</p>
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
    </div>
  );
}
