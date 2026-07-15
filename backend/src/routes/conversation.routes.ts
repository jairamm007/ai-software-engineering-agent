import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  listConversations,
  getConversation,
  createNewConversation,
  removeConversation,
  renameConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

router.get("/", requireAuth, listConversations);
router.get("/:id", requireAuth, getConversation);
router.post("/", requireAuth, createNewConversation);
router.delete("/:id", requireAuth, removeConversation);
router.patch("/:id", requireAuth, renameConversation);

export default router;
