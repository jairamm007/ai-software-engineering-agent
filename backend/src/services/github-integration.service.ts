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

import { indexGitHubRepository } from "./repository-index.service.js";

function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

async function getValidIntegration(userId: string, integrationId: string) {
  const integration = await getIntegrationById(integrationId);
  if (!integration || integration.userId !== userId) {
    throw new Error("Integration not found");
  }
  return integration;
}

export const connectGitHub = async (
  userId: string,
  token: string,
  githubUrl: string = "https://github.com"
) => {
  const octokit = getOctokit(token);

  const { headers, data: user } = await octokit.rest.users.getAuthenticated();
  const scopes = headers["x-oauth-scopes"]?.split(", ") ?? [];

  const existing = await getIntegrationByUserAndUrl(userId, githubUrl);
  if (existing) {
    const updated = await updateIntegration(existing.id, {
      isActive: true,
      token,
    });
    return {
      integration: updated,
      githubUser: user,
      scopes,
    };
  }

  const integration = await createIntegration(userId, githubUrl, token);
  return { integration, githubUser: user, scopes };
};

export const autoConnectGitHub = async (userId: string) => {
  const oauthToken = await getGitHubOAuthToken(userId);
  if (!oauthToken) {
    throw new Error(
      "GitHub account not linked. Please login with GitHub or provide a Personal Access Token."
    );
  }

  const githubUrl = "https://github.com";
  const existing = await getIntegrationByUserAndUrl(userId, githubUrl);
  if (existing) {
    const updated = await updateIntegration(existing.id, {
      isActive: true,
      token: oauthToken,
    });
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
  return getValidIntegration(userId, integrationId);
};

export const getGitHubProfile = async (
  userId: string,
  integrationId: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: user } = await octokit.rest.users.getAuthenticated();

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: 1,
  });

  return {
    login: user.login,
    id: user.id,
    avatarUrl: user.avatar_url,
    name: user.name,
    bio: user.bio,
    company: user.company,
    blog: user.blog,
    location: user.location,
    email: user.email,
    twitterUsername: user.twitter_username,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
  };
};

export const listUserRepositories = async (
  userId: string,
  integrationId: string,
  params?: {
    search?: string;
    language?: string;
    owner?: string;
    sort?: "updated" | "pushed" | "created" | "full_name";
    type?: "all" | "public" | "private" | "owner" | "member";
    page?: number;
    perPage?: number;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: params?.sort ?? "updated",
    type: params?.type ?? "all",
    page: params?.page ?? 1,
    per_page: params?.perPage ?? 100,
  });

  let filtered = repos;

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.full_name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
    );
  }

  if (params?.language) {
    filtered = filtered.filter(
      (r) => r.language?.toLowerCase() === params.language!.toLowerCase()
    );
  }

  if (params?.owner) {
    filtered = filtered.filter(
      (r) => r.owner.login.toLowerCase() === params.owner!.toLowerCase()
    );
  }

  return filtered.map((repo) => ({
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
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    topics: repo.topics ?? [],
  }));
};

export const listOrganizations = async (
  userId: string,
  integrationId: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: orgs } =
    await octokit.rest.orgs.listForAuthenticatedUser();

  return orgs.map((org) => ({
    login: org.login,
    id: org.id,
    avatarUrl: org.avatar_url,
    description: org.description,
    reposUrl: org.repos_url,
    membersUrl: org.members_url,
  }));
};

export const listOrgRepositories = async (
  userId: string,
  integrationId: string,
  org: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: repos } = await octokit.rest.repos.listForOrg({
    org,
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
  const integration = await getValidIntegration(userId, integrationId);
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

  // Trigger full analysis pipeline (clone, index, embeddings)
  const repoUrl = `https://github.com/${owner}/${name}.git`;
  let analyzed;
  try {
    analyzed = await indexGitHubRepository(repoUrl, name, userId);
  } catch (err) {
    console.error("Analysis failed after import:", err);
  }

  return {
    integrationRepo: saved,
    repository: analyzed?.repository ?? null,
    indexResult: analyzed?.indexResult ?? null,
    fileTree: analyzed?.fileTree ?? null,
  };
};

export const bulkImportRepositories = async (
  userId: string,
  integrationId: string,
  repos: { owner: string; name: string }[]
) => {
  const integration = await getValidIntegration(userId, integrationId);

  const results = await Promise.allSettled(
    repos.map(async ({ owner, name }) => {
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

      return saved;
    })
  );

  await updateIntegration(integrationId, { lastSyncAt: new Date() });

  return {
    imported: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
    results: results.map((r) =>
      r.status === "fulfilled" ? r.value : { error: r.reason?.message }
    ),
  };
};

export const importFromUrl = async (
  userId: string,
  integrationId: string,
  gitUrl: string
) => {
  const integration = await getValidIntegration(userId, integrationId);

  const match = gitUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo");
  }

  const [, owner, name] = match;
  return importRepository(userId, integrationId, owner, name);
};

export const listBranches = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

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

export const listCommits = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  branch: string = "main",
  page: number = 1,
  perPage: number = 20
) => {
  const integration = await getValidIntegration(userId, integrationId);
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
    verified: c.commit.verification?.verified ?? false,
  }));
};

export const getCommitDetail = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  sha: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: commit } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return {
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author?.name ?? "Unknown",
      email: commit.commit.author?.email,
      date: commit.commit.author?.date,
      avatarUrl: commit.author?.avatar_url,
    },
    committer: {
      name: commit.commit.committer?.name ?? "Unknown",
      email: commit.commit.committer?.email,
      date: commit.commit.committer?.date,
    },
    url: commit.html_url,
    verified: commit.commit.verification?.verified ?? false,
    parents: commit.parents.map((p) => ({ sha: p.sha, url: p.html_url })),
    stats: {
      additions: commit.stats?.additions ?? 0,
      deletions: commit.stats?.deletions ?? 0,
      total: commit.stats?.total ?? 0,
    },
    files: commit.files?.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch,
    })) ?? [],
  };
};

export const compareCommits = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  base: string,
  head: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data } = await octokit.rest.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${base}...${head}`,
  });

  return {
    status: data.status,
    aheadBy: data.ahead_by,
    behindBy: data.behind_by,
    totalCommits: data.total_commits,
    files: data.files?.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch,
    })) ?? [],
    commits: data.commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name ?? "Unknown",
      date: c.commit.author?.date,
      url: c.html_url,
    })),
  };
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
  const integration = await getValidIntegration(userId, integrationId);
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

  return prs.map((pr) => {
    const p = pr as any;
    return {
      number: p.number,
      title: p.title,
      body: p.body,
      state: p.state,
      author: p.user?.login ?? "Unknown",
      headBranch: p.head.ref,
      baseBranch: p.base.ref,
      merged: p.merged ?? false,
      mergeable: p.mergeable ?? null,
      additions: p.additions ?? 0,
      deletions: p.deletions ?? 0,
      changedFiles: p.changed_files ?? 0,
      url: p.html_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      mergedAt: p.merged_at ?? null,
    };
  });
};

export const getPullRequest = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
) => {
  const integration = await getValidIntegration(userId, integrationId);
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

  const { data: reviewComments } = await octokit.rest.pulls.listReviewComments({
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
    labels: pr.labels.map((l) =>
      typeof l === "string" ? l : l.name ?? ""
    ),
    files: files.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      patch: f.patch,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      user: r.user?.login ?? "Unknown",
      state: r.state,
      body: r.body,
      submittedAt: r.submitted_at,
    })),
    reviewComments: reviewComments.map((c) => ({
      id: c.id,
      user: c.user?.login ?? "Unknown",
      body: c.body,
      path: c.path,
      line: c.line,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  };
};

export const listPRCommits = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: pullNumber,
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

export const getMergeStatus = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return {
    mergeable: pr.mergeable,
    mergeableState: pr.mergeable_state,
    merged: pr.merged,
    mergeCommitSha: pr.merge_commit_sha,
    rebaseable: pr.rebaseable,
    url: pr.html_url,
  };
};

export const listIssues = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  params?: {
    state?: "open" | "closed" | "all";
    labels?: string;
    assignee?: string;
    milestone?: string;
    creator?: string;
    since?: string;
    page?: number;
    perPage?: number;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: params?.state ?? "open",
    sort: "updated",
    direction: "desc",
    labels: params?.labels,
    assignee: params?.assignee,
    milestone: params?.milestone,
    creator: params?.creator,
    since: params?.since,
    page: params?.page ?? 1,
    per_page: params?.perPage ?? 20,
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
        typeof l === "string" ? { name: l, color: "" } : { name: l.name ?? "", color: l.color ?? "" }
      ),
      assignees: issue.assignees?.map((a) => ({
        login: a.login,
        avatarUrl: a.avatar_url,
      })) ?? [],
      milestone: issue.milestone ? {
        title: issue.milestone.title,
        description: issue.milestone.description,
        state: issue.milestone.state,
      } : null,
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
  const integration = await getValidIntegration(userId, integrationId);
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
      typeof l === "string" ? { name: l, color: "" } : { name: l.name ?? "", color: l.color ?? "" }
    ),
    assignees: issue.assignees?.map((a) => ({
      login: a.login,
      avatarUrl: a.avatar_url,
    })) ?? [],
    milestone: issue.milestone ? {
      title: issue.milestone.title,
      description: issue.milestone.description,
      state: issue.milestone.state,
    } : null,
    comments: issue.comments,
    url: issue.html_url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    commentsList: comments.map((c) => ({
      id: c.id,
      author: c.user?.login ?? "Unknown",
      authorAvatar: c.user?.avatar_url,
      body: c.body,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
  };
};

export const listLabels = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100,
  });

  return labels.map((l) => ({
    name: l.name,
    color: l.color,
    description: l.description,
  }));
};

export const listMilestones = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: milestones } = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: "open",
  });

  return milestones.map((m) => ({
    title: m.title,
    description: m.description,
    state: m.state,
    openIssues: m.open_issues,
    closedIssues: m.closed_issues,
    dueOn: m.due_on,
  }));
};

export const syncRepository = async (
  userId: string,
  integrationId: string,
  owner: string,
  name: string
) => {
  const integration = await getValidIntegration(userId, integrationId);

  const existing = await getIntegrationRepo(integrationId, owner, name);
  if (!existing) {
    throw new Error("Repository not imported. Import it first.");
  }

  const octokit = getOctokit(integration.token);
  const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });

  const { data: recentCommits } = await octokit.rest.repos.listCommits({
    owner,
    repo: name,
    sha: repo.default_branch,
    per_page: 5,
  });

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

  return {
    repository: updated,
    recentCommits: recentCommits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name ?? "Unknown",
      date: c.commit.author?.date,
      url: c.html_url,
    })),
    syncedAt: new Date(),
  };
};

export const listTags = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: tags } = await octokit.rest.repos.listTags({
    owner,
    repo,
    per_page: 50,
  });

  return tags.map((t) => ({
    name: t.name,
    commitSha: t.commit.sha,
    url: t.commit.url,
  }));
};

export const listReleases = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: releases } = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });

  return releases.map((r) => ({
    id: r.id,
    name: r.name,
    tagName: r.tag_name,
    body: r.body,
    draft: r.draft,
    prerelease: r.prerelease,
    author: r.author?.login ?? "Unknown",
    createdAt: r.created_at,
    publishedAt: r.published_at,
    url: r.html_url,
    tarballUrl: r.tarball_url,
    zipballUrl: r.zipball_url,
    assets: r.assets.map((a) => ({
      name: a.name,
      size: a.size,
      downloadCount: a.download_count,
      downloadUrl: a.browser_download_url,
    })),
  }));
};

export const listContributors = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: contributors } = await octokit.rest.repos.listContributors({
    owner,
    repo,
    per_page: 30,
  });

  return contributors.map((c) => ({
    login: c.login,
    avatarUrl: c.avatar_url,
    contributions: c.contributions,
    url: c.html_url,
  }));
};

export const getReadme = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: readme } = await octokit.rest.repos.getReadme({
    owner,
    repo,
  });

  const content = Buffer.from(readme.content, "base64").toString("utf8");

  return {
    name: readme.name,
    path: readme.path,
    content,
    sha: readme.sha,
    size: readme.size,
    url: readme.html_url,
  };
};

export const getLicense = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: license } = await octokit.rest.licenses.getForRepo({
    owner,
    repo,
  });

  return {
    name: license.license?.name ?? "Unknown",
    spdxId: license.license?.spdx_id,
    url: license.license?.url,
    content: license.content,
  };
};

export const getRepositoryLanguages = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: languages } = await octokit.rest.repos.listLanguages({
    owner,
    repo,
  });

  return languages;
};

export const analyzeRepository = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
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

  const { data: languages } = await octokit.rest.repos.listLanguages({
    owner,
    repo,
  });

  const { data: recentCommits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    sha: repoData.default_branch,
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
      size: repoData.size,
      topics: repoData.topics ?? [],
      license: repoData.license?.name ?? null,
      homepage: repoData.homepage,
    },
    summary: {
      openPRs: prs.length,
      openIssues: issues.filter((i) => !i.pull_request).length,
      contributors: contributors.length,
      totalCommits: recentCommits.length,
      topLanguages: Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, bytes]) => ({ name, bytes })),
    },
    recentPRs: prs.slice(0, 5).map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "Unknown",
      url: pr.html_url,
      state: pr.state,
    })),
    recentIssues: issues
      .filter((i) => !i.pull_request)
      .slice(0, 5)
      .map((i) => ({
        number: i.number,
        title: i.title,
        author: i.user?.login ?? "Unknown",
        labels: i.labels.map((l) =>
          typeof l === "string" ? l : l.name ?? ""
        ),
        url: i.html_url,
        state: i.state,
      })),
    recentCommits: recentCommits.slice(0, 5).map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name ?? "Unknown",
      date: c.commit.author?.date,
      url: c.html_url,
    })),
    contributors: contributors.slice(0, 10).map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url,
    })),
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// WRITE-BACK OPERATIONS (Create PRs, Issues, Comments, Reviews, Merge)
// ═══════════════════════════════════════════════════════════════════════════

export const createIssue = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  params: {
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
    milestone?: number;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title: params.title,
    body: params.body,
    labels: params.labels,
    assignees: params.assignees,
    milestone: params.milestone,
  });

  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    url: issue.html_url,
    labels: issue.labels.map((l) => (typeof l === "string" ? l : l.name ?? "")),
    assignees: issue.assignees?.map((a) => a.login) ?? [],
    milestone: issue.milestone?.title ?? null,
    createdAt: issue.created_at,
  };
};

export const createPullRequest = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  params: {
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    title: params.title,
    body: params.body,
    head: params.head,
    base: params.base,
    draft: params.draft ?? false,
  });

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    url: pr.html_url,
    head: pr.head.ref,
    base: pr.base.ref,
    draft: pr.draft,
    mergeable: pr.mergeable,
    mergeableState: pr.mergeable_state,
    createdAt: pr.created_at,
  };
};

export const createIssueComment = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: comment } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });

  return {
    id: comment.id,
    body: comment.body,
    author: comment.user?.login ?? "Unknown",
    createdAt: comment.created_at,
    url: comment.html_url,
  };
};

export const createPRComment = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: comment } = await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    body,
    event: "COMMENT",
  });

  return {
    id: comment.id,
    body: comment.body,
    state: comment.state,
    author: comment.user?.login ?? "Unknown",
    submittedAt: comment.submitted_at,
    url: comment.html_url,
  };
};

export const createPRReview = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  params: {
    body: string;
    event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
    comments?: { path: string; position: number; body: string }[];
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: review } = await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    body: params.body,
    event: params.event,
    comments: params.comments?.map((c) => ({
      path: c.path,
      position: c.position,
      body: c.body,
    })),
  });

  return {
    id: review.id,
    body: review.body,
    state: review.state,
    author: review.user?.login ?? "Unknown",
    submittedAt: review.submitted_at,
    url: review.html_url,
  };
};

export const mergePullRequest = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  pullNumber: number,
  params?: {
    mergeMethod?: "merge" | "squash" | "rebase";
    commitTitle?: string;
    commitMessage?: string;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: result } = await octokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: pullNumber,
    merge_method: params?.mergeMethod ?? "squash",
    commit_title: params?.commitTitle,
    commit_message: params?.commitMessage,
  });

  return {
    merged: result.merged,
    message: result.message,
    sha: result.sha,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CI/CD INTEGRATION (Workflows, Runs, Check Runs, Deployments)
// ═══════════════════════════════════════════════════════════════════════════

export const listWorkflows = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data } = await octokit.rest.actions.listRepoWorkflows({
    owner,
    repo,
    per_page: 50,
  });

  return {
    totalCount: data.total_count,
    workflows: data.workflows.map((w) => ({
      id: w.id,
      name: w.name,
      path: w.path,
      state: w.state,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
      badgeUrl: w.badge_url,
      htmlUrl: w.html_url,
    })),
  };
};

export const listWorkflowRuns = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  params?: {
    workflowId?: number;
    branch?: string;
    status?: "completed" | "action_required" | "in_progress" | "queued" | "waiting" | "pending" | "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out";
    page?: number;
    perPage?: number;
  }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data } = params?.workflowId
    ? await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: params.workflowId,
        branch: params?.branch,
        status: params?.status,
        page: params?.page ?? 1,
        per_page: params?.perPage ?? 20,
      })
    : await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch: params?.branch,
        status: params?.status,
        page: params?.page ?? 1,
        per_page: params?.perPage ?? 20,
      });

  return {
    totalCount: data.total_count,
    runs: data.workflow_runs.map((r) => ({
      id: r.id,
      name: r.name,
      branch: r.head_branch,
      commitSha: r.head_sha,
      commitMessage: r.head_commit?.message ?? null,
      status: r.status,
      conclusion: r.conclusion,
      event: r.event,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      runStartedAt: r.run_started_at,
      htmlUrl: r.html_url,
      jobsUrl: r.jobs_url,
      logsUrl: r.logs_url,
      rerunUrl: r.rerun_url,
      runNumber: r.run_number,
    })),
  };
};

export const getWorkflowRunDetail = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  runId: number
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data: run } = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: runId,
  });

  const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRun({
    owner,
    repo,
    run_id: runId,
    per_page: 100,
  });

  return {
    id: run.id,
    name: run.name,
    branch: run.head_branch,
    commitSha: run.head_sha,
    commitMessage: run.head_commit?.message ?? null,
    commitAuthor: run.head_commit?.author?.name ?? null,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
    runStartedAt: run.run_started_at,
    htmlUrl: run.html_url,
    runNumber: run.run_number,
    jobs: jobs.jobs.map((j) => ({
      id: j.id,
      name: j.name,
      status: j.status,
      conclusion: j.conclusion,
      startedAt: j.started_at,
      completedAt: j.completed_at,
      htmlUrl: j.html_url,
      steps: j.steps?.map((s) => ({
        name: s.name,
        status: s.status,
        conclusion: s.conclusion,
        number: s.number,
        startedAt: s.started_at,
        completedAt: s.completed_at,
      })) ?? [],
    })),
  };
};

export const listCheckRuns = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  ref: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data } = await octokit.rest.checks.listForRef({
    owner,
    repo,
    ref,
    per_page: 100,
  });

  return {
    totalCount: data.total_count,
    checkRuns: data.check_runs.map((cr) => ({
      id: cr.id,
      name: cr.name,
      status: cr.status,
      conclusion: cr.conclusion,
      startedAt: cr.started_at,
      completedAt: cr.completed_at,
      htmlUrl: cr.html_url,
      output: cr.output ? {
        title: cr.output.title,
        summary: cr.output.summary,
        annotationsCount: cr.output.annotations_count,
      } : null,
    })),
  };
};

export const listDeployments = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  params?: { environment?: string; sha?: string; page?: number; perPage?: number }
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const { data } = await octokit.rest.repos.listDeployments({
    owner,
    repo,
    sha: params?.sha,
    environment: params?.environment,
    page: params?.page ?? 1,
    per_page: params?.perPage ?? 20,
  });

  const deployments = await Promise.all(
    data.map(async (d) => {
      try {
        const { data: statuses } = await octokit.rest.repos.listDeploymentStatuses({
          owner,
          repo,
          deployment_id: d.id,
          per_page: 5,
        });
        return {
          id: d.id,
          sha: d.sha,
          ref: d.ref,
          environment: d.environment,
          description: d.description,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          statuses: statuses.map((s) => ({
            state: s.state,
            description: s.description,
            targetUrl: s.target_url,
            createdAt: s.created_at,
          })),
        };
      } catch {
        return {
          id: d.id,
          sha: d.sha,
          ref: d.ref,
          environment: d.environment,
          description: d.description,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          statuses: [],
        };
      }
    })
  );

  return deployments;
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANCH PROTECTION
// ═══════════════════════════════════════════════════════════════════════════

export const getBranchProtection = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  branch: string
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  try {
    const { data } = await octokit.rest.repos.getBranchProtection({
      owner,
      repo,
      branch,
    });

    return {
      url: data.url,
      requiredStatusChecks: data.required_status_checks
        ? {
            strict: data.required_status_checks.strict,
            contexts: data.required_status_checks.contexts,
            checks: data.required_status_checks.checks?.map((c) => ({
              context: c.context,
              appId: c.app_id,
            })) ?? [],
          }
        : null,
      requiredPullRequestReviews: data.required_pull_request_reviews
        ? {
            dismissStaleReviews: data.required_pull_request_reviews.dismiss_stale_reviews ?? false,
            requireCodeOwnerReviews: data.required_pull_request_reviews.require_code_owner_reviews ?? false,
            requiredApprovingReviewCount: data.required_pull_request_reviews.required_approving_review_count ?? 1,
            requireLastPushApproval: data.required_pull_request_reviews.require_last_push_approval ?? false,
            dismissalRestrictions: data.required_pull_request_reviews.dismissal_restrictions
              ? {
                  users: data.required_pull_request_reviews.dismissal_restrictions.users?.map((u) => u.login) ?? [],
                  teams: data.required_pull_request_reviews.dismissal_restrictions.teams?.map((t) => t.slug) ?? [],
                }
              : null,
          }
        : null,
      restrictions: data.restrictions
        ? {
            users: data.restrictions.users?.map((u) => u.login) ?? [],
            teams: data.restrictions.teams?.map((t) => t.slug) ?? [],
            apps: data.restrictions.apps?.map((a) => a.slug) ?? [],
          }
        : null,
      requiredLinearHistory: data.required_linear_history?.enabled ?? false,
      allowForcePushes: data.allow_force_pushes?.enabled ?? false,
      allowDeletions: data.allow_deletions?.enabled ?? false,
      requiredConversationResolution: data.required_conversation_resolution?.enabled ?? false,
      lockBranch: data.lock_branch?.enabled ?? false,
      allowForkSyncing: data.allow_fork_syncing?.enabled ?? false,
    };
  } catch (error: any) {
    if (error?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateBranchProtection = async (
  userId: string,
  integrationId: string,
  owner: string,
  repo: string,
  branch: string,
  settings: {
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
) => {
  const integration = await getValidIntegration(userId, integrationId);
  const octokit = getOctokit(integration.token);

  const body: Record<string, unknown> = {
    required_status_checks: settings.requiredStatusChecks === null
      ? null
      : settings.requiredStatusChecks
        ? {
            strict: settings.requiredStatusChecks.strict,
            contexts: settings.requiredStatusChecks.contexts,
          }
        : undefined,
    required_pull_request_reviews: settings.requiredPullRequestReviews === null
      ? null
      : settings.requiredPullRequestReviews
        ? {
            dismiss_stale_reviews: settings.requiredPullRequestReviews.dismissStaleReviews,
            require_code_owner_reviews: settings.requiredPullRequestReviews.requireCodeOwnerReviews,
            required_approving_review_count: settings.requiredPullRequestReviews.requiredApprovingReviewCount,
            require_last_push_approval: settings.requiredPullRequestReviews.requireLastPushApproval,
          }
        : undefined,
    required_linear_history: settings.requiredLinearHistory !== undefined
      ? { enabled: settings.requiredLinearHistory }
      : undefined,
    allow_force_pushes: settings.allowForcePushes !== undefined
      ? { enabled: settings.allowForcePushes }
      : undefined,
    allow_deletions: settings.allowDeletions !== undefined
      ? { enabled: settings.allowDeletions }
      : undefined,
    required_conversation_resolution: settings.requiredConversationResolution !== undefined
      ? { enabled: settings.requiredConversationResolution }
      : undefined,
    lock_branch: settings.lockBranch !== undefined
      ? { enabled: settings.lockBranch }
      : undefined,
    enforce_admins: true,
  };

  if (settings.restrictions === null) {
    body.restrictions = null;
  } else if (settings.restrictions) {
    body.restrictions = {
      users: settings.restrictions.users ?? [],
      teams: settings.restrictions.teams ?? [],
    };
  }

  const { data } = await (octokit.rest.repos.updateBranchProtection as any)({
    owner,
    repo,
    branch,
    ...body,
  });

  return data;
};
