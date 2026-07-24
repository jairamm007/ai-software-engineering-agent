import {
  createActivity as createActivityRepo,
  getTeamActivities,
  getRecentActivityCount,
} from "../repository/activity.repository.js";
import { getTeamMember } from "../repository/team.repository.js";

export const recordActivity = async (
  teamId: string,
  userId: string,
  action: string,
  details?: string
) => {
  return createActivityRepo(teamId, userId, action, details);
};

export const getActivities = async (
  teamId: string,
  userId: string,
  options?: { limit?: number; offset?: number; action?: string }
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return getTeamActivities(teamId, options);
};

export const getRecentCount = async (teamId: string, userId: string, days: number = 7) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  return getRecentActivityCount(teamId, since);
};
