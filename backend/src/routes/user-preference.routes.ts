import { Router } from "express";

import { requireAuth } from "../auth/auth.middleware.js";
import {
  getPreferencesController,
  updatePreferencesController,
} from "../controllers/user-preference.controller.js";

const router = Router();

router.get("/", requireAuth, getPreferencesController);
router.put("/", requireAuth, updatePreferencesController);

export default router;
