import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  createChatController,
  listChatsController,
  getChatController,
  sendMessageController,
  deleteChatController,
} from "../controllers/team-chat.controller.js";

const router = Router();

router.get("/teams/:teamId/chats", requireAuth, listChatsController);
router.post("/teams/:teamId/chats", requireAuth, createChatController);
router.get("/teams/:teamId/chats/:chatId", requireAuth, getChatController);
router.post("/teams/:teamId/chats/:chatId/messages", requireAuth, sendMessageController);
router.delete("/teams/:teamId/chats/:chatId", requireAuth, deleteChatController);

export default router;
