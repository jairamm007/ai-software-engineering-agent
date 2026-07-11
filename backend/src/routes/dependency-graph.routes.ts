import { Router } from "express";

import {
  dependencyGraphSummaryController,
  getDependencyGraphController,
} from "../controllers/dependency-graph.controller.js";

const router = Router();

router.get("/:id/dependency-graph", getDependencyGraphController);
router.post("/:id/dependency-graph/summary", dependencyGraphSummaryController);

export default router;
