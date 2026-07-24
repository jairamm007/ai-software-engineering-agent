import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  updateProfileController,
  deleteAccountController,
  changePasswordController,
  exportDataController,
  clearCacheController,
  uploadBannerController,
  removeBannerController,
} from "../controllers/user.controller.js";

const router = Router();

router.put("/profile", requireAuth, updateProfileController);
router.delete("/account", requireAuth, deleteAccountController);
router.post("/change-password", requireAuth, changePasswordController);
router.get("/export", requireAuth, exportDataController);
router.post("/clear-cache", requireAuth, clearCacheController);
router.post("/banner", requireAuth, uploadBannerController);
router.delete("/banner", requireAuth, removeBannerController);

export default router;
