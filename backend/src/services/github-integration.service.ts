import { Octokit } from "octokit";
import {
  createIntegration,
  getIntegrationById,
  getIntegrationByUserAndUrl,
  getUserIntegrations,
  updateIntegration,
  deleteIntegration,
  createIntegrationRepo,
  getIntegrationRepos,
  getIntegrationRepo,
  deleteIntegrationRepos,
  getGitHubOAuthToken,
} from "../repository/github-integration.repository.js";

function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

export const connectGitHub = async (
  userId: string,
  token: string,
  githubUrl: string = "https://github.com"
) => {
  const octokit = getOctokit(token);
  const { data: user } = await octokit.rest.users.getAuthenticated();

  const existing = await getIntegrationByUserAndUrl(userId, githubUrl);
  if (existing) {
    const updated = await updateIntegration(existing.id, { isActive: true });
    return { integration: updated, githubUser: user };
  }

  const integration = await createIntegration(userId, githubUrl, token);
  return { integration, githubUser: user };
};

export const autoConnectGitHub = async (userId: string) => {
  const oauthToken = await getGitHubOAuthToken(userId);
  if (!oauthToken) {
    throw new Error("GitHub account not linked. Please login with GitHub or provide a Personal Access Token.");
  }

  const githubUrl = "https://github.com";
  const existing = await getIntegrationByUserAndUrl(userId, githubUrl);
  if (existing) {
    const updated = await updateIntegration(existing.id, { isActive: true, token: oauthToken });
    return { integration: updated, method: "oauth" as const };
  }

  const integration = await createIntegration(userId, githubUrl, oauthToken);
  return { integration, method: "oauth" as const };
};

export const disconnectGitHub = async (userId: string, integrationId: string) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  await deleteIntegration(integrationId);
  return true;
};

export const listIntegrations = async (userId: string) => {
  return getUserIntegrations(userId);
};

export const getIntegration = async (userId: string, integrationId: string) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }
  return integration;
};

export const listUserRepositories = async (userId: string, integrationId: string) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });

  return repos.map((repo) => ({
    id: repo.id,
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    defaultBranch: repo.default_branch,
    isPrivate: repo.private,
    language: repo.language,
    starsCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
    url: repo.html_url,
    updatedAt: repo.updated_at,
  }));
};

export const importRepository = async (
  userId: string,
  integrationId: string,
  owner: string,
  name: string
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });

  const saved = await createIntegrationRepo(integrationId, {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? undefined,
    defaultBranch: repo.default_branch,
    isPrivate: repo.private,
    language: repo.language ?? undefined,
    starsCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
  });

  await updateIntegration(integrationId, { lastSyncAt: new Date() });

  return saved;
};

export const listBranches = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const defaultBranch = await getDefaultBranch(integration.token, owner, repo);
  const { data: branches } = await octokit.rest.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  });

  return branches.map((b) => ({
    name: b.name,
    isDefault: b.name === defaultBranch,
    commitSha: b.commit.sha,
    protected: b.protected,
  }));
};

async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string
): Promise<string> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data.default_branch;
}

export const listCommits = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  branch: string = "main",
  page: number = 1,
  perPage: number = 20
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    sha: branch,
    page,
    per_page: perPage,
  });

  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author?.name ?? "Unknown",
    authorEmail: c.commit.author?.email,
    date: c.commit.author?.date,
    url: c.html_url,
  }));
};

export const listPullRequests = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  page: number = 1,
  perPage: number = 20
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state,
    sort: "updated",
    direction: "desc",
    page,
    per_page: perPage,
  });

  return prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    author: pr.user?.login ?? "Unknown",
    headBranch: pr.head.ref,
    baseBranch: pr.base.ref,
    merged: pr.merged,
    mergeable: pr.mergeable,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    url: pr.html_url,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at,
  }));
};

export const getPullRequest = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  const { data: reviews } = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    author: pr.user?.login ?? "Unknown",
    headBranch: pr.head.ref,
    baseBranch: pr.base.ref,
    merged: pr.merged,
    mergeable: pr.mergeable,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    url: pr.html_url,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at,
    files: files.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch,
    })),
    reviews: reviews.map((r) => ({
      user: r.user?.login ?? "Unknown",
      state: r.state,
      body: r.body,
      submittedAt: r.submitted_at,
    })),
  };
};

export const listIssues = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  page: number = 1,
  perPage: number = 20
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state,
    sort: "updated",
    direction: "desc",
    page,
    per_page: perPage,
  });

  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      author: issue.user?.login ?? "Unknown",
      labels: issue.labels.map((l) =>
        typeof l === "string" ? l : l.name ?? ""
      ),
      assignees: issue.assignees?.map((a) => a.login) ?? [],
      comments: issue.comments,
      url: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
    }));
};

export const getIssue = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  issueNumber: number
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);
  const { data: issue } = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });

  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    author: issue.user?.login ?? "Unknown",
    labels: issue.labels.map((l) =>
      typeof l === "string" ? l : l.name ?? ""
    ),
    assignees: issue.assignees?.map((a) => a.login) ?? [],
    comments: issue.comments,
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    commentsList: comments.map((c) => ({
      author: c.user?.login ?? "Unknown",
      body: c.body,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  };
};

export const syncRepository = async (
  userId: string,
  integrationId: string,
  owner: string,
  name: string
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const existing = await getIntegrationRepo(integrationId, owner, name);
  if (!existing) {
    throw new Error("Repository not imported. Import it first.");
  }

  const octokit = getOctokit(integration.token);
  const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });

  const updated = await createIntegrationRepo(integrationId, {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? undefined,
    defaultBranch: repo.default_branch,
    isPrivate: repo.private,
    language: repo.language ?? undefined,
    starsCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
  });

  await updateIntegration(integrationId, { lastSyncAt: new Date() });

  return updated;
};

export const analyzeRepository = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }

  const octokit = getOctokit(integration.token);

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 100,
  });

  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open",
    per_page: 100,
  });

  const { data: contributors } = await octokit.rest.repos.listContributors({
    owner,
    repo,
    per_page: 10,
  });

  return {
    repository: {
      name: repoData.full_name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      defaultBranch: repoData.default_branch,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
    },
    summary: {
      openPRs: prs.length,
      openIssues: issues.filter((i) => !i.pull_request).length,
      contributors: contributors.length,
      topLanguages: getTopLanguages(repoData),
    },
    recentPRs: prs.slice(0, 5).map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "Unknown",
      url: pr.html_url,
    })),
    recentIssues: issues
      .filter((i) => !i.pull_request)
      .slice(0, 5)
      .map((i) => ({
        number: i.number,
        title: i.title,
        author: i.user?.login ?? "Unknown",
        labels: i.labels.map((l) => (typeof l === "string" ? l : l.name ?? "")),
        url: i.html_url,
      })),
  };
};

function getTopLanguages(repo: Record<string, unknown>): string[] {
  const languages = repo.language as string | null;
  if (!languages) return [];
  return [languages];
}
