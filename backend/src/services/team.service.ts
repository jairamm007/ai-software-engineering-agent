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
  getTeamInvitations,
  updateInvitationStatus,
  shareRepository,
  removeSharedRepository,
  getSharedRepositories,
  getTeamsForRepository,
} from "../repository/team.repository.js";
import { createActivity } from "../repository/activity.repository.js";

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

  const team = await createTeam(name, finalSlug, description, ownerId);

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
