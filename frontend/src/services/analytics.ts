import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";

export interface RepositoryAnalytics {
  totalFiles: number;
  totalChunks: number;
  totalFolders: number;
  totalSize: number;
  averageChunksPerFile: number;
  averageFileSize: number;
  largestFile: { path: string; size: number } | null;
  smallestFile: { path: string; size: number } | null;
  languages: { name: string; percentage: number }[];
  indexedPercentage: number;
  vectorEmbeddings: number;
  healthScore: number;
}

export const getRepositoryAnalytics = async (
  id: string
): Promise<RepositoryAnalytics> => {
  const response = await api.get<ApiResponse<RepositoryAnalytics>>(
    `/repository/${id}/analytics`
  );

  return response.data.data;
};
