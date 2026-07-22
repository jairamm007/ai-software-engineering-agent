import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  orchestrateController,
  executeSingleAgentController,
  getAgentDefinitionsController,
} from "../controllers/multi-agent.controller.js";

const router = Router();

router.get("/multi-agent/agents", requireAuth, getAgentDefinitionsController);
router.post("/multi-agent/orchestrate", requireAuth, orchestrateController);
router.post("/multi-agent/execute", requireAuth, executeSingleAgentController);

export default router;
