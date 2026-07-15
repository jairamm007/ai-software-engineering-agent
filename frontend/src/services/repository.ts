import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";
import type { Repository, RepositoryListItem } from "@/types/repository";

export const getRepositories = async (): Promise<RepositoryListItem[]> => {
  const response =
    await api.get<ApiResponse<RepositoryListItem[]>>(
      "/repository"
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