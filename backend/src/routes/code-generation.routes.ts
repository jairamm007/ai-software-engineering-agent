import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  generateCodeController,
  refactorCodeController,
  explainCodeController,
  translateCodeController,
  generateTestsController,
  generateDocumentationController,
  getGenerationHistoryController,
  getSavedPromptsController,
  createSavedPromptController,
  deleteSavedPromptController,
  recordHistoryActionController,
  applyGeneratedCodeController,
} from "../controllers/code-generation.controller.js";

const router = Router();

router.post("/generate", requireAuth, generateCodeController);
router.post("/refactor", requireAuth, refactorCodeController);
router.post("/explain", requireAuth, explainCodeController);
router.post("/translate", requireAuth, translateCodeController);
router.post("/tests", requireAuth, generateTestsController);
router.post("/documentation", requireAuth, generateDocumentationController);

router.get("/history", requireAuth, getGenerationHistoryController);

router.get("/prompts", requireAuth, getSavedPromptsController);
router.post("/prompts", requireAuth, createSavedPromptController);
router.delete("/prompts/:id", requireAuth, deleteSavedPromptController);

router.post("/history/action", requireAuth, recordHistoryActionController);
router.post("/apply", requireAuth, applyGeneratedCodeController);

export default router;
