import {
  getActivities,
  getRecentCount,
} from "../services/activity.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const listActivitiesController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { limit, offset, action } = req.query;

    const activities = await getActivities(teamId, userId, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      action: action as string,
    });

    res.status(200).json(successResponse(activities, "Activities fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch activities";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const recentActivityCountController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { days } = req.query;

    const count = await getRecentCount(teamId, userId, days ? parseInt(days as string) : 7);
    res.status(200).json(successResponse({ count }, "Activity count fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch activity count";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};
