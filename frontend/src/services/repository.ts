import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";
import type { Repository, RepositoryListItem } from "@/types/repository";

export const getRepositories = async (params?: { search?: string; sortBy?: string }): Promise<RepositoryListItem[]> => {
  const response =
    await api.get<ApiResponse<RepositoryListItem[]>>(
      "/repository",
      { params }
    );

  return response.data.data;
};

export const getRepository = async (
  id: string
): Promise<Repository> => {
  const response =
    await api.get<ApiResponse<Repository>>(
      `/repository/${id}`
    );

  return response.data.data;
};

export const analyzeRepository = async (
  url: string
) => {
  const response =
    await api.post(
      "/repository/analyze",
      {
        url,
      }
    );

  return response.data.data;
};

export const deleteRepository = async (
  id: string
) => {
  await api.delete(
    `/repository/${id}`
  );
};

export const reindexRepository = async (
  id: string
) => {
  const response =
    await api.post(
      `/repository/${id}/reindex`
    );

  return response.data.data;
};

export const toggleFavorite = async (id: string): Promise<{ isFavorite: boolean }> => {
  const response = await api.patch<{ success: boolean; data: { isFavorite: boolean } }>(`/repository/${id}/favorite`);
  return response.data.data;
};