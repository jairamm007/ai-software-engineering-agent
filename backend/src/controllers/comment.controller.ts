import {
  createNewComment,
  listComments,
  getComment,
  editComment,
  removeComment,
  toggleResolveComment,
  getMentionedComments,
  getUnresolvedCount,
} from "../services/comment.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const createCommentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { content, repositoryId, parentCommentId } = req.body;
    if (!content) { res.status(400).json(errorResponse("Content is required")); return; }

    const comment = await createNewComment(teamId, userId, content, repositoryId, parentCommentId);
    res.status(201).json(successResponse(comment, "Comment created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create comment";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const listCommentsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { repositoryId, limit, offset } = req.query;

    const comments = await listComments(teamId, userId, {
      repositoryId: repositoryId as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.status(200).json(successResponse(comments, "Comments fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch comments";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const getCommentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { commentId } = req.params;
    const comment = await getComment(commentId, userId);
    res.status(200).json(successResponse(comment, "Comment fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch comment";
    const status = msg.includes("not found") ? 404 : msg.includes("not a member") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const updateCommentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) { res.status(400).json(errorResponse("Content is required")); return; }

    const comment = await editComment(commentId, userId, content);
    res.status(200).json(successResponse(comment, "Comment updated"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update comment";
    const status = msg.includes("not found") ? 404 : msg.includes("own") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const deleteCommentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { commentId } = req.params;
    await removeComment(commentId, userId);
    res.status(200).json(successResponse(null, "Comment deleted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete comment";
    const status = msg.includes("not found") ? 404 : msg.includes("permissions") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const resolveCommentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { commentId } = req.params;
    const { resolved } = req.body;

    const comment = await toggleResolveComment(commentId, userId, resolved ?? true);
    res.status(200).json(successResponse(comment, resolved ? "Comment resolved" : "Comment unresolved"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to resolve comment";
    res.status(msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const mentionsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const comments = await getMentionedComments(teamId, userId);
    res.status(200).json(successResponse(comments, "Mentions fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch mentions";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const unresolvedCountController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const count = await getUnresolvedCount(teamId, userId);
    res.status(200).json(successResponse({ count }, "Unresolved count fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch count";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};
