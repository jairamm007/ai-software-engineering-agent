import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { GitBranch, Unlink, GitPullRequest, GitCommit, AlertCircle, Code2, FolderGit2, CheckCircle, RotateCw, Webhook, Sparkles, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";
import {
  getIntegrations,
  autoConnectGitHub,
  connectGitHub,
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
  listGitHubLabels,
} from "@/services/github-integration";
import type {
  GitHubIntegration,
} from "@/types/github-integration";
import GitHubConnectCard from "@/components/github/GitHubConnectCard";
import GitHubRepoList from "@/components/github/GitHubRepoList";
import GitHubPullRequestList from "@/components/github/GitHubPullRequestList";
import GitHubIssueList from "@/components/github/GitHubIssueList";
import GitHubCommitList from "@/components/github/GitHubCommitList";
import GitHubAnalysis from "@/components/github/GitHubAnalysis";
import GitHubCreateIssueDialog from "@/components/github/GitHubCreateIssueDialog";
import GitHubCreatePRDialog from "@/components/github/GitHubCreatePRDialog";
import GitHubCommentForm from "@/components/github/GitHubCommentForm";
import GitHubReviewForm from "@/components/github/GitHubReviewForm";
import GitHubMergePRDialog from "@/components/github/GitHubMergePRDialog";
import GitHubCICDTab from "@/components/github/GitHubCICDTab";
import GitHubWebhooksTab from "@/components/github/GitHubWebhooksTab";
import GitHubAIPRAssistantTab from "@/components/github/GitHubAIPRAssistantTab";
import GitHubBranchProtectionTab from "@/components/github/GitHubBranchProtectionTab";
import { motion } from "framer-motion";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type Tab = "repos" | "pulls" | "issues" | "commits" | "cicd" | "webhooks" | "ai-pr" | "protection" | "analysis";

const TABS: { key: Tab; label: string; icon: typeof GitBranch }[] = [
  { key: "repos", label: "Repositories", icon: FolderGit2 },
  { key: "pulls", label: "Pull Requests", icon: GitPullRequest },
  { key: "issues", label: "Issues", icon: AlertCircle },
  { key: "commits", label: "Commits", icon: GitCommit },
  { key: "cicd", label: "CI/CD", icon: RotateCw },
  { key: "webhooks", label: "Webhooks", icon: Webhook },
  { key: "ai-pr", label: "AI PR", icon: Sparkles },
  { key: "protection", label: "Protection", icon: ShieldCheck },
  { key: "analysis", label: "Analysis", icon: Code2 },
];

export default function GitHubIntegrationPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("repos");
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; name: string } | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [prState, setPrState] = useState<"open" | "closed" | "all">("open");
  const [issueState, setIssueState] = useState<"open" | "closed" | "all">("open");
  const [selectedPR, setSelectedPR] = useState<number | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const REFRESH_INTERVAL = 15000;

  // ── Dialog State ──
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showCreatePR, setShowCreatePR] = useState(false);
  const [commentTarget, setCommentTarget] = useState<{ type: "issue" | "pr"; number: number } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<number | null>(null);
  const [mergeTarget, setMergeTarget] = useState<number | null>(null);

  // ── Integration Status ──
  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ["github-integrations"],
    queryFn: getIntegrations,
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
  });

  const integration = integrations?.find((i: GitHubIntegration) => i.isActive);

  const connectMutation = useMutation({
    mutationFn: autoConnectGitHub,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["github-integrations"] }),
  });

  const connectPATMutation = useMutation({
    mutationFn: (token: string) => connectGitHub(token),
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
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
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
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
  });

  // ── Pull Requests ──
  const { data: pullRequests = [], isLoading: prsLoading } = useQuery({
    queryKey: ["github-prs", integration?.id, selectedRepo, prState],
    queryFn: () => listGitHubPullRequests(integration!.id, selectedRepo!.owner, selectedRepo!.name, prState),
    enabled: !!integration && !!selectedRepo && activeTab === "pulls",
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
  });

  const { data: prDetail, isLoading: prDetailLoading } = useQuery({
    queryKey: ["github-pr-detail", integration?.id, selectedRepo, selectedPR],
    queryFn: () => getGitHubPullRequest(integration!.id, selectedRepo!.owner, selectedRepo!.name, selectedPR!),
    enabled: !!integration && !!selectedRepo && selectedPR !== null,
  });

  // ── Issues ──
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["github-issues", integration?.id, selectedRepo, issueState],
    queryFn: () => listGitHubIssues(integration!.id, selectedRepo!.owner, selectedRepo!.name, { state: issueState }),
    enabled: !!integration && !!selectedRepo && activeTab === "issues",
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
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
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
  });

  // ── Analysis ──
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["github-analysis", integration?.id, selectedRepo],
    queryFn: () => analyzeGitHubRepository(integration!.id, selectedRepo!.owner, selectedRepo!.name),
    enabled: !!integration && !!selectedRepo && activeTab === "analysis",
  });

  // ── Labels (for create issue dialog) ──
  const { data: labels = [] } = useQuery({
    queryKey: ["github-labels", integration?.id, selectedRepo],
    queryFn: () => listGitHubLabels(integration!.id, selectedRepo!.owner, selectedRepo!.name),
    enabled: !!integration && !!selectedRepo && showCreateIssue,
  });

  // ── Import / Sync Mutations ──
  const [importingRepo, setImportingRepo] = useState<{ owner: string; name: string } | null>(null);
  const importMutation = useMutation({
    mutationFn: ({ owner, name }: { owner: string; name: string }) =>
      importGitHubRepository(integration!.id, owner, name),
    onSuccess: () => {
      setImportingRepo(null);
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
      navigate("/repositories");
    },
    onError: () => setImportingRepo(null),
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

  // ── Loading state ──
  if (integrationsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <LoadingIndicator size="md" />
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Not connected state ──
  if (!integration) {
    return (
      <DashboardLayout>
        <GitHubConnectCard
          isConnecting={connectMutation.isPending}
          onConnect={() => connectMutation.mutate()}
          onConnectWithPAT={(token) => connectPATMutation.mutate(token)}
          isConnectingPAT={connectPATMutation.isPending}
          error={
            connectMutation.isError
              ? ((connectMutation.error as Error)?.message || "Failed. Sign in with GitHub first.")
              : connectPATMutation.isError
                ? ((connectPATMutation.error as Error)?.message || "Failed to connect with token.")
                : null
          }
        />
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
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                autoRefresh
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : isDark
                    ? "border-white/10 text-slate-500 hover:bg-white/5"
                    : "border-slate-200 text-slate-400 hover:bg-slate-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
              LIVE
            </button>
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
              {disconnectMutation.isPending ? <LoadingIndicator size="sm" /> : <Unlink size={12} />}
              Disconnect
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex flex-wrap gap-1 overflow-hidden rounded-xl border p-1 ${isDark ? "border-white/10 bg-[var(--bg-secondary)]" : "border-slate-200 bg-slate-50"}`}>
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
            <GitHubRepoList
              key="repos"
              repos={filteredRepos}
              isLoading={reposLoading}
              search={repoSearch}
              onSearch={setRepoSearch}
              onSelect={selectRepo}
              selectedRepo={selectedRepo}
              onImport={(owner, name) => {
                setImportingRepo({ owner, name });
                importMutation.mutate({ owner, name });
              }}
              onSync={(owner, name) => syncMutation.mutate({ owner, name })}
              importingRepo={importingRepo}
              syncPending={syncMutation.isPending}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "pulls" && selectedRepo && (
            <GitHubPullRequestList
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
              timeAgo={timeAgo}
              onCreatePR={() => setShowCreatePR(true)}
              onReview={(num) => setReviewTarget(num)}
              onMerge={(num) => setMergeTarget(num)}
            />
          )}

          {activeTab === "issues" && selectedRepo && (
            <GitHubIssueList
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
              timeAgo={timeAgo}
              onCreateIssue={() => setShowCreateIssue(true)}
              onAddComment={(num) => setCommentTarget({ type: "issue", number: num })}
            />
          )}

          {activeTab === "commits" && selectedRepo && (
            <GitHubCommitList
              key="commits"
              commits={commits}
              isLoading={commitsLoading}
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "analysis" && selectedRepo && (
            <GitHubAnalysis
              key="analysis"
              analysis={analysis}
              isLoading={analysisLoading}
              timeAgo={timeAgo}
            />
          )}

          {activeTab === "cicd" && selectedRepo && (
            <GitHubCICDTab
              key="cicd"
              integrationId={integration!.id}
              owner={selectedRepo.owner}
              repo={selectedRepo.name}
              timeAgo={timeAgo}
              autoRefresh={autoRefresh}
              refreshInterval={REFRESH_INTERVAL}
            />
          )}

          {activeTab === "webhooks" && (
            <GitHubWebhooksTab
              key="webhooks"
              integrationId={integration!.id}
              timeAgo={timeAgo}
              autoRefresh={autoRefresh}
              refreshInterval={REFRESH_INTERVAL}
            />
          )}

          {activeTab === "ai-pr" && (
            <GitHubAIPRAssistantTab />
          )}

          {activeTab === "protection" && selectedRepo && (
            <GitHubBranchProtectionTab
              key="protection"
              integrationId={integration!.id}
              owner={selectedRepo.owner}
              repo={selectedRepo.name}
              timeAgo={timeAgo}
            />
          )}

          {activeTab !== "repos" && activeTab !== "webhooks" && activeTab !== "ai-pr" && activeTab !== "protection" && !selectedRepo && (
            <motion.div key="no-repo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className={`rounded-xl border p-12 text-center ${isDark ? "border-white/10 bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
                <FolderGit2 size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
                <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Select a repository first
                </h3>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Go to the Repositories tab and click on a repository to view its pull requests, issues, commits, and analysis.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Write-back Dialogs */}
      {integration && selectedRepo && (
        <>
          <GitHubCreateIssueDialog
            isOpen={showCreateIssue}
            onClose={() => setShowCreateIssue(false)}
            integrationId={integration.id}
            owner={selectedRepo.owner}
            repo={selectedRepo.name}
            labels={labels.map((l) => l.name)}
          />

          <GitHubCreatePRDialog
            isOpen={showCreatePR}
            onClose={() => setShowCreatePR(false)}
            integrationId={integration.id}
            owner={selectedRepo.owner}
            repo={selectedRepo.name}
          />

          {commentTarget && (
            <GitHubCommentForm
              isOpen={true}
              onClose={() => setCommentTarget(null)}
              integrationId={integration.id}
              owner={selectedRepo.owner}
              repo={selectedRepo.name}
              type={commentTarget.type}
              number={commentTarget.number}
            />
          )}

          {reviewTarget !== null && (
            <GitHubReviewForm
              isOpen={true}
              onClose={() => setReviewTarget(null)}
              integrationId={integration.id}
              owner={selectedRepo.owner}
              repo={selectedRepo.name}
              pullNumber={reviewTarget}
            />
          )}

          {mergeTarget !== null && prDetail && (
            <GitHubMergePRDialog
              isOpen={true}
              onClose={() => setMergeTarget(null)}
              integrationId={integration.id}
              owner={selectedRepo.owner}
              repo={selectedRepo.name}
              pullNumber={mergeTarget}
              prTitle={prDetail.title}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
