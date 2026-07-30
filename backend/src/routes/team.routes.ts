import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireTeamRole } from "../middleware/team.middleware.js";
import {
  createTeamController,
  getTeamController,
  listTeamsController,
  updateTeamController,
  deleteTeamController,
  inviteMemberController,
  acceptInvitationController,
  removeMemberController,
  changeRoleController,
  listInvitationsController,
  cancelInvitationController,
  searchTeamController,
  lookupTeamByCodeController,
  lookupUserByCodeController,
  inviteByUserCodeController,
  joinTeamByCodeController,
  getPendingInvitationsController,
  acceptInvitationByIdController,
  rejectInvitationByIdController,
  acceptJoinRequestController,
  createDocumentController,
  listDocumentsController,
  getDocumentController,
  updateDocumentController,
  deleteDocumentController,
  listCodeReviewsController,
  attachCodeReviewController,
  listTestReportsController,
  attachTestReportController,
  searchUsersController,
} from "../controllers/team.controller.js";

import {
  shareTeamRepositoryController,
  unshareTeamRepositoryController,
  listSharedReposController,
} from "../controllers/team-share.controller.js";

const router = Router();

// Team CRUD
router.get("/teams", requireAuth, listTeamsController);
router.post("/teams", requireAuth, createTeamController);

router.get("/teams/:teamId", requireAuth, getTeamController);
router.put("/teams/:teamId", requireAuth, requireTeamRole("admin"), updateTeamController);
router.delete("/teams/:teamId", requireAuth, requireTeamRole("owner"), deleteTeamController);

// Search by code
router.get("/teams/search/code", requireAuth, searchTeamController);
router.get("/teams/lookup/code/:code", requireAuth, lookupTeamByCodeController);
router.post("/teams/join-code", requireAuth, joinTeamByCodeController);

// User lookup & search
router.get("/users/lookup/code/:code", requireAuth, lookupUserByCodeController);
router.get("/users/search", requireAuth, searchUsersController);

// Invitations
router.post("/teams/:teamId/invite", requireAuth, requireTeamRole("member"), inviteMemberController);
router.post("/teams/:teamId/invite-code", requireAuth, requireTeamRole("member"), inviteByUserCodeController);
router.post("/teams/:teamId/accept", requireAuth, acceptInvitationController);
router.get("/teams/:teamId/invitations", requireAuth, requireTeamRole("admin"), listInvitationsController);
router.post("/teams/:teamId/invitations/:invitationId/accept", requireAuth, requireTeamRole("member"), acceptJoinRequestController);
router.delete("/teams/:teamId/invitations/:invitationId", requireAuth, requireTeamRole("admin"), cancelInvitationController);

// User invitation management (accept/reject by invitation ID)
router.get("/invitations/pending", requireAuth, getPendingInvitationsController);
router.post("/invitations/:invitationId/accept", requireAuth, acceptInvitationByIdController);
router.post("/invitations/:invitationId/reject", requireAuth, rejectInvitationByIdController);

// Members
router.delete("/teams/:teamId/members/:memberId", requireAuth, requireTeamRole("admin"), removeMemberController);
router.put("/teams/:teamId/members/:memberId/role", requireAuth, requireTeamRole("admin"), changeRoleController);

// Repositories
router.post("/teams/:teamId/repositories", requireAuth, requireTeamRole("admin"), shareTeamRepositoryController);
router.delete("/teams/:teamId/repositories/:repositoryId", requireAuth, requireTeamRole("admin"), unshareTeamRepositoryController);
router.get("/teams/:teamId/repositories", requireAuth, listSharedReposController);

// Shared Documents
router.get("/teams/:teamId/documents", requireAuth, listDocumentsController);
router.post("/teams/:teamId/documents", requireAuth, createDocumentController);
router.get("/teams/:teamId/documents/:documentId", requireAuth, getDocumentController);
router.put("/teams/:teamId/documents/:documentId", requireAuth, updateDocumentController);
router.delete("/teams/:teamId/documents/:documentId", requireAuth, deleteDocumentController);

// Team Code Reviews
router.get("/teams/:teamId/code-reviews", requireAuth, listCodeReviewsController);
router.post("/teams/:teamId/code-reviews/:reviewId", requireAuth, requireTeamRole("admin"), attachCodeReviewController);

// Team Test Reports
router.get("/teams/:teamId/test-reports", requireAuth, listTestReportsController);
router.post("/teams/:teamId/test-reports/:reportId", requireAuth, requireTeamRole("admin"), attachTestReportController);

export default router;
