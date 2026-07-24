import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { TeamActivity } from "@/types/team";

export const getActivities = async (
  teamId: string,
  options?: { limit?: number; offset?: number; action?: string }
): Promise<TeamActivity[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.action) params.set("action", options.action);

  const query = params.toString();
  const response = await api.get<ApiResponse<TeamActivity[]>>(
    `/teams/${teamId}/activities${query ? `?${query}` : ""}`
  );
  return response.data.data;
};

export const getRecentActivityCount = async (
  teamId: string,
  days?: number
): Promise<{ count: number }> => {
  const params = days ? `?days=${days}` : "";
  const response = await api.get<ApiResponse<{ count: number }>>(
    `/teams/${teamId}/activities/count${params}`
  );
  return response.data.data;
};
