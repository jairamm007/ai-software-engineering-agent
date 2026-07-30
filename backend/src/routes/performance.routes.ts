import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validatePerformanceScanInput } from "../validators/performance.validator.js";
import { startScan, getReport, getHistory, getIssues } from "../controllers/performance.controller.js";

const router = Router();

router.post("/performance/scan", requireAuth, validatePerformanceScanInput, startScan);
router.get("/performance/report/:id", requireAuth, getReport);
router.get("/performance/history", requireAuth, getHistory);
router.get("/performance/issues/:repositoryId", requireAuth, getIssues);

export default router;
