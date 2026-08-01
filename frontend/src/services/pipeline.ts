import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { RunFull, RunSummary } from "@/types/pipeline";

export const listRuns = async (params?: { limit?: number }): Promise<RunSummary[]> => {
  const response = await api.get<ApiResponse<RunSummary[]>>("/runs", { params });
  return response.data.data;
};

export const createRun = async (payload: {
  repoUrl: string;
  branch?: string;
}): Promise<RunSummary> => {
  const response = await api.post<ApiResponse<RunSummary>>("/runs", payload);
  return response.data.data;
};

export const getRunFull = async (id: string): Promise<RunFull> => {
  const response = await api.get<ApiResponse<RunFull>>(`/runs/${id}/full`);
  return response.data.data;
};
