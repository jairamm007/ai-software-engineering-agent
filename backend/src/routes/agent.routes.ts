import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { agentController } from "../controllers/agent.controller.js";

const router = Router();
router.post("/", requireAuth, agentController);

export default router;
