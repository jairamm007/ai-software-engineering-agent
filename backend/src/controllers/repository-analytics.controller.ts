import { Request, Response } from "express";

import { getRepositoryAnalytics } from "../services/repository-analytics.service.js";
import { errorResponse, successResponse } from "../utils/api-response.js";

export const getRepositoryAnalyticsController = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
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
