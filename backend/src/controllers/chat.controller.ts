import { Request, Response } from "express";

import { askRepository } from "../services/rag.service.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";

export const chatController = async (
  req: Request,
  res: Response
) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res
        .status(400)
        .json(errorResponse("Question is required"));
    }

    const response = await askRepository(question);

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