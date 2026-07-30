import { getTeamAnalytics } from "../services/team-analytics.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const teamAnalyticsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const teamId = req.params.teamId as string;
    const analytics = await getTeamAnalytics(teamId, userId);
    res.status(200).json(successResponse(analytics, "Analytics fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch analytics";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};
