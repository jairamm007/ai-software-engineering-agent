import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  parseRepositoryController,
  cloneRepositoryController,
} from "../controllers/github.controller.js";

const router = Router();
router.post("/parse", requireAuth, parseRepositoryController);
router.post("/clone", requireAuth, cloneRepositoryController);

export default router;
