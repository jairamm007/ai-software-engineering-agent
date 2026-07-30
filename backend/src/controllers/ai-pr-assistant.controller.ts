import type { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/api-response.js";
import * as aiPRService from "../services/ai-pr-assistant.service.js";

const s = (v: string | string[] | undefined): string | undefined =>
  v === undefined ? undefined : Array.isArray(v) ? v[0] : v;

export const generateDescription = async (req: Request, res: Response) => {
  try {
    const { owner, repo, commits, baseBranch, headBranch, title } = req.body;
    if (!owner || !repo || !commits || !baseBranch || !headBranch) {
      res.status(400).json(errorResponse("Missing required fields: owner, repo, commits, baseBranch, headBranch"));
      return;
    }
    const result = await aiPRService.generatePRDescription({ owner, repo, commits, baseBranch, headBranch, title });
    res.status(200).json(successResponse(result, "PR description generated"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate PR description"));
  }
};

export const reviewPR = async (req: Request, res: Response) => {
  try {
    const { owner, repo, pullNumber, files } = req.body;
    if (!owner || !repo || !pullNumber || !files) {
      res.status(400).json(errorResponse("Missing required fields: owner, repo, pullNumber, files"));
      return;
    }
    const result = await aiPRService.generatePRReview({ owner, repo, pullNumber, files });
    res.status(200).json(successResponse(result, "PR review generated"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate PR review"));
  }
};

export const suggestTitle = async (req: Request, res: Response) => {
  try {
    const { commits, headBranch, baseBranch } = req.body;
    if (!commits || !headBranch || !baseBranch) {
      res.status(400).json(errorResponse("Missing required fields: commits, headBranch, baseBranch"));
      return;
    }
    const result = await aiPRService.suggestPRTitle({ commits, headBranch, baseBranch });
    res.status(200).json(successResponse(result, "PR title suggestions generated"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate PR title suggestions"));
  }
};
