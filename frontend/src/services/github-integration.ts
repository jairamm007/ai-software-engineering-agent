import api from "@/lib/axios";
import type {
  GitHubIntegration,
  GitHubProfile,
  GitHubRepoListItem,
  GitHubOrganization,
  GitHubBranch,
  GitHubCommit,
  GitHubCommitDetail,
  GitHubTag,
  GitHubRelease,
  GitHubContributor,
  GitHubReadme,
  GitHubLicense,
  GitHubPullRequest,
  GitHubPullRequestDetail,
  GitHubMergeStatus,
  GitHubIssue,
  GitHubIssueDetail,
  GitHubLabel,
  GitHubMilestone,
  GitHubRepositoryAnalysis,
  GitHubCreateIssueParams,
  GitHubCreatedIssue,
  GitHubCreatePRParams,
  GitHubCreatedPR,
  GitHubCreatedComment,
  GitHubCreatedReview,
  GitHubMergeResult,
  GitHubCreateReviewParams,
  GitHubWorkflow,
  GitHubWorkflowRun,
  GitHubWorkflowRunDetail,
  GitHubCheckRun,
  GitHubDeployment,
  GitHubWebhookEvent,
  AIPRAssistGenerateDescriptionParams,
  AIPRAssistGeneratedDescription,
  AIPRAssistReviewParams,
  AIPRAssistReviewResult,
  AIPRAssistSuggestTitleParams,
  AIPRAssistTitleSuggestion,
  GitHubBranchProtection,
  GitHubBranchProtectionUpdate,
} from "@/types/github-integration";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Integration Management ──

export const connectGitHub = async (token: string, githubUrl?: string) => {
  const { data } = await api.post<ApiResponse<{ integration: GitHubIntegration; githubUser: unknown; scopes: string[] }>>(
    "/github-integrations/connect",
    { token, githubUrl }
  );
  return data.data;
};

export const autoConnectGitHub = async () => {
  const { data } = await api.post<ApiResponse<{ integration: GitHubIntegration; method: string }>>(
    "/github-integrations/auto-connect"
  );
  return data.data;
};

export const disconnectGitHub = async (integrationId: string) => {
  await api.delete(`/github-integrations/${integrationId}`);
};

export const getIntegrations = async (): Promise<GitHubIntegration[]> => {
  const { data } = await api.get<ApiResponse<GitHubIntegration[]>>("/github-integrations");
  return data.data;
};

export const getIntegration = async (integrationId: string): Promise<GitHubIntegration> => {
  const { data } = await api.get<ApiResponse<GitHubIntegration>>(`/github-integrations/${integrationId}`);
  return data.data;
};

export const getGitHubProfile = async (integrationId: string): Promise<GitHubProfile> => {
  const { data } = await api.get<ApiResponse<GitHubProfile>>(`/github-integrations/${integrationId}/profile`);
  return data.data;
};

// ── Repository Management ──

export const listGitHubRepositories = async (
  integrationId: string,
  params?: {
    search?: string;
    language?: string;
    owner?: string;
    sort?: string;
    type?: string;
    page?: number;
    perPage?: number;
  }
): Promise<GitHubRepoListItem[]> => {
  const { data } = await api.get<ApiResponse<GitHubRepoListItem[]>>(
    `/github-integrations/${integrationId}/repos`,
    { params }
  );
  return data.data;
};

export const importGitHubRepository = async (
  integrationId: string,
  owner: string,
  name: string
): Promise<{
  integrationRepo: unknown;
  repository: { id: string; name: string; githubUrl: string } | null;
  indexResult: unknown;
  fileTree: unknown;
}> => {
  const { data } = await api.post<
    ApiResponse<{
      integrationRepo: unknown;
      repository: { id: string; name: string; githubUrl: string } | null;
      indexResult: unknown;
      fileTree: unknown;
    }>
  >(`/github-integrations/${integrationId}/repos/import`, { owner, name });
  return data.data;
};

export const bulkImportGitHubRepositories = async (
  integrationId: string,
  repos: { owner: string; name: string }[]
) => {
  const { data } = await api.post<ApiResponse<{ imported: number; failed: number; results: unknown[] }>>(
    `/github-integrations/${integrationId}/repos/bulk-import`,
    { repos }
  );
  return data.data;
};

export const importGitHubRepositoryFromUrl = async (
  integrationId: string,
  url: string
) => {
  const { data } = await api.post<ApiResponse<unknown>>(
    `/github-integrations/${integrationId}/repos/import-url`,
    { url }
  );
  return data.data;
};

export const syncGitHubRepository = async (
  integrationId: string,
  owner: string,
  repo: string
) => {
  const { data } = await api.post<ApiResponse<{
    repository: unknown;
    recentCommits: unknown[];
    syncedAt: string;
  }>>(`/github-integrations/${integrationId}/repos/${owner}/${repo}/sync`);
  return data.data;
};

export const analyzeGitHubRepository = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubRepositoryAnalysis> => {
  const { data } = await api.get<ApiResponse<GitHubRepositoryAnalysis>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/analyze`
  );
  return data.data;
};

// ── Organizations ──

export const listGitHubOrganizations = async (
  integrationId: string
): Promise<GitHubOrganization[]> => {
  const { data } = await api.get<ApiResponse<GitHubOrganization[]>>(
    `/github-integrations/${integrationId}/orgs`
  );
  return data.data;
};

export const listGitHubOrgRepositories = async (
  integrationId: string,
  org: string
): Promise<GitHubRepoListItem[]> => {
  const { data } = await api.get<ApiResponse<GitHubRepoListItem[]>>(
    `/github-integrations/${integrationId}/orgs/${org}/repos`
  );
  return data.data;
};

// ── Branches ──

export const listGitHubBranches = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubBranch[]> => {
  const { data } = await api.get<ApiResponse<GitHubBranch[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/branches`
  );
  return data.data;
};

// ── Commits ──

export const listGitHubCommits = async (
  integrationId: string,
  owner: string,
  repo: string,
  branch?: string,
  page?: number,
  perPage?: number
): Promise<GitHubCommit[]> => {
  const { data } = await api.get<ApiResponse<GitHubCommit[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/commits`,
    { params: { branch, page, perPage } }
  );
  return data.data;
};

export const getGitHubCommitDetail = async (
  integrationId: string,
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubCommitDetail> => {
  const { data } = await api.get<ApiResponse<GitHubCommitDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/commits/${sha}`
  );
  return data.data;
};

export const compareGitHubCommits = async (
  integrationId: string,
  owner: string,
  repo: string,
  base: string,
  head: string
) => {
  const { data } = await api.get(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/compare/${base}...${head}`
  );
  return data.data;
};

// ── Tags & Releases ──

export const listGitHubTags = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubTag[]> => {
  const { data } = await api.get<ApiResponse<GitHubTag[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/tags`
  );
  return data.data;
};

export const listGitHubReleases = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubRelease[]> => {
  const { data } = await api.get<ApiResponse<GitHubRelease[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/releases`
  );
  return data.data;
};

// ── Contributors ──

export const listGitHubContributors = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubContributor[]> => {
  const { data } = await api.get<ApiResponse<GitHubContributor[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/contributors`
  );
  return data.data;
};

// ── Repository Info ──

export const getGitHubReadme = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubReadme> => {
  const { data } = await api.get<ApiResponse<GitHubReadme>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/readme`
  );
  return data.data;
};

export const getGitHubLicense = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubLicense> => {
  const { data } = await api.get<ApiResponse<GitHubLicense>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/license`
  );
  return data.data;
};

export const getGitHubLanguages = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> => {
  const { data } = await api.get<ApiResponse<Record<string, number>>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/languages`
  );
  return data.data;
};

// ── Pull Requests ──

export const listGitHubPullRequests = async (
  integrationId: string,
  owner: string,
  repo: string,
  state?: "open" | "closed" | "all",
  page?: number,
  perPage?: number
): Promise<GitHubPullRequest[]> => {
  const { data } = await api.get<ApiResponse<GitHubPullRequest[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls`,
    { params: { state, page, perPage } }
  );
  return data.data;
};

export const getGitHubPullRequest = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubPullRequestDetail> => {
  const { data } = await api.get<ApiResponse<GitHubPullRequestDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}`
  );
  return data.data;
};

export const listGitHubPRCommits = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubCommit[]> => {
  const { data } = await api.get<ApiResponse<GitHubCommit[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}/commits`
  );
  return data.data;
};

export const getGitHubMergeStatus = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubMergeStatus> => {
  const { data } = await api.get<ApiResponse<GitHubMergeStatus>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}/merge-status`
  );
  return data.data;
};

// ── Issues ──

export const listGitHubIssues = async (
  integrationId: string,
  owner: string,
  repo: string,
  params?: {
    state?: "open" | "closed" | "all";
    labels?: string;
    assignee?: string;
    milestone?: string;
    creator?: string;
    page?: number;
    perPage?: number;
  }
): Promise<GitHubIssue[]> => {
  const { data } = await api.get<ApiResponse<GitHubIssue[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues`,
    { params }
  );
  return data.data;
};

export const getGitHubIssue = async (
  integrationId: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssueDetail> => {
  const { data } = await api.get<ApiResponse<GitHubIssueDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues/${issueNumber}`
  );
  return data.data;
};

export const listGitHubLabels = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubLabel[]> => {
  const { data } = await api.get<ApiResponse<GitHubLabel[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/labels`
  );
  return data.data;
};

export const listGitHubMilestones = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubMilestone[]> => {
  const { data } = await api.get<ApiResponse<GitHubMilestone[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/milestones`
  );
  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// CI/CD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const listGitHubWorkflows = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<{ totalCount: number; workflows: GitHubWorkflow[] }> => {
  const { data } = await api.get<ApiResponse<{ totalCount: number; workflows: GitHubWorkflow[] }>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/actions/workflows`
  );
  return data.data;
};

export const listGitHubWorkflowRuns = async (
  integrationId: string,
  owner: string,
  repo: string,
  params?: {
    workflowId?: number;
    branch?: string;
    status?: string;
    page?: number;
    perPage?: number;
  }
): Promise<{ totalCount: number; runs: GitHubWorkflowRun[] }> => {
  const { data } = await api.get<ApiResponse<{ totalCount: number; runs: GitHubWorkflowRun[] }>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/actions/runs`,
    { params }
  );
  return data.data;
};

export const getGitHubWorkflowRunDetail = async (
  integrationId: string,
  owner: string,
  repo: string,
  runId: number
): Promise<GitHubWorkflowRunDetail> => {
  const { data } = await api.get<ApiResponse<GitHubWorkflowRunDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/actions/runs/${runId}`
  );
  return data.data;
};

export const listGitHubCheckRuns = async (
  integrationId: string,
  owner: string,
  repo: string,
  ref: string
): Promise<{ totalCount: number; checkRuns: GitHubCheckRun[] }> => {
  const { data } = await api.get<ApiResponse<{ totalCount: number; checkRuns: GitHubCheckRun[] }>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/check-runs/${ref}`
  );
  return data.data;
};

export const listGitHubDeployments = async (
  integrationId: string,
  owner: string,
  repo: string,
  params?: { environment?: string; sha?: string; page?: number; perPage?: number }
): Promise<GitHubDeployment[]> => {
  const { data } = await api.get<ApiResponse<GitHubDeployment[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/deployments`,
    { params }
  );
  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export const listGitHubWebhookEvents = async (
  integrationId: string,
  params?: { eventType?: string; page?: number; perPage?: number }
): Promise<{ events: GitHubWebhookEvent[]; total: number; page: number; perPage: number }> => {
  const { data } = await api.get<ApiResponse<{ events: GitHubWebhookEvent[]; total: number; page: number; perPage: number }>>(
    "/webhooks/events",
    { params: { integrationId, ...params } }
  );
  return data.data;
};

export const getGitHubWebhookEvent = async (id: string): Promise<GitHubWebhookEvent> => {
  const { data } = await api.get<ApiResponse<GitHubWebhookEvent>>(`/webhooks/events/${id}`);
  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// WRITE-BACK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const createGitHubIssue = async (
  integrationId: string,
  owner: string,
  repo: string,
  params: GitHubCreateIssueParams
): Promise<GitHubCreatedIssue> => {
  const { data } = await api.post<ApiResponse<GitHubCreatedIssue>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues`,
    params
  );
  return data.data;
};

export const createGitHubPullRequest = async (
  integrationId: string,
  owner: string,
  repo: string,
  params: GitHubCreatePRParams
): Promise<GitHubCreatedPR> => {
  const { data } = await api.post<ApiResponse<GitHubCreatedPR>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls`,
    params
  );
  return data.data;
};

export const createGitHubIssueComment = async (
  integrationId: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<GitHubCreatedComment> => {
  const { data } = await api.post<ApiResponse<GitHubCreatedComment>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    { body }
  );
  return data.data;
};

export const createGitHubPRComment = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
): Promise<GitHubCreatedReview> => {
  const { data } = await api.post<ApiResponse<GitHubCreatedReview>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
    { body }
  );
  return data.data;
};

export const createGitHubPRReview = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  params: GitHubCreateReviewParams
): Promise<GitHubCreatedReview> => {
  const { data } = await api.post<ApiResponse<GitHubCreatedReview>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    params
  );
  return data.data;
};

export const mergeGitHubPullRequest = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  params?: {
    mergeMethod?: "merge" | "squash" | "rebase";
    commitTitle?: string;
    commitMessage?: string;
  }
): Promise<GitHubMergeResult> => {
  const { data } = await api.post<ApiResponse<GitHubMergeResult>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}/merge`,
    params ?? {}
  );
  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// AI PR ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════

export const generatePRDescription = async (
  params: AIPRAssistGenerateDescriptionParams
): Promise<AIPRAssistGeneratedDescription> => {
  const { data } = await api.post<ApiResponse<AIPRAssistGeneratedDescription>>(
    "/github/ai-pr/description",
    params
  );
  return data.data;
};

export const reviewPRWithAI = async (
  params: AIPRAssistReviewParams
): Promise<AIPRAssistReviewResult> => {
  const { data } = await api.post<ApiResponse<AIPRAssistReviewResult>>(
    "/github/ai-pr/review",
    params
  );
  return data.data;
};

export const suggestPRTitle = async (
  params: AIPRAssistSuggestTitleParams
): Promise<AIPRAssistTitleSuggestion> => {
  const { data } = await api.post<ApiResponse<AIPRAssistTitleSuggestion>>(
    "/github/ai-pr/suggest-title",
    params
  );
  return data.data;
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANCH PROTECTION
// ═══════════════════════════════════════════════════════════════════════════

export const getGitHubBranchProtection = async (
  integrationId: string,
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubBranchProtection | null> => {
  const { data } = await api.get<ApiResponse<GitHubBranchProtection | null>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/branches/${branch}/protection`
  );
  return data.data;
};

export const updateGitHubBranchProtection = async (
  integrationId: string,
  owner: string,
  repo: string,
  branch: string,
  settings: GitHubBranchProtectionUpdate
): Promise<unknown> => {
  const { data } = await api.put<ApiResponse<unknown>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/branches/${branch}/protection`,
    settings
  );
  return data.data;
};
