import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, GitBranch, Star, GitFork, ExternalLink, Download, RefreshCw, FolderGit2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { GitHubRepoListItem } from "@/types/github-integration";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface GitHubRepoListProps {
  repos: GitHubRepoListItem[];
  isLoading: boolean;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (owner: string, name: string) => void;
  selectedRepo: { owner: string; name: string } | null;
  onImport: (owner: string, name: string) => void;
  onSync: (owner: string, name: string) => void;
  importingRepo: { owner: string; name: string } | null;
  syncPending: boolean;
  timeAgo: (d: string | Date) => string;
}

export default function GitHubRepoList({
  repos,
  isLoading,
  search,
  onSearch,
  onSelect,
  selectedRepo,
  onImport,
  onSync,
  importingRepo,
  syncPending,
  timeAgo,
}: GitHubRepoListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: localRepos } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => import("@/services/repository").then((m) => m.getRepositories()),
  });

  const isImported = (owner: string, name: string) =>
    localRepos?.some((r: { githubUrl: string }) => r.githubUrl.includes(`${owner}/${name}`));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="relative mb-4">
        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors ${
            isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-[var(--accent)]" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
          }`}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-20 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <FolderGit2 size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No repositories found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repos.map((repo) => {
            const imported = isImported(repo.owner, repo.name);
            const isSelected = selectedRepo?.owner === repo.owner && selectedRepo?.name === repo.name;
            return (
              <div
                key={repo.id}
                className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(repo.owner, repo.name)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                    <GitBranch size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {repo.fullName}
                      </span>
                      {repo.isPrivate && (
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"}`}>
                          Private
                        </span>
                      )}
                      {imported && (
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                          Imported
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className={`mt-0.5 truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      {repo.language && (
                        <span className={isDark ? "text-slate-500" : "text-slate-400"}>{repo.language}</span>
                      )}
                      <span className={`flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <Star size={10} /> {repo.starsCount}
                      </span>
                      <span className={`flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <GitFork size={10} /> {repo.forksCount}
                      </span>
                      <span className={isDark ? "text-slate-600" : "text-slate-400"}>
                        Updated {timeAgo(repo.updatedAt)}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg p-2 transition-colors ${isDark ? "text-slate-500 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"}`}
                    title="Open on GitHub"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {imported ? (
                    <button
                      type="button"
                      onClick={() => onSync(repo.owner, repo.name)}
                      disabled={syncPending}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {syncPending ? <LoadingIndicator size="sm" /> : <RefreshCw size={10} />}
                      Sync
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onImport(repo.owner, repo.name)}
                      disabled={importingRepo?.owner === repo.owner && importingRepo?.name === repo.name}
                      className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {importingRepo?.owner === repo.owner && importingRepo?.name === repo.name ? <LoadingIndicator size="sm" /> : <Download size={10} />}
                      Import
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
