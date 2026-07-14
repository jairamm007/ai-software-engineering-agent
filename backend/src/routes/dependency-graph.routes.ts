import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

import {
  dependencyGraphSummaryController,
  getDependencyGraphController,
} from "../controllers/dependency-graph.controller.js";

const router = Router();

router.get("/:id/dependency-graph", requireAuth, getDependencyGraphController);
router.post("/:id/dependency-graph/summary", requireAuth, dependencyGraphSummaryController);

export default router;
