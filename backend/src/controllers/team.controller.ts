import {
  createNewTeam,
  getTeamDetails,
  listUserTeams,
  updateTeamDetails,
  deleteTeamById,
  inviteMember,
  acceptInvitation,
  removeMember,
  changeMemberRole,
  getTeamInvitationsList,
  cancelInvitation,
} from "../services/team.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const createTeamController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { name, description } = req.body;
    if (!name) { res.status(400).json(errorResponse("Team name is required")); return; }

    const team = await createNewTeam(name, userId, description);
    res.status(201).json(successResponse(team, "Team created"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to create team"));
  }
};

export const getTeamController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const team = await getTeamDetails(teamId, userId);
    if (!team) { res.status(404).json(errorResponse("Team not found or access denied")); return; }

    res.status(200).json(successResponse(team, "Team fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch team"));
  }
};

export const listTeamsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const teams = await listUserTeams(userId);
    res.status(200).json(successResponse(teams, "Teams fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch teams"));
  }
};

export const updateTeamController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    const team = await updateTeamDetails(teamId, userId, { name, description });
    res.status(200).json(successResponse(team, "Team updated"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update team";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const deleteTeamController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    await deleteTeamById(teamId, userId);
    res.status(200).json(successResponse(null, "Team deleted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete team";
    res.status(msg.includes("owner") ? 403 : 500).json(errorResponse(msg));
  }
};

export const inviteMemberController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { email, role } = req.body;
    if (!email) { res.status(400).json(errorResponse("Email is required")); return; }

    const invitation = await inviteMember(teamId, userId, email, role);
    res.status(201).json(successResponse(invitation, "Invitation sent"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send invitation";
    const status = msg.includes("permissions") ? 403 : msg.includes("already") ? 409 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const acceptInvitationController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { email } = req.body;
    if (!email) { res.status(400).json(errorResponse("Email is required")); return; }

    const member = await acceptInvitation(teamId, userId, email);
    res.status(200).json(successResponse(member, "Invitation accepted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to accept invitation";
    const status = msg.includes("expired") ? 410 : msg.includes("No pending") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const removeMemberController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, memberId } = req.params;
    await removeMember(teamId, userId, memberId);
    res.status(200).json(successResponse(null, "Member removed"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to remove member";
    const status = msg.includes("permissions") ? 403 : msg.includes("owner") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const changeRoleController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    if (!role) { res.status(400).json(errorResponse("Role is required")); return; }

    const member = await changeMemberRole(teamId, userId, memberId, role);
    res.status(200).json(successResponse(member, "Role updated"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to change role";
    const status = msg.includes("permissions") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const listInvitationsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const invitations = await getTeamInvitationsList(teamId, userId);
    res.status(200).json(successResponse(invitations, "Invitations fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch invitations";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const cancelInvitationController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, invitationId } = req.params;
    await cancelInvitation(teamId, userId, invitationId);
    res.status(200).json(successResponse(null, "Invitation cancelled"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to cancel invitation";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};
