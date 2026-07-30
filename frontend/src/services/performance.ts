import api from "@/lib/axios";
import type { PerformanceScan, PerformanceIssue, PerformanceReport, PerformanceHistoryResponse } from "@/types/performance";

export const runPerformanceAnalysis = async (data?: {
  repositoryId?: string;
}): Promise<PerformanceScan & {
  complexityIssues: number;
  duplicateIssues: number;
  largeFileIssues: number;
  totalIssues: number;
  avgComplexity: number;
  maxComplexity: number;
}> => {
  const res = await api.post("/performance/scan", data || {});
  return res.data.data;
};

export const getPerformanceReport = async (id: string, format?: string): Promise<PerformanceReport> => {
  const res = await api.get(`/performance/report/${id}`, { params: { format } });
  return res.data.data;
};

export const getPerformanceHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PerformanceHistoryResponse> => {
  const res = await api.get("/performance/history", { params });
  return res.data.data;
};

export const getPerformanceIssues = async (repositoryId: string): Promise<PerformanceIssue[]> => {
  const res = await api.get(`/performance/issues/${repositoryId}`);
  return res.data.data;
};
