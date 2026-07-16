import {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  updateConversationTitle,
} from "../repository/conversation.repository.js";
import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const listConversations = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const conversations = await getConversations(userId);
    return res.json(successResponse(conversations));
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Internal Server Error")
    );
  }
};

export const getConversation = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const id = String(req.params.id);
    const conversation = await getConversationById(id, userId);
    if (!conversation) {
      return res.status(404).json(errorResponse("Conversation not found"));
    }
    return res.json(successResponse(conversation));
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Internal Server Error")
    );
  }
};

export const createNewConversation = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { title, repositoryId } = req.body;
    if (!title) {
      return res.status(400).json(errorResponse("Title is required"));
    }
    const conversation = await createConversation(userId, title, repositoryId);
    return res.json(successResponse(conversation));
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Internal Server Error")
    );
  }
};

export const removeConversation = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const id = String(req.params.id);
    await deleteConversation(id, userId);
    return res.json(successResponse(null, "Conversation deleted"));
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Internal Server Error")
    );
  }
};

export const renameConversation = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const id = String(req.params.id);
    const { title } = req.body;
    if (!title) {
      return res.status(400).json(errorResponse("Title is required"));
    }
    await updateConversationTitle(id, userId, title);
    return res.json(successResponse(null, "Conversation updated"));
  } catch (error) {
    return res.status(500).json(
      errorResponse(error instanceof Error ? error.message : "Internal Server Error")
    );
  }
};
