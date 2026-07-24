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
  description?: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  language?: string | null;
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
  files: GitHubPRFile[];
  reviews: GitHubPRReview[];
}

export interface GitHubPRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubPRReview {
  user: string;
  state: string;
  body: string | null;
  submittedAt: string | null;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: string;
  author: string;
  labels: string[];
  assignees: string[];
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
  author: string;
  body: string;
  createdAt: string;
  updatedAt: string;
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
  };
  summary: {
    openPRs: number;
    openIssues: number;
    contributors: number;
    topLanguages: string[];
  };
  recentPRs: Array<{
    number: number;
    title: string;
    author: string;
    url: string;
  }>;
  recentIssues: Array<{
    number: number;
    title: string;
    author: string;
    labels: string[];
    url: string;
  }>;
}
