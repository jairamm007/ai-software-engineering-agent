import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest, X, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createGitHubPullRequest, listGitHubBranches } from "@/services/github-integration";
import type { GitHubCreatePRParams } from "@/types/github-integration";

interface GitHubCreatePRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: string;
  owner: string;
  repo: string;
}

export default function GitHubCreatePRDialog({
  isOpen,
  onClose,
  integrationId,
  owner,
  repo,
}: GitHubCreatePRDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [form, setForm] = useState<GitHubCreatePRParams>({
    title: "",
    body: "",
    head: "",
    base: "main",
    draft: false,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["github-branches", integrationId, owner, repo],
    queryFn: () => listGitHubBranches(integrationId, owner, repo),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (params: GitHubCreatePRParams) =>
      createGitHubPullRequest(integrationId, owner, repo, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-prs"] });
      setForm({ title: "", body: "", head: "", base: "main", draft: false });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.head.trim() || !form.base.trim()) return;
    createMutation.mutate(form);
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
            isDark
              ? "border-white/10 bg-[#110b1f]"
              : "border-slate-200 bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Create Pull Request
            </h3>
            <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
              <X size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="PR title"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                }`}
                autoFocus
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Description
              </label>
              <textarea
                value={form.body ?? ""}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Describe the changes..."
                rows={4}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors resize-none ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Head (source branch) *
                </label>
                <select
                  value={form.head}
                  onChange={(e) => setForm({ ...form, head: e.target.value })}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[var(--accent)]"
                  }`}
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} {b.isDefault ? "(default)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Base (target branch) *
                </label>
                <select
                  value={form.base}
                  onChange={(e) => setForm({ ...form, base: e.target.value })}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[var(--accent)]"
                  }`}
                >
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} {b.isDefault ? "(default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.draft ?? false}
                onChange={(e) => setForm({ ...form, draft: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Create as draft
              </span>
            </label>

            {createMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                <AlertCircle size={16} />
                {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create PR"}
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
                disabled={!form.title.trim() || !form.head.trim() || !form.base.trim() || createMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                <GitPullRequest size={14} />
                {createMutation.isPending ? "Creating..." : "Create PR"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
