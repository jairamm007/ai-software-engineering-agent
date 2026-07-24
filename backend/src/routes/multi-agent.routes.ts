import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  orchestrateController,
  executeSingleAgentController,
  getAgentDefinitionsController,
  getAgentMetadataController,
  getAgentMetadataByTypeController,
  getToolsController,
  getAgentToolsController,
  getMemoryController,
} from "../controllers/multi-agent.controller.js";

const router = Router();

router.get("/multi-agent/agents", requireAuth, getAgentDefinitionsController);
router.post("/multi-agent/orchestrate", requireAuth, orchestrateController);
router.post("/multi-agent/execute", requireAuth, executeSingleAgentController);

router.get("/multi-agent/metadata", requireAuth, getAgentMetadataController);
router.get("/multi-agent/metadata/:type", requireAuth, getAgentMetadataByTypeController);

router.get("/multi-agent/tools", requireAuth, getToolsController);
router.get("/multi-agent/tools/:type", requireAuth, getAgentToolsController);

router.get("/multi-agent/memory/:sessionId", requireAuth, getMemoryController);

export default router;
