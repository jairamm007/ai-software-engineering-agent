import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
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

export const connectGitHub = async (
  token: string,
  githubUrl?: string
): Promise<{ integration: GitHubIntegration; githubUser: unknown }> => {
  const response = await api.post<
    ApiResponse<{ integration: GitHubIntegration; githubUser: unknown }>
  >("/github-integrations/connect", { token, githubUrl });
  return response.data.data;
};

export const autoConnectGitHub = async (): Promise<{
  integration: GitHubIntegration;
  method: "oauth";
}> => {
  const response = await api.post<
    ApiResponse<{ integration: GitHubIntegration; method: "oauth" }>
  >("/github-integrations/auto-connect");
  return response.data.data;
};

export const disconnectGitHub = async (
  integrationId: string
): Promise<void> => {
  await api.delete(`/github-integrations/${integrationId}`);
};

export const getIntegrations = async (): Promise<GitHubIntegration[]> => {
  const response = await api.get<ApiResponse<GitHubIntegration[]>>(
    "/github-integrations"
  );
  return response.data.data;
};

export const getIntegration = async (
  integrationId: string
): Promise<GitHubIntegration> => {
  const response = await api.get<ApiResponse<GitHubIntegration>>(
    `/github-integrations/${integrationId}`
  );
  return response.data.data;
};

export const listGitHubRepositories = async (
  integrationId: string
): Promise<GitHubRepoListItem[]> => {
  const response = await api.get<ApiResponse<GitHubRepoListItem[]>>(
    `/github-integrations/${integrationId}/repos`
  );
  return response.data.data;
};

export const importGitHubRepository = async (
  integrationId: string,
  owner: string,
  name: string
): Promise<unknown> => {
  const response = await api.post<ApiResponse<unknown>>(
    `/github-integrations/${integrationId}/repos/import`,
    { owner, name }
  );
  return response.data.data;
};

export const syncGitHubRepository = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<unknown> => {
  const response = await api.post<ApiResponse<unknown>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/sync`
  );
  return response.data.data;
};

export const analyzeGitHubRepository = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubRepositoryAnalysis> => {
  const response = await api.get<ApiResponse<GitHubRepositoryAnalysis>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/analyze`
  );
  return response.data.data;
};

export const listGitHubBranches = async (
  integrationId: string,
  owner: string,
  repo: string
): Promise<GitHubBranch[]> => {
  const response = await api.get<ApiResponse<GitHubBranch[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/branches`
  );
  return response.data.data;
};

export const listGitHubCommits = async (
  integrationId: string,
  owner: string,
  repo: string,
  branch?: string,
  page?: number,
  perPage?: number
): Promise<GitHubCommit[]> => {
  const params = new URLSearchParams();
  if (branch) params.set("branch", branch);
  if (page) params.set("page", String(page));
  if (perPage) params.set("perPage", String(perPage));
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get<ApiResponse<GitHubCommit[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/commits${query}`
  );
  return response.data.data;
};

export const listGitHubPullRequests = async (
  integrationId: string,
  owner: string,
  repo: string,
  state?: "open" | "closed" | "all",
  page?: number,
  perPage?: number
): Promise<GitHubPullRequest[]> => {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  if (page) params.set("page", String(page));
  if (perPage) params.set("perPage", String(perPage));
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get<ApiResponse<GitHubPullRequest[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls${query}`
  );
  return response.data.data;
};

export const getGitHubPullRequest = async (
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubPullRequestDetail> => {
  const response = await api.get<ApiResponse<GitHubPullRequestDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/pulls/${pullNumber}`
  );
  return response.data.data;
};

export const listGitHubIssues = async (
  integrationId: string,
  owner: string,
  repo: string,
  state?: "open" | "closed" | "all",
  page?: number,
  perPage?: number
): Promise<GitHubIssue[]> => {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  if (page) params.set("page", String(page));
  if (perPage) params.set("perPage", String(perPage));
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get<ApiResponse<GitHubIssue[]>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues${query}`
  );
  return response.data.data;
};

export const getGitHubIssue = async (
  integrationId: string,
  owner: string,
  repo: string,
  issueNumber: number
): Promise<GitHubIssueDetail> => {
  const response = await api.get<ApiResponse<GitHubIssueDetail>>(
    `/github-integrations/${integrationId}/repos/${owner}/${repo}/issues/${issueNumber}`
  );
  return response.data.data;
};
