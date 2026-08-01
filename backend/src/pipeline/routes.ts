import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  startPipelineController,
  getRunController,
  getHistoryController,
  listRunsController,
  createRunController,
  getRunDetailController,
} from "./controller.js";

const router = Router();

router.post("/pipeline/runs", requireAuth, startPipelineController);
router.get("/pipeline/runs/:id", requireAuth, getRunController);
router.get("/pipeline/history", requireAuth, getHistoryController);

router.get("/runs", requireAuth, listRunsController);
router.post("/runs", requireAuth, createRunController);
router.get("/runs/:id/full", requireAuth, getRunDetailController);

export default router;
