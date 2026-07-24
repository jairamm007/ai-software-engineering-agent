import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  createCommentController,
  listCommentsController,
  getCommentController,
  updateCommentController,
  deleteCommentController,
  resolveCommentController,
  mentionsController,
  unresolvedCountController,
} from "../controllers/comment.controller.js";

const router = Router();

router.get("/teams/:teamId/comments", requireAuth, listCommentsController);
router.post("/teams/:teamId/comments", requireAuth, createCommentController);
router.get("/teams/:teamId/comments/mentions", requireAuth, mentionsController);
router.get("/teams/:teamId/comments/unresolved-count", requireAuth, unresolvedCountController);

router.get("/teams/:teamId/comments/:commentId", requireAuth, getCommentController);
router.put("/teams/:teamId/comments/:commentId", requireAuth, updateCommentController);
router.delete("/teams/:teamId/comments/:commentId", requireAuth, deleteCommentController);
router.patch("/teams/:teamId/comments/:commentId/resolve", requireAuth, resolveCommentController);

export default router;
