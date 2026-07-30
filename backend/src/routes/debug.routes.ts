import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  analyzeErrorController,
  analyzeStacktraceController,
  detectBugsController,
  suggestFixController,
  analyzeLogsController,
  getHistoryController,
  getSessionController,
  recordActionController,
} from "../controllers/debug.controller.js";

const router = Router();

router.post("/debug/analyze", requireAuth, analyzeErrorController);
router.post("/debug/stacktrace", requireAuth, analyzeStacktraceController);
router.post("/debug/bugs", requireAuth, detectBugsController);
router.post("/debug/fix", requireAuth, suggestFixController);
router.post("/debug/logs", requireAuth, analyzeLogsController);

router.get("/debug/history", requireAuth, getHistoryController);
router.get("/debug/session/:id", requireAuth, getSessionController);

router.post("/debug/history/action", requireAuth, recordActionController);

export default router;
