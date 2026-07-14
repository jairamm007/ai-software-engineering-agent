import { askRepository } from "../services/rag.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const chatController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const {
      question,
      repositoryId,
      filePath,
    } = req.body;

    if (!question) {
      return res
        .status(400)
        .json(errorResponse("Question is required"));
    }

    // If a repositoryId is provided, verify ownership
    if (repositoryId) {
      const repo = await getRepositoryById(repositoryId, userId);
      if (!repo) {
        return res
          .status(404)
          .json(errorResponse("Repository not found"));
      }
    }

    const response = await askRepository({
      question,
      repositoryId,
      filePath,
    });

    return res.json(
      successResponse(
        response,
        "Answer generated successfully"
      )
    );
  } catch (error) {
    return res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Internal Server Error"
      )
    );
  }
};
