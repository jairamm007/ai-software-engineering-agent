import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { InsightReport, ProjectInsights } from "@/types/insights";

export const getInsights = async (repositoryId: string): Promise<ProjectInsights> => {
  const response = await api.get<ApiResponse<ProjectInsights>>(`/insights/${repositoryId}`);
  return response.data.data;
};

export const refreshInsights = async (repositoryId: string): Promise<ProjectInsights> => {
  const response = await api.post<ApiResponse<ProjectInsights>>(`/insights/${repositoryId}/refresh`);
  return response.data.data;
};

export const getInsightSummary = async (repositoryId: string) => {
  const response = await api.get<ApiResponse<{ repositoryId: string; updatedAt: string; summary: ProjectInsights["summary"] }>>(
    `/insights/${repositoryId}/summary`
  );
  return response.data.data;
};

export const getInsightArchitecture = async (repositoryId: string) => {
  const response = await api.get<ApiResponse<{ repositoryId: string; updatedAt: string; architecture: ProjectInsights["architecture"] }>>(
    `/insights/${repositoryId}/architecture`
  );
  return response.data.data;
};

export const getInsightRecommendations = async (repositoryId: string) => {
  const response = await api.get<ApiResponse<{ repositoryId: string; updatedAt: string; recommendations: ProjectInsights["recommendations"] }>>(
    `/insights/${repositoryId}/recommendations`
  );
  return response.data.data;
};

export const exportInsights = async (
  repositoryId: string,
  format: "markdown" | "pdf"
): Promise<InsightReport> => {
  const response = await api.post<ApiResponse<InsightReport>>(`/insights/${repositoryId}/export`, { format });
  return response.data.data;
};

export const downloadInsightReport = async (reportId: string): Promise<void> => {
  const response = await api.get<Blob>(`/insights/reports/${reportId}/download`, {
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);
  const filename = filenameMatch?.[1] ?? `insights-${reportId}.pdf`;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
