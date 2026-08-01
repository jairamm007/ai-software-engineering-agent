import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type {
  GitHubIssue,
  GitHubIssueDetail,
} from "@/types/github-integration";

interface GitHubIssueListProps {
  issues: GitHubIssue[];
  isLoading: boolean;
  state: "open" | "closed" | "all";
  onStateChange: (s: "open" | "closed" | "all") => void;
  onSelect: (n: number) => void;
  selectedIssue: number | null;
  detail: GitHubIssueDetail | undefined;
  detailLoading: boolean;
  onBack: () => void;
  timeAgo: (d: string | Date) => string;
  onCreateIssue?: () => void;
  onAddComment?: (issueNumber: number) => void;
}

export default function GitHubIssueList({
  issues,
  isLoading,
  state,
  onStateChange,
  onSelect,
  selectedIssue,
  detail,
  detailLoading,
  onBack,
  timeAgo,
  onCreateIssue,
  onAddComment,
}: GitHubIssueListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (selectedIssue && detail) {
    return <IssueDetail detail={detail} loading={detailLoading} onBack={onBack} isDark={isDark} timeAgo={timeAgo} onAddComment={onAddComment} />;
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
              {s === "open" && <AlertCircle size={12} />}
              {s === "closed" && <CheckCircle size={12} />}
              {s === "all" && <Filter size={12} />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {issues.length} issue{issues.length !== 1 ? "s" : ""}
        </span>
        {onCreateIssue && (
          <button
            onClick={onCreateIssue}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
          >
            + New Issue
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <AlertCircle size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No issues found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => (
            <button
              key={issue.number}
              type="button"
              onClick={() => onSelect(issue.number)}
              className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                issue.state === "open" ? "bg-emerald-500/15" : "bg-red-500/15"
              }`}>
                {issue.state === "open" ? <AlertCircle size={14} className="text-emerald-400" /> : <CheckCircle size={14} className="text-red-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{issue.number}</span>
                  <span className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{issue.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className={isDark ? "text-slate-500" : "text-slate-400"}>{issue.author}</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(issue.createdAt)}</span>
                  {issue.labels.filter(Boolean).slice(0, 3).map((label) => (
                    <span key={label.name} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                      {label.name}
                    </span>
                  ))}
                  {issue.comments > 0 && (
                    <span className={isDark ? "text-slate-600" : "text-slate-400"}>💬 {issue.comments}</span>
                  )}
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

// ── Issue Detail sub-component ──
function IssueDetail({ detail, loading, onBack, isDark, timeAgo, onAddComment }: {
  detail: GitHubIssueDetail;
  loading: boolean;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
  onAddComment?: (issueNumber: number) => void;
}) {
  if (loading) {
    return <div className={`h-32 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button type="button" onClick={onBack} className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
        ← Back to Issues
      </button>

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{detail.number}</span>
              <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{detail.title}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                detail.state === "open" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              }`}>{detail.state}</span>
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>{detail.author}</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(detail.createdAt)}</span>
            </div>
          </div>
          <a href={detail.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <ExternalLink size={12} /> View on GitHub
          </a>
        </div>

        {detail.labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {detail.labels.filter(Boolean).map((label) => (
              <span key={label.name} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {label.name}
              </span>
            ))}
          </div>
        )}

        {detail.body && (
          <p className={`mt-4 whitespace-pre-wrap rounded-lg p-4 text-sm leading-relaxed ${isDark ? "bg-black/30 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
            {detail.body}
          </p>
        )}
      </div>

      {detail.commentsList.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`flex items-center justify-between border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Comments ({detail.commentsList.length})</h3>
            {onAddComment && (
              <button
                onClick={() => onAddComment(detail.number)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
              >
                + Comment
              </button>
            )}
          </div>
          <div className="divide-y divide-white/5">
            {detail.commentsList.map((c, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{c.author}</span>
                  <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{timeAgo(c.createdAt)}</span>
                </div>
                <p className={`mt-2 whitespace-pre-wrap text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
