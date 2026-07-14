import { getRepositoryAnalytics } from "../services/repository-analytics.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { errorResponse, successResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const getRepositoryAnalyticsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    // Verify ownership first
    const repo = await getRepositoryById(req.params.id, userId);
    if (!repo) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    const analytics = await getRepositoryAnalytics(req.params.id);

    if (!analytics) {
      res.status(404).json(errorResponse("Repository not found"));
      return;
    }

    res.status(200).json(
      successResponse(analytics, "Repository analytics fetched successfully")
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to fetch repository analytics"
      )
    );
  }
};
