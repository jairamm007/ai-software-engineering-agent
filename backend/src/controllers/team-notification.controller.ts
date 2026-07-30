import {
  listNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from "../services/team-notification.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const listNotificationsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { limit } = req.query;
    const notifications = await listNotifications(
      userId,
      teamId as string,
      limit ? parseInt(limit as string) : undefined
    );
    res.status(200).json(successResponse(notifications, "Notifications fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch notifications"));
  }
};

export const unreadCountController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const count = await getNotificationUnreadCount(userId, teamId as string);
    res.status(200).json(successResponse({ count }, "Unread count fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch count"));
  }
};

export const markReadController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { notificationId } = req.params;
    await markNotificationRead(notificationId as string, userId);
    res.status(200).json(successResponse(null, "Marked as read"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to mark as read"));
  }
};

export const markAllReadController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    await markAllNotificationsRead(userId, teamId as string);
    res.status(200).json(successResponse(null, "All marked as read"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to mark all as read"));
  }
};

export const deleteNotificationController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { notificationId } = req.params;
    await removeNotification(notificationId as string, userId);
    res.status(200).json(successResponse(null, "Notification deleted"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to delete notification"));
  }
};
