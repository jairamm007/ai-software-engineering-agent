import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface TeamChat {
  id: string;
  teamId: string;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMessage {
  id: string;
  chatId: string;
  userId: string;
  role: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export const getTeamChats = async (teamId: string): Promise<TeamChat[]> => {
  const response = await api.get<ApiResponse<TeamChat[]>>(`/teams/${teamId}/chats`);
  return response.data.data;
};

export const createTeamChat = async (teamId: string, title?: string): Promise<TeamChat> => {
  const response = await api.post<ApiResponse<TeamChat>>(`/teams/${teamId}/chats`, { title });
  return response.data.data;
};

export const getTeamChat = async (teamId: string, chatId: string): Promise<TeamChat & { messages: TeamMessage[] }> => {
  const response = await api.get<ApiResponse<TeamChat & { messages: TeamMessage[] }>>(
    `/teams/${teamId}/chats/${chatId}`
  );
  return response.data.data;
};

export const sendTeamMessage = async (
  teamId: string,
  chatId: string,
  content: string,
  repositoryId?: string
): Promise<{ userMessage: TeamMessage; assistantMessage: TeamMessage }> => {
  const response = await api.post<ApiResponse<{ userMessage: TeamMessage; assistantMessage: TeamMessage }>>(
    `/teams/${teamId}/chats/${chatId}/messages`,
    { content, repositoryId }
  );
  return response.data.data;
};

export const deleteTeamChat = async (teamId: string, chatId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}/chats/${chatId}`);
};
