import { motion } from "framer-motion";
import { GitCommit, ExternalLink, ArrowUpDown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type {
  GitHubCommit,
  GitHubBranch,
} from "@/types/github-integration";

interface GitHubCommitListProps {
  commits: GitHubCommit[];
  isLoading: boolean;
  branches: GitHubBranch[];
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  timeAgo: (d: string | Date) => string;
}

export default function GitHubCommitList({
  commits,
  isLoading,
  branches,
  selectedBranch,
  onBranchChange,
  timeAgo,
}: GitHubCommitListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className={`appearance-none rounded-lg border py-2 pl-3 pr-8 text-xs font-medium outline-none cursor-pointer transition-colors ${
              isDark ? "border-white/10 bg-white/5 text-white focus:border-[var(--accent)]" : "border-slate-200 bg-white text-slate-900 focus:border-[var(--accent)]"
            }`}
          >
            {branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} {b.isDefault ? "(default)" : ""}
              </option>
            ))}
          </select>
          <ArrowUpDown size={12} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        </div>
        <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {commits.length} commit{commits.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-14 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : commits.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <GitCommit size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No commits found</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className="divide-y divide-white/5">
            {commits.map((c) => (
              <div key={c.sha} className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                  <GitCommit size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{c.message.split("\n")[0]}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px]">
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>{c.author}</span>
                    {c.date && <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(c.date)}</span>}
                    <span className={`font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>{c.sha.slice(0, 7)}</span>
                  </div>
                </div>
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                  className={`shrink-0 rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-600 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"}`}>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
