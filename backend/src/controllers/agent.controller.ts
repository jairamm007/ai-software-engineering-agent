import { Request, Response } from "express";

import { executeAgent } from "../services/agent.service.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";

export const agentController = async (
  req: Request,
  res: Response
) => {
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