import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

import {
  getFolderTreeController,
  getLanguageStatsController,
  getComplexityController,
  getImportGraphController,
  getCallGraphController,
  getArchitectureController,
} from "../controllers/repository-intelligence.controller.js";

const router = Router();

router.get("/:id/intelligence/folder-tree", requireAuth, getFolderTreeController);
router.get("/:id/intelligence/languages", requireAuth, getLanguageStatsController);
router.get("/:id/intelligence/complexity", requireAuth, getComplexityController);
router.get("/:id/intelligence/import-graph", requireAuth, getImportGraphController);
router.get("/:id/intelligence/call-graph", requireAuth, getCallGraphController);
router.get("/:id/intelligence/architecture", requireAuth, getArchitectureController);

export default router;
