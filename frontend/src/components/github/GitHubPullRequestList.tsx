import { motion } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type {
  GitHubPullRequest,
  GitHubPullRequestDetail,
} from "@/types/github-integration";

// ── List + Detail wrapper ──
interface GitHubPullRequestListProps {
  prs: GitHubPullRequest[];
  isLoading: boolean;
  state: "open" | "closed" | "all";
  onStateChange: (s: "open" | "closed" | "all") => void;
  onSelect: (n: number) => void;
  selectedPR: number | null;
  detail: GitHubPullRequestDetail | undefined;
  detailLoading: boolean;
  onBack: () => void;
  timeAgo: (d: string | Date) => string;
  onCreatePR?: () => void;
  onReview?: (pullNumber: number) => void;
  onMerge?: (pullNumber: number) => void;
}

export default function GitHubPullRequestList({
  prs,
  isLoading,
  state,
  onStateChange,
  onSelect,
  selectedPR,
  detail,
  detailLoading,
  onBack,
  timeAgo,
  onCreatePR,
  onReview,
  onMerge,
}: GitHubPullRequestListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (selectedPR && detail) {
    return <PRDetail detail={detail} loading={detailLoading} onBack={onBack} isDark={isDark} timeAgo={timeAgo} onReview={onReview} onMerge={onMerge} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          {(["open", "closed", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStateChange(s)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                state === s
                  ? "bg-[var(--accent)] text-white"
                  : isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "open" && <GitPullRequest size={12} />}
              {s === "closed" && <CheckCircle size={12} />}
              {s === "all" && <Filter size={12} />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {prs.length} pull request{prs.length !== 1 ? "s" : ""}
        </span>
        {onCreatePR && (
          <button
            onClick={onCreatePR}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
          >
            + New PR
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : prs.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <GitPullRequest size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No pull requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prs.map((pr) => (
            <button
              key={pr.number}
              type="button"
              onClick={() => onSelect(pr.number)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {pr.merged ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                  <GitPullRequest size={14} className="text-purple-400" />
                </div>
              ) : pr.state === "open" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <GitPullRequest size={14} className="text-emerald-400" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15">
                  <CheckCircle size={14} className="text-red-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{pr.number}</span>
                  <span className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{pr.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px]">
                  <span className={isDark ? "text-slate-500" : "text-slate-400"}>{pr.author}</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(pr.createdAt)}</span>
                  <span className="text-emerald-500">+{pr.additions}</span>
                  <span className="text-red-500">-{pr.deletions}</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>{pr.changedFiles} files</span>
                </div>
              </div>
              <ChevronRight size={14} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── PR Detail sub-component ──
function PRDetail({ detail, loading, onBack, isDark, timeAgo, onReview, onMerge }: {
  detail: GitHubPullRequestDetail;
  loading: boolean;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
  onReview?: (pullNumber: number) => void;
  onMerge?: (pullNumber: number) => void;
}) {
  if (loading) {
    return <div className={`h-32 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button type="button" onClick={onBack} className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
        ← Back to Pull Requests
      </button>

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{detail.number}</span>
              <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{detail.title}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>{detail.author}</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>{detail.headBranch} → {detail.baseBranch}</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(detail.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {detail.state === "open" && onMerge && (
              <button
                onClick={() => onMerge(detail.number)}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
              >
                Merge
              </button>
            )}
            {detail.state === "open" && onReview && (
              <button
                onClick={() => onReview(detail.number)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
              >
                Review
              </button>
            )}
            <a href={detail.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <ExternalLink size={12} /> GitHub
            </a>
          </div>
        </div>
        {detail.body && (
          <p className={`mt-4 whitespace-pre-wrap rounded-lg p-4 text-sm leading-relaxed ${isDark ? "bg-black/30 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
            {detail.body}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-emerald-500 font-medium">+{detail.additions} additions</span>
          <span className="text-red-500 font-medium">-{detail.deletions} deletions</span>
          <span className={isDark ? "text-slate-500" : "text-slate-400"}>{detail.changedFiles} changed files</span>
        </div>
      </div>

      {detail.files.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Changed Files ({detail.files.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {detail.files.map((f) => (
              <div key={f.filename} className={`flex items-center justify-between border-b px-5 py-2.5 text-xs last:border-b-0 ${isDark ? "border-white/5" : "border-slate-50"}`}>
                <span className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{f.filename}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-emerald-500">+{f.additions}</span>
                  <span className="text-red-500">-{f.deletions}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    f.status === "added" ? "bg-emerald-500/10 text-emerald-500" :
                    f.status === "removed" ? "bg-red-500/10 text-red-500" :
                    isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  }`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {detail.reviews.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Reviews ({detail.reviews.length})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {detail.reviews.map((r, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{r.user}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    r.state === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" :
                    r.state === "CHANGES_REQUESTED" ? "bg-red-500/10 text-red-500" :
                    isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  }`}>{r.state}</span>
                </div>
                {r.body && <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
