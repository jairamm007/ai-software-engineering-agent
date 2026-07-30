import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../repository/team-notification.repository.js";
import { getTeamMember } from "../repository/team.repository.js";

export const listNotifications = async (
  userId: string,
  teamId?: string,
  limit?: number
) => {
  return getUserNotifications(userId, teamId, limit);
};

export const getNotificationUnreadCount = async (userId: string, teamId?: string) => {
  return getUnreadCount(userId, teamId);
};

export const markNotificationRead = async (notificationId: string, userId: string) => {
  return markAsRead(notificationId);
};

export const markAllNotificationsRead = async (userId: string, teamId?: string) => {
  return markAllAsRead(userId, teamId);
};

export const removeNotification = async (notificationId: string, userId: string) => {
  return deleteNotification(notificationId);
};
