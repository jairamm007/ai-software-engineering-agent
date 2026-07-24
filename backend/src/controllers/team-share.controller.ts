import {
  shareTeamRepository,
  unshareTeamRepository,
  getTeamSharedRepos,
} from "../services/team.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const shareTeamRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { repositoryId, permission } = req.body;
    if (!repositoryId) { res.status(400).json(errorResponse("Repository ID is required")); return; }

    const shared = await shareTeamRepository(teamId, userId, repositoryId, permission);
    res.status(201).json(successResponse(shared, "Repository shared with team"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to share repository";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const unshareTeamRepositoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, repositoryId } = req.params;
    await unshareTeamRepository(teamId, userId, repositoryId);
    res.status(200).json(successResponse(null, "Repository removed from team"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to unshare repository";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const listSharedReposController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const repos = await getTeamSharedRepos(teamId, userId);
    res.status(200).json(successResponse(repos, "Shared repositories fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch shared repositories";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};
