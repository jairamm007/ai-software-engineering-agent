import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  scanRepositoryController,
  getReportController,
  getHistoryController,
  getIssuesController,
  updateIssueController,
  getScanByIdController,
} from "../controllers/security.controller.js";

const router = Router();

router.post("/security/scan", requireAuth, scanRepositoryController);
router.get("/security/report/:id", requireAuth, getReportController);
router.get("/security/history", requireAuth, getHistoryController);
router.get("/security/issues/:repositoryId", requireAuth, getIssuesController);
router.patch("/security/issues", requireAuth, updateIssueController);
router.get("/security/scan/:id", requireAuth, getScanByIdController);

export default router;
