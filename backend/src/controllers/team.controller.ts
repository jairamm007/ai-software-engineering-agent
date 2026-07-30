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
  searchTeamByCode,
  findTeamByCode,
  findUserByUserCode,
  inviteByUserCode,
  joinTeamByCode,
  getUserPendingInvitations,
  acceptInvitationById,
  rejectInvitationById,
  acceptJoinRequest,
  createTeamDocument,
  listTeamDocuments,
  getTeamDocument,
  editTeamDocument,
  removeTeamDocument,
  listTeamCodeReviews,
  attachCodeReviewToTeam,
  listTeamTestReports,
  attachTestReportToTeam,
  searchUsers,
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

// ─── Code-based search & invite ───────────────────────────

export const searchTeamController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { q } = req.query;
    if (!q) { res.status(400).json(errorResponse("Search query is required")); return; }

    const teams = await searchTeamByCode(q as string);
    res.status(200).json(successResponse(teams, "Search results"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Search failed"));
  }
};

export const searchUsersController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { q } = req.query;
    if (!q) { res.status(400).json(errorResponse("Search query is required")); return; }

    const users = await searchUsers(q as string);
    res.status(200).json(successResponse(users, "Search results"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Search failed"));
  }
};

export const lookupTeamByCodeController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { code } = req.params;
    const team = await findTeamByCode(code.toUpperCase());
    if (!team) { res.status(404).json(errorResponse("Team not found with this code")); return; }
    res.status(200).json(successResponse(team, "Team found"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Lookup failed"));
  }
};

export const lookupUserByCodeController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { code } = req.params;
    const user = await findUserByUserCode(code.toUpperCase());
    if (!user) { res.status(404).json(errorResponse("User not found with this code")); return; }
    res.status(200).json(successResponse(user, "User found"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Lookup failed"));
  }
};

export const inviteByUserCodeController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { userCode, role } = req.body;
    if (!userCode) { res.status(400).json(errorResponse("User code is required")); return; }

    const result = await inviteByUserCode(teamId, userId, userCode.toUpperCase(), role);
    res.status(201).json(successResponse(result, "Invitation sent via user code"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send invitation";
    const status = msg.includes("permissions") ? 403 : msg.includes("already") ? 409 : msg.includes("not found") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const joinTeamByCodeController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { code } = req.body;
    if (!code) { res.status(400).json(errorResponse("Team code is required")); return; }

    const result = await joinTeamByCode(code.toUpperCase(), userId);
    res.status(200).json(successResponse(result, "Join request sent to team"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to join team";
    const status = msg.includes("not found") ? 404 : msg.includes("already") ? 409 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

// ─── Invitation accept/reject ────────────────────────────

export const getPendingInvitationsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const invitations = await getUserPendingInvitations(userId);
    res.status(200).json(successResponse(invitations, "Pending invitations fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch invitations"));
  }
};

export const acceptInvitationByIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { invitationId } = req.params;
    const member = await acceptInvitationById(invitationId, userId);
    res.status(200).json(successResponse(member, "Invitation accepted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to accept invitation";
    const status = msg.includes("expired") ? 410 : msg.includes("No pending") ? 404 : msg.includes("not sent to you") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const rejectInvitationByIdController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { invitationId } = req.params;
    await rejectInvitationById(invitationId, userId);
    res.status(200).json(successResponse(null, "Invitation declined"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to decline invitation";
    const status = msg.includes("No pending") ? 404 : msg.includes("not sent to you") ? 403 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

export const acceptJoinRequestController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, invitationId } = req.params;
    const member = await acceptJoinRequest(invitationId, teamId, userId);
    res.status(200).json(successResponse(member, "Join request accepted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to accept join request";
    const status = msg.includes("permissions") ? 403 : msg.includes("expired") ? 410 : msg.includes("No pending") ? 404 : 500;
    res.status(status).json(errorResponse(msg));
  }
};

// ─── Shared Documents ─────────────────────────────────────

export const createDocumentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const { title, content } = req.body;
    if (!title) { res.status(400).json(errorResponse("Title is required")); return; }

    const doc = await createTeamDocument(teamId, userId, title, content);
    res.status(201).json(successResponse(doc, "Document created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create document";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

export const listDocumentsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const docs = await listTeamDocuments(teamId, userId);
    res.status(200).json(successResponse(docs, "Documents fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch documents";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const getDocumentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { documentId } = req.params;
    const doc = await getTeamDocument(documentId, userId);
    if (!doc) { res.status(404).json(errorResponse("Document not found")); return; }
    res.status(200).json(successResponse(doc, "Document fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch document";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const updateDocumentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { documentId } = req.params;
    const { title, content, status } = req.body;
    const doc = await editTeamDocument(documentId, userId, { title, content, status });
    res.status(200).json(successResponse(doc, "Document updated"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update document";
    res.status(msg.includes("permissions") ? 403 : msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

export const deleteDocumentController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { documentId } = req.params;
    await removeTeamDocument(documentId, userId);
    res.status(200).json(successResponse(null, "Document deleted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete document";
    res.status(msg.includes("permissions") ? 403 : msg.includes("not found") ? 404 : 500).json(errorResponse(msg));
  }
};

// ─── Team Code Reviews ────────────────────────────────────

export const listCodeReviewsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const reviews = await listTeamCodeReviews(teamId, userId);
    res.status(200).json(successResponse(reviews, "Code reviews fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch code reviews";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const attachCodeReviewController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, reviewId } = req.params;
    const review = await attachCodeReviewToTeam(reviewId, teamId, userId);
    res.status(200).json(successResponse(review, "Code review attached to team"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to attach code review";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};

// ─── Team Test Reports ────────────────────────────────────

export const listTestReportsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId } = req.params;
    const reports = await listTeamTestReports(teamId, userId);
    res.status(200).json(successResponse(reports, "Test reports fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch test reports";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const attachTestReportController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const { teamId, reportId } = req.params;
    const report = await attachTestReportToTeam(reportId, teamId, userId);
    res.status(200).json(successResponse(report, "Test report attached to team"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to attach test report";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};
