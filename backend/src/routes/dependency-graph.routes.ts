import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

import {
  dependencyGraphSummaryController,
  getDependencyGraphController,
  getBlastRadiusController,
  getDependentsController,
  invalidateGraphCacheController,
} from "../controllers/dependency-graph.controller.js";

const router = Router();

router.get("/:id/dependency-graph", requireAuth, getDependencyGraphController);
router.get("/:id/dependency-graph/dependents", requireAuth, getDependentsController);
router.get("/:id/dependency-graph/blast-radius", requireAuth, getBlastRadiusController);
router.post("/:id/dependency-graph/invalidate", requireAuth, invalidateGraphCacheController);
router.post("/:id/dependency-graph/summary", requireAuth, dependencyGraphSummaryController);

export default router;
