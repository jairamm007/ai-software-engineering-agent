import {
  createTeam,
  getTeamById,
  getTeamBySlug,
  getUserTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getTeamMember,
  updateMemberRole,
  createInvitation,
  getInvitation,
  getInvitationById,
  getInvitationsByEmail,
  getTeamInvitations,
  updateInvitationStatus,
  shareRepository,
  removeSharedRepository,
  getSharedRepositories,
  getTeamsForRepository,
  getTeamByCode,
  findUserByCode,
  findUserById,
  findUserByEmail,
  searchTeamsByCode,
  createDocument,
  getTeamDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getTeamCodeReviews,
  linkCodeReviewToTeam,
  getTeamTestReports,
  linkTestReportToTeam,
  searchUsers as searchUsersRepo,
} from "../repository/team.repository.js";
import { createActivity } from "../repository/activity.repository.js";

function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function canManageRole(actorRole: TeamRole, targetRole: TeamRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

export function hasPermission(role: TeamRole, action: "manage" | "invite" | "comment" | "view"): boolean {
  switch (action) {
    case "manage":
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
    case "invite":
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.member;
    case "comment":
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.member;
    case "view":
      return true;
  }
}

export const createNewTeam = async (
  name: string,
  ownerId: string,
  description?: string
) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existing = await getTeamBySlug(slug);
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  let teamCode = generateShortCode();
  let codeExists = await getTeamByCode(teamCode);
  while (codeExists) {
    teamCode = generateShortCode();
    codeExists = await getTeamByCode(teamCode);
  }

  const team = await createTeam(name, finalSlug, description, ownerId, teamCode);

  await createActivity(team.id, ownerId, "team_created", `Team "${name}" created`);

  return team;
};

export const getTeamDetails = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) return null;

  return getTeamById(teamId);
};

export const listUserTeams = async (userId: string) => {
  return getUserTeams(userId);
};

export const updateTeamDetails = async (
  teamId: string,
  userId: string,
  data: { name?: string; description?: string }
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to update team");
  }

  const updated = await updateTeam(teamId, data);
  await createActivity(teamId, userId, "team_updated", `Team details updated`);

  return updated;
};

export const deleteTeamById = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || member.role !== "owner") {
    throw new Error("Only the team owner can delete the team");
  }

  await deleteTeam(teamId);
  return true;
};

export const inviteMember = async (
  teamId: string,
  inviterId: string,
  email: string,
  role: TeamRole = "member"
) => {
  const inviter = await getTeamMember(teamId, inviterId);
  if (!inviter || !hasPermission(inviter.role as TeamRole, "invite")) {
    throw new Error("Insufficient permissions to invite members");
  }

  const existingMember = await getTeamMember(teamId, email);
  if (existingMember) {
    throw new Error("User is already a team member");
  }

  const existingInvitation = await getInvitation(teamId, email);
  if (existingInvitation && existingInvitation.status === "pending") {
    throw new Error("Invitation already pending for this email");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await createInvitation(teamId, email, role, inviterId, expiresAt);

  await createActivity(teamId, inviterId, "invite_sent", `Invitation sent to ${email} as ${role}`);

  return invitation;
};

export const acceptInvitation = async (
  teamId: string,
  userId: string,
  email: string
) => {
  const invitation = await getInvitation(teamId, email);
  if (!invitation || invitation.status !== "pending") {
    throw new Error("No pending invitation found");
  }

  if (new Date() > invitation.expiresAt) {
    await updateInvitationStatus(invitation.id, "expired");
    throw new Error("Invitation has expired");
  }

  await updateInvitationStatus(invitation.id, "accepted");
  const member = await addTeamMember(teamId, userId, invitation.role);

  await createActivity(teamId, userId, "member_joined", `New member joined the team`);

  return member;
};

export const removeMember = async (
  teamId: string,
  actorId: string,
  targetUserId: string
) => {
  const actor = await getTeamMember(teamId, actorId);
  if (!actor || !hasPermission(actor.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to remove members");
  }

  const target = await getTeamMember(teamId, targetUserId);
  if (!target) {
    throw new Error("User is not a team member");
  }

  if (target.role === "owner") {
    throw new Error("Cannot remove the team owner");
  }

  if (!canManageRole(actor.role as TeamRole, target.role as TeamRole)) {
    throw new Error("Cannot remove a member with equal or higher role");
  }

  await removeTeamMember(teamId, targetUserId);
  await createActivity(teamId, actorId, "member_removed", `Member removed from the team`);

  return true;
};

export const changeMemberRole = async (
  teamId: string,
  actorId: string,
  targetUserId: string,
  newRole: TeamRole
) => {
  const actor = await getTeamMember(teamId, actorId);
  if (!actor || !hasPermission(actor.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to change roles");
  }

  const target = await getTeamMember(teamId, targetUserId);
  if (!target) {
    throw new Error("User is not a team member");
  }

  if (target.role === "owner") {
    throw new Error("Cannot change the owner's role");
  }

  if (!canManageRole(actor.role as TeamRole, target.role as TeamRole)) {
    throw new Error("Cannot change role of a member with equal or higher role");
  }

  const updated = await updateMemberRole(teamId, targetUserId, newRole);
  await createActivity(teamId, actorId, "role_changed", `Role changed to ${newRole}`);

  return updated;
};

export const shareTeamRepository = async (
  teamId: string,
  userId: string,
  repositoryId: string,
  permission: "read" | "write" | "admin" = "read"
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to share repositories");
  }

  const shared = await shareRepository(teamId, repositoryId, userId, permission);
  await createActivity(teamId, userId, "repo_shared", `Repository shared with team`);

  return shared;
};

export const unshareTeamRepository = async (
  teamId: string,
  userId: string,
  repositoryId: string
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to unshare repositories");
  }

  await removeSharedRepository(teamId, repositoryId);
  await createActivity(teamId, userId, "repo_removed", `Repository removed from team`);

  return true;
};

export const getTeamSharedRepos = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return getSharedRepositories(teamId);
};

export const getTeamsForRepo = async (repositoryId: string, userId: string) => {
  return getTeamsForRepository(repositoryId);
};

export const getTeamInvitationsList = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to view invitations");
  }

  return getTeamInvitations(teamId);
};

export const cancelInvitation = async (
  teamId: string,
  userId: string,
  invitationId: string
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to cancel invitations");
  }

  await updateInvitationStatus(invitationId, "rejected");
  return true;
};

// ─── Code-based search & invite ────────────────────────────

export const searchTeamByCode = async (query: string) => {
  return searchTeamsByCode(query);
};

export const findTeamByCode = async (teamCode: string) => {
  return getTeamByCode(teamCode);
};

export const findUserByUserCode = async (userCode: string) => {
  return findUserByCode(userCode);
};

export const inviteByUserCode = async (
  teamId: string,
  inviterId: string,
  userCode: string,
  role: TeamRole = "member"
) => {
  const inviter = await getTeamMember(teamId, inviterId);
  if (!inviter || !hasPermission(inviter.role as TeamRole, "invite")) {
    throw new Error("Insufficient permissions to invite members");
  }

  const targetUser = await findUserByCode(userCode);
  if (!targetUser) {
    throw new Error("User not found with this user code");
  }

  const existingMember = await getTeamMember(teamId, targetUser.id);
  if (existingMember) {
    throw new Error("User is already a team member");
  }

  const invitationExists = await getInvitation(teamId, targetUser.email);
  if (invitationExists && invitationExists.status === "pending") {
    throw new Error("Invitation already pending for this user");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await createInvitation(teamId, targetUser.email, role, inviterId, expiresAt);

  await createActivity(teamId, inviterId, "invite_sent", `Invitation sent to ${targetUser.name} via code`);

  return { invitation, user: targetUser };
};

export const joinTeamByCode = async (teamCode: string, userId: string) => {
  const team = await getTeamByCode(teamCode);
  if (!team) {
    throw new Error("Team not found with this code");
  }

  const existingMember = await getTeamMember(team.id, userId);
  if (existingMember) {
    throw new Error("You are already a member of this team");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const existingInvitation = await getInvitation(team.id, user.email);
  if (existingInvitation && existingInvitation.status === "pending") {
    throw new Error("Join request already pending for this team");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await createInvitation(team.id, user.email, "member", userId, expiresAt);

  await createActivity(team.id, userId, "join_requested", `Join request sent to team`);

  return { team, invitation };
};

export const getUserPendingInvitations = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  return getInvitationsByEmail(user.email);
};

export const acceptInvitationById = async (invitationId: string, userId: string) => {
  const invitation = await getInvitationById(invitationId);
  if (!invitation || invitation.status !== "pending") {
    throw new Error("No pending invitation found");
  }

  const user = await findUserById(userId);
  if (!user || user.email !== invitation.email) {
    throw new Error("This invitation was not sent to you");
  }

  if (new Date() > invitation.expiresAt) {
    await updateInvitationStatus(invitation.id, "expired");
    throw new Error("Invitation has expired");
  }

  await updateInvitationStatus(invitation.id, "accepted");
  const member = await addTeamMember(invitation.teamId, userId, invitation.role);

  await createActivity(invitation.teamId, userId, "member_joined", `Accepted invitation and joined the team`);

  return member;
};

export const rejectInvitationById = async (invitationId: string, userId: string) => {
  const invitation = await getInvitationById(invitationId);
  if (!invitation || invitation.status !== "pending") {
    throw new Error("No pending invitation found");
  }

  const user = await findUserById(userId);
  if (!user || user.email !== invitation.email) {
    throw new Error("This invitation was not sent to you");
  }

  await updateInvitationStatus(invitation.id, "rejected");

  await createActivity(invitation.teamId, userId, "invitation_rejected", `Declined invitation to join the team`);

  return true;
};

export const acceptJoinRequest = async (invitationId: string, teamId: string, acceptorId: string) => {
  const invitation = await getInvitationById(invitationId);
  if (!invitation || invitation.status !== "pending") {
    throw new Error("No pending join request found");
  }

  const member = await getTeamMember(teamId, acceptorId);
  if (!member || !hasPermission(member.role as TeamRole, "invite")) {
    throw new Error("Insufficient permissions to accept join requests");
  }

  if (new Date() > invitation.expiresAt) {
    await updateInvitationStatus(invitation.id, "expired");
    throw new Error("Join request has expired");
  }

  const targetUser = await findUserByEmail(invitation.email);
  if (!targetUser) throw new Error("User not found");

  await updateInvitationStatus(invitation.id, "accepted");
  const newMember = await addTeamMember(teamId, targetUser.id, invitation.role);

  await createActivity(teamId, acceptorId, "member_added", `Accepted join request from ${invitation.email}`);

  return newMember;
};

// ─── Shared Documents ─────────────────────────────────────

export const createTeamDocument = async (
  teamId: string,
  authorId: string,
  title: string,
  content?: string
) => {
  const member = await getTeamMember(teamId, authorId);
  if (!member || !hasPermission(member.role as TeamRole, "comment")) {
    throw new Error("Insufficient permissions to create documents");
  }

  const doc = await createDocument(teamId, authorId, title, content);
  await createActivity(teamId, authorId, "document_created", `Document "${title}" created`);
  return doc;
};

export const listTeamDocuments = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  return getTeamDocuments(teamId);
};

export const getTeamDocument = async (documentId: string, userId: string) => {
  const doc = await getDocumentById(documentId);
  if (!doc) throw new Error("Document not found");

  const member = await getTeamMember(doc.teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  return doc;
};

export const editTeamDocument = async (
  documentId: string,
  userId: string,
  data: { title?: string; content?: string; status?: string }
) => {
  const doc = await getDocumentById(documentId);
  if (!doc) throw new Error("Document not found");

  const member = await getTeamMember(doc.teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "comment")) {
    throw new Error("Insufficient permissions to edit documents");
  }

  return updateDocument(documentId, data);
};

export const removeTeamDocument = async (documentId: string, userId: string) => {
  const doc = await getDocumentById(documentId);
  if (!doc) throw new Error("Document not found");

  const member = await getTeamMember(doc.teamId, userId);
  if (!member || (doc.authorId !== userId && !hasPermission(member.role as TeamRole, "manage"))) {
    throw new Error("Insufficient permissions to delete this document");
  }

  await deleteDocument(documentId);
  return true;
};

// ─── Team Code Reviews ────────────────────────────────────

export const listTeamCodeReviews = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  return getTeamCodeReviews(teamId);
};

export const attachCodeReviewToTeam = async (
  reviewId: string,
  teamId: string,
  userId: string
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions");
  }

  return linkCodeReviewToTeam(reviewId, teamId);
};

// ─── Team Test Reports ────────────────────────────────────

export const listTeamTestReports = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  return getTeamTestReports(teamId);
};

export const attachTestReportToTeam = async (
  reportId: string,
  teamId: string,
  userId: string
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions");
  }

  return linkTestReportToTeam(reportId, teamId);
};

export const searchUsers = async (query: string) => {
  return searchUsersRepo(query);
};
