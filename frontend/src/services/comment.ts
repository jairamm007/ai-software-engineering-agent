import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Comment } from "@/types/team";

export const getComments = async (
  teamId: string,
  options?: { repositoryId?: string; limit?: number; offset?: number }
): Promise<Comment[]> => {
  const params = new URLSearchParams();
  if (options?.repositoryId) params.set("repositoryId", options.repositoryId);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  const query = params.toString();
  const response = await api.get<ApiResponse<Comment[]>>(
    `/teams/${teamId}/comments${query ? `?${query}` : ""}`
  );
  return response.data.data;
};

export const createComment = async (
  teamId: string,
  content: string,
  repositoryId?: string,
  parentCommentId?: string
): Promise<Comment> => {
  const response = await api.post<ApiResponse<Comment>>(
    `/teams/${teamId}/comments`,
    { content, repositoryId, parentCommentId }
  );
  return response.data.data;
};

export const getComment = async (
  teamId: string,
  commentId: string
): Promise<Comment> => {
  const response = await api.get<ApiResponse<Comment>>(
    `/teams/${teamId}/comments/${commentId}`
  );
  return response.data.data;
};

export const updateComment = async (
  teamId: string,
  commentId: string,
  content: string
): Promise<Comment> => {
  const response = await api.put<ApiResponse<Comment>>(
    `/teams/${teamId}/comments/${commentId}`,
    { content }
  );
  return response.data.data;
};

export const deleteComment = async (
  teamId: string,
  commentId: string
): Promise<void> => {
  await api.delete(`/teams/${teamId}/comments/${commentId}`);
};

export const resolveComment = async (
  teamId: string,
  commentId: string,
  resolved: boolean
): Promise<Comment> => {
  const response = await api.patch<ApiResponse<Comment>>(
    `/teams/${teamId}/comments/${commentId}/resolve`,
    { resolved }
  );
  return response.data.data;
};

export const getMentions = async (teamId: string): Promise<Comment[]> => {
  const response = await api.get<ApiResponse<Comment[]>>(
    `/teams/${teamId}/comments/mentions`
  );
  return response.data.data;
};

export const getUnresolvedCount = async (
  teamId: string
): Promise<{ count: number }> => {
  const response = await api.get<ApiResponse<{ count: number }>>(
    `/teams/${teamId}/comments/unresolved-count`
  );
  return response.data.data;
};
