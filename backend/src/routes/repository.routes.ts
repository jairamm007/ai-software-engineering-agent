import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  analyzeRepositoryController,
  getRepositoriesController,
  getRepositoryByIdController,
  deleteRepositoryController,
  toggleFavoriteController,
  reindexRepositoryController,
} from "../controllers/repository.controller.js";
import { getRepositoryAnalyticsController } from "../controllers/repository-analytics.controller.js";

const router = Router();

router.get("/", requireAuth, getRepositoriesController);
router.get("/:id/analytics", requireAuth, getRepositoryAnalyticsController);
router.get("/:id", requireAuth, getRepositoryByIdController);
router.patch("/:id/favorite", requireAuth, toggleFavoriteController);
router.post("/:id/reindex", requireAuth, reindexRepositoryController);
router.delete("/:id", requireAuth, deleteRepositoryController);
router.post("/analyze", requireAuth, analyzeRepositoryController);

export default router;
