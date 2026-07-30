import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface TeamNotification {
  id: string;
  teamId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  linkTo?: string | null;
  createdAt: string;
}

export const getTeamNotifications = async (
  teamId: string,
  limit?: number
): Promise<TeamNotification[]> => {
  const params = limit ? `?limit=${limit}` : "";
  const response = await api.get<ApiResponse<TeamNotification[]>>(
    `/teams/${teamId}/notifications${params}`
  );
  return response.data.data;
};

export const getUnreadCount = async (teamId: string): Promise<{ count: number }> => {
  const response = await api.get<ApiResponse<{ count: number }>>(
    `/teams/${teamId}/notifications/unread-count`
  );
  return response.data.data;
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (teamId: string): Promise<void> => {
  await api.patch(`/teams/${teamId}/notifications/read-all`);
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};
