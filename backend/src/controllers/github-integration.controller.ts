import {
  connectGitHub,
  autoConnectGitHub,
  disconnectGitHub,
  listIntegrations,
  getIntegration,
  getGitHubProfile,
  listUserRepositories,
  importRepository,
  bulkImportRepositories,
  importFromUrl,
  listOrganizations,
  listOrgRepositories,
  syncRepository,
  analyzeRepository,
  listBranches,
  listCommits,
  getCommitDetail,
  compareCommits,
  listTags,
  listReleases,
  listContributors,
  getReadme,
  getLicense,
  getRepositoryLanguages,
  listPullRequests,
  getPullRequest,
  listPRCommits,
  getMergeStatus,
  listIssues,
  getIssue,
  listLabels,
  listMilestones,
  createIssue,
  createPullRequest,
  createIssueComment,
  createPRComment,
  createPRReview,
  mergePullRequest,
  listWorkflows,
  listWorkflowRuns,
  getWorkflowRunDetail,
  listCheckRuns,
  listDeployments,
  getBranchProtection,
  updateBranchProtection,
} from "../services/github-integration.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

const requireUserId = (req: AuthRequest, res: Response): string | null => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return null;
  }
  return userId;
};

const s = (v: string | string[]): string =>
  Array.isArray(v) ? v[0] : v;

// ── Integration Management ──

export const connectGitHubController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { token, githubUrl } = req.body;
    if (!token) {
      res.status(400).json(errorResponse("GitHub token is required"));
      return;
    }

    const result = await connectGitHub(userId, token, githubUrl);
    res.status(201).json(successResponse(result, "GitHub connected"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to connect GitHub";
    const status = msg.includes("Bad credentials") || msg.includes("Unauthorized") ? 401 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const autoConnectGitHubController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const result = await autoConnectGitHub(userId);
    res.status(201).json(successResponse(result, "GitHub connected via OAuth"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to auto-connect GitHub";
    const status = msg.includes("not linked") ? 400 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const disconnectGitHubController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    await disconnectGitHub(userId, s(req.params.integrationId));
    res.status(200).json(successResponse(null, "GitHub disconnected"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to disconnect";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listIntegrationsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const integrations = await listIntegrations(userId);
    res.status(200).json(successResponse(integrations, "Integrations fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch integrations"));
  }
};

export const getIntegrationController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const integration = await getIntegration(userId, s(req.params.integrationId));
    res.status(200).json(successResponse(integration, "Integration fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch integration";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getGitHubProfileController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const profile = await getGitHubProfile(userId, s(req.params.integrationId));
    res.status(200).json(successResponse(profile, "Profile fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch GitHub profile";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Repository Management ──

export const listRepositoriesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const repos = await listUserRepositories(userId, s(req.params.integrationId), {
      search: req.query.search as string,
      language: req.query.language as string,
      owner: req.query.owner as string,
      sort: req.query.sort as "updated" | "pushed" | "created" | "full_name",
      type: req.query.type as "all" | "public" | "private" | "owner" | "member",
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 100,
    });
    res.status(200).json(successResponse(repos, "Repositories fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch repositories";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const importRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { owner, name } = req.body;
    if (!owner || !name) {
      res.status(400).json(errorResponse("Owner and name are required"));
      return;
    }

    const repo = await importRepository(userId, s(req.params.integrationId), owner, name);
    res.status(201).json(successResponse(repo, "Repository imported"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to import repository";
    const status = msg.includes("not found") ? 404 : msg.includes("already") ? 409 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const bulkImportRepositoriesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { repos } = req.body;
    if (!Array.isArray(repos) || repos.length === 0) {
      res.status(400).json(errorResponse("repos array is required"));
      return;
    }

    const result = await bulkImportRepositories(userId, s(req.params.integrationId), repos);
    res.status(201).json(successResponse(result, "Bulk import completed"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to bulk import";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const importFromUrlController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json(errorResponse("url is required"));
      return;
    }

    const repo = await importFromUrl(userId, s(req.params.integrationId), url);
    res.status(201).json(successResponse(repo, "Repository imported from URL"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to import from URL";
    const status = msg.includes("Invalid") ? 400 : msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

// ── Organizations ──

export const listOrganizationsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const orgs = await listOrganizations(userId, s(req.params.integrationId));
    res.status(200).json(successResponse(orgs, "Organizations fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch organizations";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listOrgRepositoriesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const repos = await listOrgRepositories(userId, s(req.params.integrationId), s(req.params.org));
    res.status(200).json(successResponse(repos, "Organization repositories fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch org repositories";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Sync & Analyze ──

export const syncRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const updated = await syncRepository(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(updated, "Repository synced"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to sync repository";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const analyzeRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const analysis = await analyzeRepository(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(analysis, "Repository analyzed"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to analyze repository";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Branches ──

export const listBranchesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const branches = await listBranches(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(branches, "Branches fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch branches";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Commits ──

export const listCommitsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const commits = await listCommits(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      (req.query.branch as string) ?? "main",
      Number(req.query.page) || 1,
      Number(req.query.perPage) || 20
    );
    res.status(200).json(successResponse(commits, "Commits fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch commits";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getCommitDetailController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const commit = await getCommitDetail(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), s(req.params.sha));
    res.status(200).json(successResponse(commit, "Commit fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch commit";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const compareCommitsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const comparison = await compareCommits(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), s(req.params.base), s(req.params.head));
    res.status(200).json(successResponse(comparison, "Commits compared"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to compare commits";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Tags & Releases ──

export const listTagsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const tags = await listTags(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(tags, "Tags fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch tags";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listReleasesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const releases = await listReleases(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(releases, "Releases fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch releases";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Contributors ──

export const listContributorsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const contributors = await listContributors(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(contributors, "Contributors fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch contributors";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Repository Info ──

export const getReadmeController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const readme = await getReadme(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(readme, "README fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch README";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getLicenseController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const license = await getLicense(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(license, "License fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch license";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getRepositoryLanguagesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const languages = await getRepositoryLanguages(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(languages, "Languages fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch languages";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Pull Requests ──

export const listPullRequestsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const prs = await listPullRequests(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      (req.query.state as "open" | "closed" | "all") ?? "open",
      Number(req.query.page) || 1,
      Number(req.query.perPage) || 20
    );
    res.status(200).json(successResponse(prs, "Pull requests fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pull requests";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getPullRequestController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const pr = await getPullRequest(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber))
    );
    res.status(200).json(successResponse(pr, "Pull request fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pull request";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listPRCommitsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const commits = await listPRCommits(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber))
    );
    res.status(200).json(successResponse(commits, "PR commits fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch PR commits";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getMergeStatusController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const status = await getMergeStatus(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber))
    );
    res.status(200).json(successResponse(status, "Merge status fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch merge status";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ── Issues ──

export const listIssuesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const issues = await listIssues(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), {
      state: (req.query.state as "open" | "closed" | "all") ?? "open",
      labels: req.query.labels as string,
      assignee: req.query.assignee as string,
      milestone: req.query.milestone as string,
      creator: req.query.creator as string,
      since: req.query.since as string,
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 20,
    });
    res.status(200).json(successResponse(issues, "Issues fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch issues";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getIssueController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const issue = await getIssue(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.issueNumber))
    );
    res.status(200).json(successResponse(issue, "Issue fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch issue";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listLabelsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const labels = await listLabels(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(labels, "Labels fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch labels";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listMilestonesController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const milestones = await listMilestones(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(milestones, "Milestones fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch milestones";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WRITE-BACK CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

export const createIssueController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { title, body, labels, assignees, milestone } = req.body;
    if (!title) {
      res.status(400).json(errorResponse("Title is required"));
      return;
    }

    const issue = await createIssue(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), {
      title,
      body,
      labels,
      assignees,
      milestone,
    });
    res.status(201).json(successResponse(issue, "Issue created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create issue";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const createPullRequestController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { title, body, head, base, draft } = req.body;
    if (!title || !head || !base) {
      res.status(400).json(errorResponse("title, head, and base are required"));
      return;
    }

    const pr = await createPullRequest(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), {
      title,
      body,
      head,
      base,
      draft,
    });
    res.status(201).json(successResponse(pr, "Pull request created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create pull request";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const createIssueCommentController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { body } = req.body;
    if (!body) {
      res.status(400).json(errorResponse("Comment body is required"));
      return;
    }

    const comment = await createIssueComment(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.issueNumber)),
      body
    );
    res.status(201).json(successResponse(comment, "Comment created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create comment";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const createPRCommentController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { body } = req.body;
    if (!body) {
      res.status(400).json(errorResponse("Comment body is required"));
      return;
    }

    const comment = await createPRComment(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber)),
      body
    );
    res.status(201).json(successResponse(comment, "PR comment created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create PR comment";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const createPRReviewController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { body, event, comments } = req.body;
    if (!body || !event) {
      res.status(400).json(errorResponse("body and event are required"));
      return;
    }

    if (!["APPROVE", "REQUEST_CHANGES", "COMMENT"].includes(event)) {
      res.status(400).json(errorResponse("event must be APPROVE, REQUEST_CHANGES, or COMMENT"));
      return;
    }

    const review = await createPRReview(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber)),
      { body, event, comments }
    );
    res.status(201).json(successResponse(review, "Review submitted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create review";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const mergePullRequestController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { mergeMethod, commitTitle, commitMessage } = req.body;

    const result = await mergePullRequest(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.pullNumber)),
      { mergeMethod, commitTitle, commitMessage }
    );
    res.status(200).json(successResponse(result, result.merged ? "Pull request merged" : "Failed to merge"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to merge pull request";
    const status = msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CI/CD CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

export const listWorkflowsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const workflows = await listWorkflows(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo));
    res.status(200).json(successResponse(workflows, "Workflows fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch workflows";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listWorkflowRunsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const runs = await listWorkflowRuns(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), {
      workflowId: req.query.workflowId ? Number(req.query.workflowId) : undefined,
      branch: req.query.branch as string,
      status: req.query.status as "completed" | "action_required" | "in_progress" | "queued" | "waiting" | "pending" | "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out",
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 20,
    });
    res.status(200).json(successResponse(runs, "Workflow runs fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch workflow runs";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getWorkflowRunDetailController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const detail = await getWorkflowRunDetail(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      Number(s(req.params.runId))
    );
    res.status(200).json(successResponse(detail, "Workflow run detail fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch workflow run detail";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listCheckRunsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const checkRuns = await listCheckRuns(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      s(req.params.ref)
    );
    res.status(200).json(successResponse(checkRuns, "Check runs fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch check runs";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listDeploymentsController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const deployments = await listDeployments(userId, s(req.params.integrationId), s(req.params.owner), s(req.params.repo), {
      environment: req.query.environment as string,
      sha: req.query.sha as string,
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 20,
    });
    res.status(200).json(successResponse(deployments, "Deployments fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch deployments";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANCH PROTECTION
// ═══════════════════════════════════════════════════════════════════════════

export const getBranchProtectionController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const protection = await getBranchProtection(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      s(req.params.branch)
    );
    res.status(200).json(successResponse(protection, "Branch protection fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch branch protection";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const updateBranchProtectionController = async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const result = await updateBranchProtection(
      userId,
      s(req.params.integrationId),
      s(req.params.owner),
      s(req.params.repo),
      s(req.params.branch),
      req.body
    );
    res.status(200).json(successResponse(result, "Branch protection updated"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update branch protection";
    res.status(500).json(errorResponse(msg));
  }
};
