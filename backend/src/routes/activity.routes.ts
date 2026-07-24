import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  listActivitiesController,
  recentActivityCountController,
} from "../controllers/activity.controller.js";

const router = Router();

router.get("/teams/:teamId/activities", requireAuth, listActivitiesController);
router.get("/teams/:teamId/activities/count", requireAuth, recentActivityCountController);

export default router;
