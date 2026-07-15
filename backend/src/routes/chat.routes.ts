import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { chatController } from "../controllers/chat.controller.js";
import { chatStreamController } from "../controllers/chat-stream.controller.js";

const router = Router();
router.post("/", requireAuth, chatController);
router.post("/stream", requireAuth, chatStreamController);

export default router;
