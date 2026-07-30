import { Router } from "express";
import {
  generateDescription,
  reviewPR,
  suggestTitle,
} from "../controllers/ai-pr-assistant.controller.js";

const router = Router();

router.post("/github/ai-pr/description", generateDescription);
router.post("/github/ai-pr/review", reviewPR);
router.post("/github/ai-pr/suggest-title", suggestTitle);

export default router;
