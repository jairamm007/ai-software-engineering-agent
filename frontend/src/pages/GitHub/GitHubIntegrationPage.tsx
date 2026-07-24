import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Link2,
  Unlink,
  Loader2,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  GitFork,
  Eye,
  Code2,
  FolderGit2,
  ChevronRight,
  X,
  Check,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";
import {
  getIntegrations,
  autoConnectGitHub,
  disconnectGitHub,
  listGitHubRepositories,
  importGitHubRepository,
  syncGitHubRepository,
  analyzeGitHubRepository,
  listGitHubBranches,
  listGitHubCommits,
  listGitHubPullRequests,
  getGitHubPullRequest,
  listGitHubIssues,
  getGitHubIssue,
} from "@/services/github-integration";
import type {
  GitHubIntegration,
  GitHubRepoListItem,
  GitHubBranch,
  GitHubCommit,
  GitHubPullRequest,
  GitHubPullRequestDetail,
  GitHubIssue,
  GitHubIssueDetail,
  GitHubRepositoryAnalysis,
} from "@/types/github-integration";

type Tab = "repos" | "pulls" | "issues" | "commits" | "analysis";

const TABS: { key: Tab; label: string; icon: typeof Github }[] = [
  { key: "repos", label: "Repositories", icon: FolderGit2 },
  { key: "pulls", label: "Pull Requests", icon: GitPullRequest },
  { key: "issues", label: "Issues", icon: AlertCircle },
  { key: "commits", label: "Commits", icon: GitCommit },
  { key: "analysis", label: "Analysis", icon: Code2 },
];

export default function GitHubIntegrationPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("repos");
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; name: string } | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [prState, setPrState] = useState<"open" | "closed" | "all">("open");
  const [issueState, setIssueState] = useState<"open" | "closed" | "all">("open");
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  // ── Integration Status ──
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ["github-integrations"],
    queryFn: getIntegrations,
  });

  const integration = integrations?.find((i: GitHubIntegration) => i.isActive);

  const connectMutation = useMutation({
    mutationFn: autoConnectGitHub,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["github-integrations"] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => disconnectGitHub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-integrations"] });
      setSelectedRepo(null);
    },
  });

  // ── GitHub Repos ──
  const { data: githubRepos = [], isLoading: reposLoading } = useQuery({
    queryKey: ["github-repos", integration?.id],
    queryFn: () => listGitHubRepositories(integration!.id),
    enabled: !!integration,
  });

  const filteredRepos = useMemo(
    () => githubRepos.filter(
      (r) => !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase()) || r.fullName.toLowerCase().includes(repoSearch.toLowerCase())
    ),
    [githubRepos, repoSearch]
  );

  // ── Branches ──
  const { data: branches = [] } = useQuery({
    queryKey: ["github-branches", integration?.id, selectedRepo],
    queryFn: () => listGitHubBranches(integration!.id, selectedRepo!.owner, selectedRepo!.name),
    enabled: !!integration && !!selectedRepo,
  });

  // ── Pull Requests ──
  const { data: pullRequests = [], isLoading: prsLoading } = useQuery({
    queryKey: ["github-prs", integration?.id, selectedRepo, prState],
    queryFn: () => listGitHubPullRequests(integration!.id, selectedRepo!.owner, selectedRepo!.name, prState),
    enabled: !!integration && !!selectedRepo && activeTab === "pulls",
  });

  const { data: prDetail, isLoading: prDetailLoading } = useQuery({
    queryKey: ["github-pr-detail", integration?.id, selectedRepo, selectedPR],
    queryFn: () => getGitHubPullRequest(integration!.id, selectedRepo!.owner, selectedRepo!.name, selectedPR!),
    enabled: !!integration && !!selectedRepo && selectedPR !== null,
  });

  // ── Issues ──
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["github-issues", integration?.id, selectedRepo, issueState],
    queryFn: () => listGitHubIssues(integration!.id, selectedRepo!.owner, selectedRepo!.name, issueState),
    enabled: !!integration && !!selectedRepo && activeTab === "issues",
  });

  const { data: issueDetail, isLoading: issueDetailLoading } = useQuery({
    queryKey: ["github-issue-detail", integration?.id, selectedRepo, selectedIssue],
    queryFn: () => getGitHubIssue(integration!.id, selectedRepo!.owner, selectedRepo!.name, selectedIssue!),
    enabled: !!integration && !!selectedRepo && selectedIssue !== null,
  });

  // ── Commits ──
  const { data: commits = [], isLoading: commitsLoading } = useQuery({
    queryKey: ["github-commits", integration?.id, selectedRepo, selectedBranch],
    queryFn: () => listGitHubCommits(integration!.id, selectedRepo!.owner, selectedRepo!.name, selectedBranch),
    enabled: !!integration && !!selectedRepo && activeTab === "commits",
  });

  // ── Analysis ──
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["github-analysis", integration?.id, selectedRepo],
    queryFn: () => analyzeGitHubRepository(integration!.id, selectedRepo!.owner, selectedRepo!.name),
    enabled: !!integration && !!selectedRepo && activeTab === "analysis",
  });

  // ── Import / Sync Mutations ──
  const importMutation = useMutation({
    mutationFn: ({ owner, name }: { owner: string; name: string }) =>
      importGitHubRepository(integration!.id, owner, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["repositories"] }),
  });

  const syncMutation = useMutation({
    mutationFn: ({ owner, name }: { owner: string; name: string }) =>
      syncGitHubRepository(integration!.id, owner, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["repositories"] }),
  });

  const selectRepo = (owner: string, name: string) => {
    setSelectedRepo({ owner, name });
    setSelectedBranch("main");
    setSelectedPR(null);
    setSelectedIssue(null);
  };

  const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // ── Not connected state ──
  if (integrationsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!integration) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
            GitHub Integration
          </h1>
          <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
              <Github size={40} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </div>
            <h2 className={`mb-2 text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Connect your GitHub account
            </h2>
            <p className={`mb-8 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Browse repositories, view pull requests, issues, commits, and analyze your GitHub projects directly from this dashboard.
            </p>
            <button
              type="button"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#24292f] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#32383f] disabled:opacity-50"
            >
              {connectMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Github size={16} />
              )}
              {connectMutation.isPending ? "Connecting..." : "Connect with GitHub"}
            </button>
            {connectMutation.isError && (
              <p className="mt-4 text-sm text-red-500">
                {(connectMutation.error as Error)?.message || "Failed. Sign in with GitHub first."}
              </p>
            )}
            <p className={`mt-4 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Requires you to have signed in with GitHub OAuth. Or{" "}
              <a href="/profile" className="text-[var(--accent)] hover:underline">add a PAT manually</a>.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
              GitHub Integration
            </h1>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {selectedRepo
                ? `${selectedRepo.owner}/${selectedRepo.name}`
                : "Browse and manage your GitHub repositories"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-600"
            }`}>
              <CheckCircle size={12} />
              Connected
            </div>
            <button
              type="button"
              onClick={() => disconnectMutation.mutate(integration.id)}
              disabled={disconnectMutation.isPending}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-red-400" : "border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500"
              }`}
            >
              {disconnectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />}
              Disconnect
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex flex-wrap gap-1 overflow-hidden rounded-xl border p-1 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedPR(null); setSelectedIssue(null); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "repos" && (
            <ReposTab
              key="repos"
              repos={filteredRepos}
              isLoading={reposLoading}
              search={repoSearch}
              onSearch={setRepoSearch}
              onSelect={selectRepo}
              selectedRepo={selectedRepo}
              onImport={(owner, name) => importMutation.mutate({ owner, name })}
              onSync={(owner, name) => syncMutation.mutate({ owner, name })}
              importPending={importMutation.isPending}
              syncPending={syncMutation.isPending}
              isDark={isDark}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "pulls" && selectedRepo && (
            <PullsTab
              key="pulls"
              prs={pullRequests}
              isLoading={prsLoading}
              state={prState}
              onStateChange={setPrState}
              onSelect={setSelectedPR}
              selectedPR={selectedPR}
              detail={prDetail}
              detailLoading={prDetailLoading}
              onBack={() => setSelectedPR(null)}
              isDark={isDark}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "issues" && selectedRepo && (
            <IssuesTab
              key="issues"
              issues={issues}
              isLoading={issuesLoading}
              state={issueState}
              onStateChange={setIssueState}
              onSelect={setSelectedIssue}
              selectedIssue={selectedIssue}
              detail={issueDetail}
              detailLoading={issueDetailLoading}
              onBack={() => setSelectedIssue(null)}
              isDark={isDark}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "commits" && selectedRepo && (
            <CommitsTab
              key="commits"
              commits={commits}
              isLoading={commitsLoading}
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              isDark={isDark}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "analysis" && selectedRepo && (
            <AnalysisTab
              key="analysis"
              analysis={analysis}
              isLoading={analysisLoading}
              isDark={isDark}
              timeAgo={timeAgo}
            />
          )}

          {activeTab !== "repos" && !selectedRepo && (
            <EmptyRepoState key="no-repo" isDark={isDark} />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// ═══════════════════════════════════════════════════════════
// Repos Tab
// ═══════════════════════════════════════════════════════════
function ReposTab({
  repos, isLoading, search, onSearch, onSelect, selectedRepo,
  onImport, onSync, importPending, syncPending, isDark, timeAgo,
}: {
  repos: GitHubRepoListItem[];
  isLoading: boolean;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (owner: string, name: string) => void;
  selectedRepo: { owner: string; name: string } | null;
  onImport: (owner: string, name: string) => void;
  onSync: (owner: string, name: string) => void;
  importPending: boolean;
  syncPending: boolean;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
}) {
  const queryClient = useQueryClient();
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
                    ? isDark ? "border-[var(--accent)]/30 bg-[var(--accent)]/5" : "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                    : isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(repo.owner, repo.name)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                    <Github size={18} className={isDark ? "text-slate-400" : "text-slate-500"} />
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
                      <RefreshCw size={10} className={syncPending ? "animate-spin" : ""} />
                      Sync
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onImport(repo.owner, repo.name)}
                      disabled={importPending}
                      className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <Download size={10} />
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

// ═══════════════════════════════════════════════════════════
// Pull Requests Tab
// ═══════════════════════════════════════════════════════════
function PullsTab({
  prs, isLoading, state, onStateChange, onSelect, selectedPR,
  detail, detailLoading, onBack, isDark, timeAgo,
}: {
  prs: GitHubPullRequest[];
  isLoading: boolean;
  state: "open" | "closed" | "all";
  onStateChange: (s: "open" | "closed" | "all") => void;
  onSelect: (n: number) => void;
  selectedPR: number | null;
  detail: GitHubPullRequestDetail | undefined;
  detailLoading: boolean;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
}) {
  if (selectedPR && detail) {
    return <PRDetail detail={detail} loading={detailLoading} onBack={onBack} isDark={isDark} timeAgo={timeAgo} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex flex-wrap gap-2">
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
        <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {prs.length} pull request{prs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />)}
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
                  <span className={`flex items-center gap-1 text-emerald-500`}>+{pr.additions}</span>
                  <span className={`flex items-center gap-1 text-red-500`}>-{pr.deletions}</span>
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

function PRDetail({ detail, loading, onBack, isDark, timeAgo }: {
  detail: GitHubPullRequestDetail; loading: boolean; onBack: () => void; isDark: boolean; timeAgo: (d: string | Date) => string;
}) {
  if (loading) return <div className={`h-32 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;

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
          <a href={detail.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <ExternalLink size={12} /> View on GitHub
          </a>
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

      {/* Files */}
      {detail.files.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Changed Files ({detail.files.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {detail.files.map((f) => (
              <div key={f.filename} className={`flex items-center justify-between border-b px-5 py-2.5 text-xs last:border-b-0 ${isDark ? "border-white/5" : "border-slate-50"}`}>
                <span className={`font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{f.filename}</span>
                <div className="flex items-center gap-3 shrink-0">
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

      {/* Reviews */}
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

// ═══════════════════════════════════════════════════════════
// Issues Tab
// ═══════════════════════════════════════════════════════════
function IssuesTab({
  issues, isLoading, state, onStateChange, onSelect, selectedIssue,
  detail, detailLoading, onBack, isDark, timeAgo,
}: {
  issues: GitHubIssue[];
  isLoading: boolean;
  state: "open" | "closed" | "all";
  onStateChange: (s: "open" | "closed" | "all") => void;
  onSelect: (n: number) => void;
  selectedIssue: number | null;
  detail: GitHubIssueDetail | undefined;
  detailLoading: boolean;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
}) {
  if (selectedIssue && detail) {
    return <IssueDetail detail={detail} loading={detailLoading} onBack={onBack} isDark={isDark} timeAgo={timeAgo} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex flex-wrap gap-2">
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
        <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {issues.length} issue{issues.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />)}
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
                    <span key={label} className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                      {label}
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

function IssueDetail({ detail, loading, onBack, isDark, timeAgo }: {
  detail: GitHubIssueDetail; loading: boolean; onBack: () => void; isDark: boolean; timeAgo: (d: string | Date) => string;
}) {
  if (loading) return <div className={`h-32 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;

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
              <span key={label} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {label}
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

      {/* Comments */}
      {detail.commentsList.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Comments ({detail.commentsList.length})</h3>
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

// ═══════════════════════════════════════════════════════════
// Commits Tab
// ═══════════════════════════════════════════════════════════
function CommitsTab({
  commits, isLoading, branches, selectedBranch, onBranchChange, isDark, timeAgo,
}: {
  commits: GitHubCommit[];
  isLoading: boolean;
  branches: GitHubBranch[];
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
}) {
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
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`h-14 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />)}
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

// ═══════════════════════════════════════════════════════════
// Analysis Tab
// ═══════════════════════════════════════════════════════════
function AnalysisTab({ analysis, isLoading, isDark, timeAgo }: {
  analysis: GitHubRepositoryAnalysis | undefined;
  isLoading: boolean;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
}) {
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
      {/* Repo Info */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <stat.icon size={16} className={stat.color} />
            <p className={`mt-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent PRs */}
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

      {/* Recent Issues */}
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

// ═══════════════════════════════════════════════════════════
// Empty State (no repo selected)
// ═══════════════════════════════════════════════════════════
function EmptyRepoState({ isDark }: { isDark: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className={`rounded-xl border p-12 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <FolderGit2 size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
        <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Select a repository first
        </h3>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Go to the Repositories tab and click on a repository to view its pull requests, issues, commits, and analysis.
        </p>
      </div>
    </motion.div>
  );
}
