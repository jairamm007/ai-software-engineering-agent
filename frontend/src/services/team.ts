import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  Team,
  TeamMember,
  TeamInvitation,
  TeamRepository,
} from "@/types/team";

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get<ApiResponse<Team[]>>("/teams");
  return response.data.data;
};

export const createTeam = async (
  name: string,
  description?: string
): Promise<Team> => {
  const response = await api.post<ApiResponse<Team>>("/teams", {
    name,
    description,
  });
  return response.data.data;
};

export const getTeam = async (teamId: string): Promise<Team> => {
  const response = await api.get<ApiResponse<Team>>(`/teams/${teamId}`);
  return response.data.data;
};

export const updateTeam = async (
  teamId: string,
  data: { name?: string; description?: string }
): Promise<Team> => {
  const response = await api.put<ApiResponse<Team>>(`/teams/${teamId}`, data);
  return response.data.data;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}`);
};

export const inviteMember = async (
  teamId: string,
  email: string,
  role?: string
): Promise<TeamInvitation> => {
  const response = await api.post<ApiResponse<TeamInvitation>>(
    `/teams/${teamId}/invite`,
    { email, role }
  );
  return response.data.data;
};

export const acceptInvitation = async (
  teamId: string,
  email: string
): Promise<TeamMember> => {
  const response = await api.post<ApiResponse<TeamMember>>(
    `/teams/${teamId}/accept`,
    { email }
  );
  return response.data.data;
};

export const removeMember = async (
  teamId: string,
  memberId: string
): Promise<void> => {
  await api.delete(`/teams/${teamId}/members/${memberId}`);
};

export const changeMemberRole = async (
  teamId: string,
  memberId: string,
  role: string
): Promise<TeamMember> => {
  const response = await api.put<ApiResponse<TeamMember>>(
    `/teams/${teamId}/members/${memberId}/role`,
    { role }
  );
  return response.data.data;
};

export const getInvitations = async (
  teamId: string
): Promise<TeamInvitation[]> => {
  const response = await api.get<ApiResponse<TeamInvitation[]>>(
    `/teams/${teamId}/invitations`
  );
  return response.data.data;
};

export const cancelInvitation = async (
  teamId: string,
  invitationId: string
): Promise<void> => {
  await api.delete(`/teams/${teamId}/invitations/${invitationId}`);
};

export const shareRepository = async (
  teamId: string,
  repositoryId: string,
  permission?: string
): Promise<TeamRepository> => {
  const response = await api.post<ApiResponse<TeamRepository>>(
    `/teams/${teamId}/repositories`,
    { repositoryId, permission }
  );
  return response.data.data;
};

export const unshareRepository = async (
  teamId: string,
  repositoryId: string
): Promise<void> => {
  await api.delete(`/teams/${teamId}/repositories/${repositoryId}`);
};

export const getSharedRepositories = async (
  teamId: string
): Promise<TeamRepository[]> => {
  const response = await api.get<ApiResponse<TeamRepository[]>>(
    `/teams/${teamId}/repositories`
  );
  return response.data.data;
};
