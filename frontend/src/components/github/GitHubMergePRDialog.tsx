import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitMerge, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mergeGitHubPullRequest } from "@/services/github-integration";

interface GitHubMergePRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: string;
  owner: string;
  repo: string;
  pullNumber: number;
  prTitle: string;
}

export default function GitHubMergePRDialog({
  isOpen,
  onClose,
  integrationId,
  owner,
  repo,
  pullNumber,
  prTitle,
}: GitHubMergePRDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [mergeMethod, setMergeMethod] = useState<"merge" | "squash" | "rebase">("squash");
  const [commitTitle, setCommitTitle] = useState(`${prTitle} (#${pullNumber})`);
  const [commitMessage, setCommitMessage] = useState("");

  const mergeMutation = useMutation({
    mutationFn: () =>
      mergeGitHubPullRequest(integrationId, owner, repo, pullNumber, {
        mergeMethod,
        commitTitle,
        commitMessage,
      }),
    onSuccess: (result) => {
      if (result.merged) {
        queryClient.invalidateQueries({ queryKey: ["github-prs"] });
        queryClient.invalidateQueries({ queryKey: ["github-pr-detail"] });
        onClose();
      }
    },
  });

  if (!isOpen) return null;

  const methodOptions = [
    { value: "merge" as const, label: "Merge", desc: "Create a merge commit" },
    { value: "squash" as const, label: "Squash", desc: "Squash and merge" },
    { value: "rebase" as const, label: "Rebase", desc: "Rebase and merge" },
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
              Merge Pull Request #{pullNumber}
            </h3>
            <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
              <X size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); mergeMutation.mutate(); }} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Merge Method
              </label>
              <div className="flex gap-2">
                {methodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMergeMethod(opt.value)}
                    className={`flex-1 rounded-xl px-3 py-2 text-center transition-colors ${
                      mergeMethod === opt.value
                        ? "bg-[var(--accent)] text-white"
                        : isDark
                          ? "bg-white/5 text-slate-400 hover:bg-white/10"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className={`text-xs ${mergeMethod === opt.value ? "text-white/70" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Commit Title
              </label>
              <input
                type="text"
                value={commitTitle}
                onChange={(e) => setCommitTitle(e.target.value)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white focus:border-[var(--accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[var(--accent)]"
                }`}
              />
            </div>

            {mergeMethod === "squash" && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Commit Message (optional)
                </label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Additional commit message..."
                  rows={3}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors resize-none ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                  }`}
                />
              </div>
            )}

            {mergeMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                <AlertCircle size={16} />
                {mergeMutation.error instanceof Error ? mergeMutation.error.message : "Failed to merge"}
              </div>
            )}

            {mergeMutation.data && !mergeMutation.data.merged && (
              <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400">
                <AlertCircle size={16} />
                {mergeMutation.data.message}
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
                disabled={mergeMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <GitMerge size={14} />
                {mergeMutation.isPending ? "Merging..." : "Confirm Merge"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
