import { prisma } from "../database/prisma.js";
import { getTeamMember } from "../repository/team.repository.js";

export const getTeamAnalytics = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  const [
    memberCount,
    repoCount,
    chatCount,
    messageCount,
    commentCount,
    activityCount,
    sharedDocCount,
    codeReviewCount,
    testReportCount,
    recentActivities,
    recentChats,
  ] = await Promise.all([
    prisma.teamMember.count({ where: { teamId } }),
    prisma.teamRepository.count({ where: { teamId } }),
    prisma.teamChat.count({ where: { teamId } }),
    prisma.teamMessage.count({
      where: { chat: { teamId } },
    }),
    prisma.comment.count({ where: { teamId } }),
    prisma.teamActivity.count({ where: { teamId } }),
    prisma.sharedDocument.count({ where: { teamId } }),
    prisma.codeReview.count({
      where: {
        OR: [
          { teamId },
          { repository: { teamShares: { some: { teamId } } } },
        ],
      },
    }),
    prisma.testReport.count({
      where: {
        OR: [
          { teamId },
          { repository: { teamShares: { some: { teamId } } } },
        ],
      },
    }),
    prisma.teamActivity.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.teamChat.findMany({
      where: { teamId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const memberRoles = await prisma.teamMember.groupBy({
    by: ["role"],
    where: { teamId },
    _count: true,
  });

  const activityByType = await prisma.teamActivity.groupBy({
    by: ["action"],
    where: { teamId },
    _count: true,
    orderBy: { _count: { action: "desc" } },
  });

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentActivityCount = await prisma.teamActivity.count({
    where: { teamId, createdAt: { gte: last7Days } },
  });

  return {
    stats: {
      members: memberCount,
      repositories: repoCount,
      chats: chatCount,
      messages: messageCount,
      comments: commentCount,
      activities: activityCount,
      documents: sharedDocCount,
      codeReviews: codeReviewCount,
      testReports: testReportCount,
      recentActivityCount,
    },
    memberRoles: memberRoles.map((r) => ({ role: r.role, count: r._count })),
    activityByType: activityByType.map((a) => ({ action: a.action, count: a._count })),
    recentActivities,
    recentChats,
  };
};
