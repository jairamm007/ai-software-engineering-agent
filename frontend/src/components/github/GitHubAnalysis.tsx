import { motion } from "framer-motion";
import {
  Star,
  GitFork,
  GitPullRequest,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { GitHubRepositoryAnalysis } from "@/types/github-integration";

interface GitHubAnalysisProps {
  analysis: GitHubRepositoryAnalysis | undefined;
  isLoading: boolean;
  timeAgo: (d: string | Date) => string;
}

export default function GitHubAnalysis({
  analysis,
  isLoading,
  timeAgo,
}: GitHubAnalysisProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className={`h-40 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
        <div className={`h-60 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
      </div>
    );
  }

  if (!analysis) return null;

  const statCards = [
    { label: "Stars", value: analysis.repository.stars, icon: Star, color: "text-amber-400" },
    { label: "Forks", value: analysis.repository.forks, icon: GitFork, color: "text-blue-400" },
    { label: "Open PRs", value: analysis.summary.openPRs, icon: GitPullRequest, color: "text-purple-400" },
    { label: "Open Issues", value: analysis.summary.openIssues, icon: AlertCircle, color: "text-red-400" },
    { label: "Contributors", value: analysis.summary.contributors, icon: Eye, color: "text-emerald-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{analysis.repository.name}</h2>
            {analysis.repository.description && (
              <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{analysis.repository.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs">
              {analysis.repository.language && (
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>{analysis.repository.language}</span>
              )}
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>
                Created {timeAgo(analysis.repository.createdAt)}
              </span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>
                Updated {timeAgo(analysis.repository.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <stat.icon size={16} className={stat.color} />
            <p className={`mt-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {analysis.recentPRs.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Pull Requests</h3>
          </div>
          <div className="divide-y divide-white/5">
            {analysis.recentPRs.map((pr) => (
              <a key={pr.number} href={pr.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}>
                <GitPullRequest size={14} className="shrink-0 text-purple-400" />
                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{pr.number}</span>
                  <span className={`ml-2 truncate text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{pr.title}</span>
                </div>
                <span className={`shrink-0 text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{pr.author}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {analysis.recentIssues.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Issues</h3>
          </div>
          <div className="divide-y divide-white/5">
            {analysis.recentIssues.map((issue) => (
              <a key={issue.number} href={issue.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}>
                <AlertCircle size={14} className="shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{issue.number}</span>
                  <span className={`ml-2 truncate text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{issue.title}</span>
                </div>
                <span className={`shrink-0 text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{issue.author}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
