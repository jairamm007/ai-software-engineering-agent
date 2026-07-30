import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { teamAnalyticsController } from "../controllers/team-analytics.controller.js";

const router = Router();

router.get("/teams/:teamId/analytics", requireAuth, teamAnalyticsController);

export default router;
