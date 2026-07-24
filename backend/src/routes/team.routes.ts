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
} from "../controllers/team.controller.js";

import {
  shareTeamRepositoryController,
  unshareTeamRepositoryController,
  listSharedReposController,
} from "../controllers/team-share.controller.js";

const router = Router();

router.get("/teams", requireAuth, listTeamsController);
router.post("/teams", requireAuth, createTeamController);

router.get("/teams/:teamId", requireAuth, getTeamController);
router.put("/teams/:teamId", requireAuth, requireTeamRole("admin"), updateTeamController);
router.delete("/teams/:teamId", requireAuth, requireTeamRole("owner"), deleteTeamController);

router.post("/teams/:teamId/invite", requireAuth, requireTeamRole("member"), inviteMemberController);
router.post("/teams/:teamId/accept", requireAuth, acceptInvitationController);
router.get("/teams/:teamId/invitations", requireAuth, requireTeamRole("admin"), listInvitationsController);
router.delete("/teams/:teamId/invitations/:invitationId", requireAuth, requireTeamRole("admin"), cancelInvitationController);

router.delete("/teams/:teamId/members/:memberId", requireAuth, requireTeamRole("admin"), removeMemberController);
router.put("/teams/:teamId/members/:memberId/role", requireAuth, requireTeamRole("admin"), changeRoleController);

router.post("/teams/:teamId/repositories", requireAuth, requireTeamRole("admin"), shareTeamRepositoryController);
router.delete("/teams/:teamId/repositories/:repositoryId", requireAuth, requireTeamRole("admin"), unshareTeamRepositoryController);
router.get("/teams/:teamId/repositories", requireAuth, listSharedReposController);

export default router;
