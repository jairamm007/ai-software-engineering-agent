import { Router } from "express";
import { requireAuth } from "../../auth/auth.middleware.js";
import {
  downloadInsightReportController,
  exportInsightsController,
  getInsightsArchitectureController,
  getInsightsController,
  getInsightsRecommendationsController,
  getInsightsSummaryController,
  refreshInsightsController,
} from "./insights.controller.js";

const router = Router();

router.get("/insights/:repositoryId", requireAuth, getInsightsController);
router.post("/insights/:repositoryId/refresh", requireAuth, refreshInsightsController);
router.get("/insights/:repositoryId/summary", requireAuth, getInsightsSummaryController);
router.get("/insights/:repositoryId/architecture", requireAuth, getInsightsArchitectureController);
router.get("/insights/:repositoryId/recommendations", requireAuth, getInsightsRecommendationsController);
router.post("/insights/:repositoryId/export", requireAuth, exportInsightsController);
router.get("/insights/reports/:reportId/download", requireAuth, downloadInsightReportController);

export default router;
