import { getTeamMember } from "../repository/team.repository.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response, NextFunction } from "express";
import type { TeamRole } from "../services/team.service.js";
import { ROLE_HIERARCHY } from "../services/team.service.js";

export function requireTeamRole(minRole: TeamRole) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const teamId = (req.params as any).teamId || req.body?.teamId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!teamId) {
      res.status(400).json({ success: false, message: "Team ID is required" });
      return;
    }

    const member = await getTeamMember(teamId, userId);
    if (!member) {
      res.status(403).json({ success: false, message: "You are not a member of this team" });
      return;
    }

    const memberLevel = ROLE_HIERARCHY[member.role as TeamRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (memberLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        message: `Requires ${minRole} role or higher (you have ${member.role})`,
      });
      return;
    }

    (req as any).teamRole = member.role;
    next();
  };
}

export async function attachTeamRole(req: AuthRequest, _res: Response, next: NextFunction) {
  const userId = req.userId;
  const teamId = (req.params as any).teamId || req.body?.teamId;

  if (userId && teamId) {
    const member = await getTeamMember(teamId, userId);
    if (member) {
      (req as any).teamRole = member.role;
    }
  }

  next();
}
