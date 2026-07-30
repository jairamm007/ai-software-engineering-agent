import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, MessageSquare, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGitHubPRReview } from "@/services/github-integration";
import type { GitHubCreateReviewParams } from "@/types/github-integration";

interface GitHubReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: string;
  owner: string;
  repo: string;
  pullNumber: number;
}

export default function GitHubReviewForm({
  isOpen,
  onClose,
  integrationId,
  owner,
  repo,
  pullNumber,
}: GitHubReviewFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [event, setEvent] = useState<"APPROVE" | "REQUEST_CHANGES" | "COMMENT">("COMMENT");
  const [body, setBody] = useState("");

  const createMutation = useMutation({
    mutationFn: (params: GitHubCreateReviewParams) =>
      createGitHubPRReview(integrationId, owner, repo, pullNumber, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-pr-detail"] });
      setBody("");
      setEvent("COMMENT");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    createMutation.mutate({ body, event });
  };

  if (!isOpen) return null;

  const eventOptions = [
    { value: "APPROVE" as const, label: "Approve", icon: CheckCircle, color: "text-green-400" },
    { value: "REQUEST_CHANGES" as const, label: "Request Changes", icon: XCircle, color: "text-red-400" },
    { value: "COMMENT" as const, label: "Comment", icon: MessageSquare, color: "text-blue-400" },
  ];

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
              Review Pull Request #{pullNumber}
            </h3>
            <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
              <X size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Review Action
              </label>
              <div className="flex gap-2">
                {eventOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEvent(opt.value)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      event === opt.value
                        ? "bg-[var(--accent)] text-white"
                        : isDark
                          ? "bg-white/5 text-slate-400 hover:bg-white/10"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <opt.icon size={14} className={event === opt.value ? "text-white" : opt.color} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Review Comment *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  event === "APPROVE"
                    ? "Looks good to me!"
                    : event === "REQUEST_CHANGES"
                      ? "Please address these issues..."
                      : "Leave a comment..."
                }
                rows={5}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors resize-none ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                }`}
                autoFocus
              />
            </div>

            {createMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                <AlertCircle size={16} />
                {createMutation.error instanceof Error ? createMutation.error.message : "Failed to submit review"}
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
                {createMutation.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
