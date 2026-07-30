export interface GitHubIntegration {
  id: string;
  userId: string;
  githubUrl: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
  repos?: GitHubIntegrationRepository[];
  _count?: { repos: number };
}

export interface GitHubIntegrationRepository {
  id: string;
  integrationId: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  language: string | null;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
}

export interface GitHubProfile {
  login: string;
  id: number;
  avatarUrl: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface GitHubRepoListItem {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  language: string | null;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  url: string;
  updatedAt: string;
  pushedAt: string;
  createdAt: string;
  topics: string[];
}

export interface GitHubOrganization {
  login: string;
  id: number;
  avatarUrl: string;
  description: string | null;
  reposUrl: string;
  membersUrl: string;
}

export interface GitHubBranch {
  name: string;
  isDefault: boolean;
  commitSha: string;
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorEmail: string | null;
  date: string | null;
  url: string;
  verified: boolean;
}

export interface GitHubCommitDetail {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string | null;
    date: string | null;
    avatarUrl: string | null;
  };
  committer: {
    name: string;
    email: string | null;
    date: string | null;
  };
  url: string;
  verified: boolean;
  parents: { sha: string; url: string }[];
  stats: { additions: number; deletions: number; total: number };
  files: GitHubCommitFile[];
}

export interface GitHubCommitFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
}

export interface GitHubTag {
  name: string;
  commitSha: string;
  url: string;
}

export interface GitHubRelease {
  id: number;
  name: string | null;
  tagName: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  author: string;
  createdAt: string;
  publishedAt: string;
  url: string;
  tarballUrl: string;
  zipballUrl: string;
  assets: {
    name: string;
    size: number;
    downloadCount: number;
    downloadUrl: string;
  }[];
}

export interface GitHubContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  url: string;
}

export interface GitHubReadme {
  name: string;
  path: string;
  content: string;
  sha: string;
  size: number;
  url: string;
}

export interface GitHubLicense {
  name: string;
  spdxId: string | null;
  url: string | null;
  content: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: string;
  author: string;
  headBranch: string;
  baseBranch: string;
  merged: boolean;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
}

export interface GitHubPullRequestDetail extends GitHubPullRequest {
  labels: string[];
  files: GitHubPRFile[];
  reviews: GitHubPRReview[];
  reviewComments: GitHubPRReviewComment[];
}

export interface GitHubPRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
}

export interface GitHubPRReview {
  id: number;
  user: string;
  state: string;
  body: string | null;
  submittedAt: string | null;
}

export interface GitHubPRReviewComment {
  id: number;
  user: string;
  body: string;
  path: string;
  line: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubMergeStatus {
  mergeable: boolean | null;
  mergeableState: string | null;
  merged: boolean;
  mergeCommitSha: string | null;
  rebaseable: boolean | null;
  url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  author: string;
  labels: { name: string; color: string }[];
  assignees: { login: string; avatarUrl: string }[];
  milestone: {
    title: string;
    description: string | null;
    state: string;
  } | null;
  comments: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface GitHubIssueDetail extends GitHubIssue {
  commentsList: GitHubIssueComment[];
}

export interface GitHubIssueComment {
  id: number;
  author: string;
  authorAvatar: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubLabel {
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubMilestone {
  title: string;
  description: string | null;
  state: string;
  openIssues: number;
  closedIssues: number;
  dueOn: string | null;
}

export interface GitHubRepositoryAnalysis {
  repository: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
    size: number;
    topics: string[];
    license: string | null;
    homepage: string | null;
  };
  summary: {
    openPRs: number;
    openIssues: number;
    contributors: number;
    totalCommits: number;
    topLanguages: { name: string; bytes: number }[];
  };
  recentPRs: {
    number: number;
    title: string;
    author: string;
    url: string;
    state: string;
  }[];
  recentIssues: {
    number: number;
    title: string;
    author: string;
    labels: string[];
    url: string;
    state: string;
  }[];
  recentCommits: {
    sha: string;
    message: string;
    author: string;
    date: string | null;
    url: string;
  }[];
  contributors: {
    login: string;
    avatarUrl: string;
    contributions: number;
    url: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE-BACK TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GitHubCreateIssueParams {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

export interface GitHubCreatedIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  url: string;
  labels: string[];
  assignees: string[];
  milestone: string | null;
  createdAt: string;
}

export interface GitHubCreatePRParams {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
}

export interface GitHubCreatedPR {
  number: number;
  title: string;
  body: string | null;
  state: string;
  url: string;
  head: string;
  base: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeableState: string | null;
  createdAt: string;
}

export interface GitHubCreatedComment {
  id: number;
  body: string | null;
  author: string;
  createdAt: string;
  url: string;
}

export interface GitHubCreatedReview {
  id: number;
  body: string | null;
  state: string;
  author: string;
  submittedAt: string | null;
  url: string;
}

export interface GitHubMergeResult {
  merged: boolean;
  message: string;
  sha: string | null;
}

export interface GitHubCreateReviewParams {
  body: string;
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  comments?: { path: string; position: number; body: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CI/CD TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  badgeUrl: string;
  htmlUrl: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  branch: string;
  commitSha: string;
  commitMessage: string | null;
  status: string;
  conclusion: string | null;
  event: string;
  createdAt: string;
  updatedAt: string;
  runStartedAt: string | null;
  htmlUrl: string;
  jobsUrl: string;
  logsUrl: string;
  rerunUrl: string;
  runNumber: number;
}

export interface GitHubWorkflowRunDetail extends GitHubWorkflowRun {
  commitAuthor: string | null;
  jobs: GitHubWorkflowJob[];
}

export interface GitHubWorkflowJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  htmlUrl: string;
  steps: GitHubWorkflowStep[];
}

export interface GitHubWorkflowStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface GitHubCheckRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  htmlUrl: string;
  output: {
    title: string | null;
    summary: string | null;
    annotationsCount: number;
  } | null;
}

export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  statuses: GitHubDeploymentStatus[];
}

export interface GitHubDeploymentStatus {
  state: string;
  description: string | null;
  targetUrl: string | null;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GitHubWebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  action: string | null;
  deliveryId: string | null;
  repositoryOwner: string | null;
  repositoryName: string | null;
  payload: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI PR ASSISTANT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AIPRAssistCommit {
  message: string;
  sha: string;
  author: string;
}

export interface AIPRAssistGenerateDescriptionParams {
  owner: string;
  repo: string;
  commits: AIPRAssistCommit[];
  baseBranch: string;
  headBranch: string;
  title?: string;
}

export interface AIPRAssistGeneratedDescription {
  title: string;
  description: string;
  type: "feat" | "fix" | "refactor" | "docs" | "test" | "chore" | "other";
}

export interface AIPRAssistReviewFile {
  filename: string;
  additions: number;
  deletions: number;
  status: string;
  patch?: string;
}

export interface AIPRAssistReviewParams {
  owner: string;
  repo: string;
  pullNumber: number;
  files: AIPRAssistReviewFile[];
}

export interface AIPRAssistReviewComment {
  path: string;
  line: number;
  body: string;
  severity: "info" | "warning" | "error";
}

export interface AIPRAssistReviewResult {
  summary: string;
  comments: AIPRAssistReviewComment[];
  verdict: "approve" | "changes_requested" | "comment";
}

export interface AIPRAssistSuggestTitleParams {
  commits: Array<{ message: string; sha: string }>;
  headBranch: string;
  baseBranch: string;
}

export interface AIPRAssistTitleSuggestion {
  titles: string[];
  suggestedTitle: string;
  type: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BRANCH PROTECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GitHubBranchProtection {
  url?: string;
  requiredStatusChecks: {
    strict: boolean;
    contexts: string[];
    checks: Array<{ context: string; appId: number | null }>;
  } | null;
  requiredPullRequestReviews: {
    dismissStaleReviews: boolean;
    requireCodeOwnerReviews: boolean;
    requiredApprovingReviewCount: number;
    requireLastPushApproval: boolean;
    dismissalRestrictions: {
      users: string[];
      teams: string[];
    } | null;
  } | null;
  restrictions: {
    users: string[];
    teams: string[];
    apps: string[];
  } | null;
  requiredLinearHistory: boolean;
  allowForcePushes: boolean;
  allowDeletions: boolean;
  requiredConversationResolution: boolean;
  lockBranch: boolean;
  allowForkSyncing: boolean;
}

export interface GitHubBranchProtectionUpdate {
  requiredStatusChecks?: {
    strict: boolean;
    contexts: string[];
  } | null;
  requiredPullRequestReviews?: {
    dismissStaleReviews?: boolean;
    requireCodeOwnerReviews?: boolean;
    requiredApprovingReviewCount?: number;
    requireLastPushApproval?: boolean;
  } | null;
  requiredLinearHistory?: boolean;
  allowForcePushes?: boolean;
  allowDeletions?: boolean;
  requiredConversationResolution?: boolean;
  lockBranch?: boolean;
  restrictions?: {
    users?: string[];
    teams?: string[];
  } | null;
}
