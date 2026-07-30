import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface TeamAnalyticsData {
  stats: {
    members: number;
    repositories: number;
    chats: number;
    messages: number;
    comments: number;
    activities: number;
    documentation: number;
    codeReviews: number;
    testReports: number;
    recentActivityCount: number;
  };
  memberRoles: { role: string; count: number }[];
  activityByType: { action: string; count: number }[];
  recentActivities: {
    id: string;
    action: string;
    details?: string | null;
    createdAt: string;
    user: { id: string; name: string; image?: string | null };
  }[];
  recentChats: {
    id: string;
    title?: string | null;
    updatedAt: string;
  }[];
}

export const getTeamAnalytics = async (teamId: string): Promise<TeamAnalyticsData> => {
  const response = await api.get<ApiResponse<TeamAnalyticsData>>(`/teams/${teamId}/analytics`);
  return response.data.data;
};
