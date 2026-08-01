import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGitHubIssueComment, createGitHubPRComment } from "@/services/github-integration";
import type { GitHubCreatedComment, GitHubCreatedReview } from "@/types/github-integration";

interface GitHubCommentFormProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: string;
  owner: string;
  repo: string;
  type: "issue" | "pr";
  number: number;
}

export default function GitHubCommentForm({
  isOpen,
  onClose,
  integrationId,
  owner,
  repo,
  type,
  number,
}: GitHubCommentFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const createMutation = useMutation<GitHubCreatedComment | GitHubCreatedReview, Error, string>({
    mutationFn: (commentBody: string) =>
      type === "issue"
        ? createGitHubIssueComment(integrationId, owner, repo, number, commentBody)
        : createGitHubPRComment(integrationId, owner, repo, number, commentBody),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: type === "issue" ? ["github-issue-detail"] : ["github-pr-detail"] });
      setBody("");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    createMutation.mutate(body);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-lg rounded-2xl border p-6 ${
            isDark ? "border-white/10 bg-[#110b1f]" : "border-slate-200 bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Add Comment to {type === "issue" ? `Issue #${number}` : `PR #${number}`}
            </h3>
            <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
              <X size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={5}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors resize-none ${
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
              }`}
              autoFocus
            />

            {createMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                <AlertCircle size={16} />
                {createMutation.error instanceof Error ? createMutation.error.message : "Failed to add comment"}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!body.trim() || createMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                <MessageSquare size={14} />
                {createMutation.isPending ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
