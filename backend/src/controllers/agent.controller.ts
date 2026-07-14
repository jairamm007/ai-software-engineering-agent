import { executeAgent } from "../services/agent.service.js";
import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const agentController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json(
        errorResponse("Question is required")
      );
    }

    const result =
      await executeAgent(question);

    return res.json(
      successResponse(
        result,
        "Agent executed successfully"
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
