import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  listNotificationsController,
  unreadCountController,
  markReadController,
  markAllReadController,
  deleteNotificationController,
} from "../controllers/team-notification.controller.js";

const router = Router();

router.get("/teams/:teamId/notifications", requireAuth, listNotificationsController);
router.get("/teams/:teamId/notifications/unread-count", requireAuth, unreadCountController);
router.patch("/teams/:teamId/notifications/read-all", requireAuth, markAllReadController);
router.patch("/notifications/:notificationId/read", requireAuth, markReadController);
router.delete("/notifications/:notificationId", requireAuth, deleteNotificationController);

export default router;
