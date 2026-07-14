import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  deleteAccountController,
  changePasswordController,
  exportDataController,
  clearCacheController,
} from "../controllers/user.controller.js";

const router = Router();

router.delete("/account", requireAuth, deleteAccountController);
router.post("/change-password", requireAuth, changePasswordController);
router.get("/export", requireAuth, exportDataController);
router.post("/clear-cache", requireAuth, clearCacheController);

export default router;
