import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";
import type { Repository } from "@/types/repository";

export const getRepositories = async (): Promise<Repository[]> => {
  const response =
    await api.get<ApiResponse<Repository[]>>(
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