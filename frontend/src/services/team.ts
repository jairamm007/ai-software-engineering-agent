import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  Team,
  TeamMember,
  TeamInvitation,
  TeamRepository,
  SharedDocument,
  TeamCodeReview,
  TeamTestReport,
  SearchedUser,
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

// ─── Code-based search & invite ───────────────────────────

export const searchTeamsByCode = async (q: string): Promise<Team[]> => {
  const response = await api.get<ApiResponse<Team[]>>(`/teams/search/code?q=${encodeURIComponent(q)}`);
  return response.data.data;
};

export const lookupTeamByCode = async (code: string): Promise<Team> => {
  const response = await api.get<ApiResponse<Team>>(`/teams/lookup/code/${code}`);
  return response.data.data;
};

export const searchUsers = async (q: string): Promise<SearchedUser[]> => {
  const response = await api.get<ApiResponse<SearchedUser[]>>(`/users/search?q=${encodeURIComponent(q)}`);
  return response.data.data;
};

export const lookupUserByCode = async (code: string): Promise<{ id: string; name: string; email: string; image?: string | null; userCode: string }> => {
  const response = await api.get<ApiResponse<any>>(`/users/lookup/code/${code}`);
  return response.data.data;
};

export const inviteByUserCode = async (
  teamId: string,
  userCode: string,
  role?: string
): Promise<any> => {
  const response = await api.post<ApiResponse<any>>(`/teams/${teamId}/invite-code`, { userCode, role });
  return response.data.data;
};

export const joinTeamByCode = async (code: string): Promise<{ team: Team; invitation: TeamInvitation }> => {
  const response = await api.post<ApiResponse<{ team: Team; invitation: TeamInvitation }>>(`/teams/join-code`, { code });
  return response.data.data;
};

export const getPendingInvitations = async (): Promise<(TeamInvitation & { team: { id: string; name: string; teamCode: string } })[]> => {
  const response = await api.get<ApiResponse<(TeamInvitation & { team: { id: string; name: string; teamCode: string } })[]>>(`/invitations/pending`);
  return response.data.data;
};

export const acceptInvitationById = async (invitationId: string): Promise<TeamMember> => {
  const response = await api.post<ApiResponse<TeamMember>>(`/invitations/${invitationId}/accept`);
  return response.data.data;
};

export const rejectInvitationById = async (invitationId: string): Promise<void> => {
  await api.post(`/invitations/${invitationId}/reject`);
};

export const acceptJoinRequest = async (teamId: string, invitationId: string): Promise<TeamMember> => {
  const response = await api.post<ApiResponse<TeamMember>>(`/teams/${teamId}/invitations/${invitationId}/accept`);
  return response.data.data;
};

// ─── Shared Documents ─────────────────────────────────────

export const getTeamDocuments = async (teamId: string): Promise<SharedDocument[]> => {
  const response = await api.get<ApiResponse<SharedDocument[]>>(`/teams/${teamId}/documents`);
  return response.data.data;
};

export const createTeamDocument = async (teamId: string, title: string, content?: string): Promise<SharedDocument> => {
  const response = await api.post<ApiResponse<SharedDocument>>(`/teams/${teamId}/documents`, { title, content });
  return response.data.data;
};

export const getTeamDocument = async (teamId: string, documentId: string): Promise<SharedDocument> => {
  const response = await api.get<ApiResponse<SharedDocument>>(`/teams/${teamId}/documents/${documentId}`);
  return response.data.data;
};

export const updateTeamDocument = async (teamId: string, documentId: string, data: { title?: string; content?: string; status?: string }): Promise<SharedDocument> => {
  const response = await api.put<ApiResponse<SharedDocument>>(`/teams/${teamId}/documents/${documentId}`, data);
  return response.data.data;
};

export const deleteTeamDocument = async (teamId: string, documentId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}/documents/${documentId}`);
};

// ─── Team Code Reviews ────────────────────────────────────

export const getTeamCodeReviews = async (teamId: string): Promise<TeamCodeReview[]> => {
  const response = await api.get<ApiResponse<TeamCodeReview[]>>(`/teams/${teamId}/code-reviews`);
  return response.data.data;
};

export const attachCodeReviewToTeam = async (teamId: string, reviewId: string): Promise<TeamCodeReview> => {
  const response = await api.post<ApiResponse<TeamCodeReview>>(`/teams/${teamId}/code-reviews/${reviewId}`);
  return response.data.data;
};

// ─── Team Test Reports ────────────────────────────────────

export const getTeamTestReports = async (teamId: string): Promise<TeamTestReport[]> => {
  const response = await api.get<ApiResponse<TeamTestReport[]>>(`/teams/${teamId}/test-reports`);
  return response.data.data;
};

export const attachTestReportToTeam = async (teamId: string, reportId: string): Promise<TeamTestReport> => {
  const response = await api.post<ApiResponse<TeamTestReport>>(`/teams/${teamId}/test-reports/${reportId}`);
  return response.data.data;
};
