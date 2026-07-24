import {
  connectGitHub,
  autoConnectGitHub,
  disconnectGitHub,
  listIntegrations,
  getIntegration,
  listUserRepositories,
  importRepository,
  listBranches,
  listCommits,
  listPullRequests,
  getPullRequest,
  listIssues,
  getIssue,
  syncRepository,
  analyzeRepository,
} from "../services/github-integration.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const connectGitHubController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { token, githubUrl } = req.body;
    if (!token) { res.status(400).json(errorResponse("GitHub token is required")); return; }

    const result = await connectGitHub(userId, token, githubUrl);
    res.status(201).json(successResponse(result, "GitHub connected"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to connect GitHub";
    const status = msg.includes("Bad credentials") || msg.includes("Unauthorized") ? 401 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const autoConnectGitHubController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

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
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId } = req.params;
    await disconnectGitHub(userId, integrationId);
    res.status(200).json(successResponse(null, "GitHub disconnected"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to disconnect";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listIntegrationsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const integrations = await listIntegrations(userId);
    res.status(200).json(successResponse(integrations, "Integrations fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch integrations"));
  }
};

export const getIntegrationController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId } = req.params;
    const integration = await getIntegration(userId, integrationId);
    res.status(200).json(successResponse(integration, "Integration fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch integration";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listRepositoriesController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId } = req.params;
    const repos = await listUserRepositories(userId, integrationId);
    res.status(200).json(successResponse(repos, "Repositories fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch repositories";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const importRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId } = req.params;
    const { owner, name } = req.body;
    if (!owner || !name) {
      res.status(400).json(errorResponse("Owner and name are required"));
      return;
    }

    const repo = await importRepository(userId, integrationId, owner, name);
    res.status(201).json(successResponse(repo, "Repository imported"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to import repository";
    const status = msg.includes("not found") ? 404 : msg.includes("already") ? 409 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const listBranchesController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const branches = await listBranches(userId, integrationId, owner, repo);
    res.status(200).json(successResponse(branches, "Branches fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch branches";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listCommitsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const { branch, page, perPage } = req.query;
    const commits = await listCommits(
      userId,
      integrationId,
      owner,
      repo,
      (branch as string) ?? "main",
      Number(page) || 1,
      Number(perPage) || 20
    );
    res.status(200).json(successResponse(commits, "Commits fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch commits";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listPullRequestsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const { state, page, perPage } = req.query;
    const prs = await listPullRequests(
      userId,
      integrationId,
      owner,
      repo,
      (state as "open" | "closed" | "all") ?? "open",
      Number(page) || 1,
      Number(perPage) || 20
    );
    res.status(200).json(successResponse(prs, "Pull requests fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pull requests";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getPullRequestController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo, pullNumber } = req.params;
    const pr = await getPullRequest(
      userId,
      integrationId,
      owner,
      repo,
      Number(pullNumber)
    );
    res.status(200).json(successResponse(pr, "Pull request fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pull request";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const listIssuesController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const { state, page, perPage } = req.query;
    const issues = await listIssues(
      userId,
      integrationId,
      owner,
      repo,
      (state as "open" | "closed" | "all") ?? "open",
      Number(page) || 1,
      Number(perPage) || 20
    );
    res.status(200).json(successResponse(issues, "Issues fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch issues";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const getIssueController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo, issueNumber } = req.params;
    const issue = await getIssue(
      userId,
      integrationId,
      owner,
      repo,
      Number(issueNumber)
    );
    res.status(200).json(successResponse(issue, "Issue fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch issue";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const syncRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const updated = await syncRepository(userId, integrationId, owner, repo);
    res.status(200).json(successResponse(updated, "Repository synced"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to sync repository";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const analyzeRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { integrationId, owner, repo } = req.params;
    const analysis = await analyzeRepository(userId, integrationId, owner, repo);
    res.status(200).json(successResponse(analysis, "Repository analyzed"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to analyze repository";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};
