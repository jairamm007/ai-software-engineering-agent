import {
  getPreferences,
  upsertPreferences,
} from "../repository/user-preference.repository.js";
import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const getPreferencesController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const prefs = await getPreferences(userId);
    res.json(successResponse(prefs));
  } catch (error) {
    res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Failed to get preferences")
    );
  }
};

export const updatePreferencesController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { defaultModel, temperature, theme, accentColor } = req.body;
    const data: Record<string, any> = {};
    if (defaultModel !== undefined) data.defaultModel = String(defaultModel);
    if (temperature !== undefined) data.temperature = Number(temperature);
    if (theme !== undefined) data.theme = String(theme);
    if (accentColor !== undefined) data.accentColor = String(accentColor);

    const prefs = await upsertPreferences(userId, data);
    res.json(successResponse(prefs));
  } catch (error) {
    res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Failed to update preferences")
    );
  }
};
