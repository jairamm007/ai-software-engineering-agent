import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { chatController } from "../controllers/chat.controller.js";

const router = Router();
router.post("/", requireAuth, chatController);

export default router;
