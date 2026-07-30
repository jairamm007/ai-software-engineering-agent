import { prisma } from "../database/prisma.js";

export const createTeam = async (
  name: string,
  slug: string,
  description: string | undefined,
  ownerId: string,
  teamCode?: string
) => {
  return prisma.team.create({
    data: {
      name,
      slug,
      description,
      ownerId,
      teamCode,
      members: {
        create: { userId: ownerId, role: "owner" },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
    },
  });
};

export const getTeamById = async (teamId: string) => {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      repositories: {
        include: { repository: { select: { id: true, name: true, githubUrl: true, createdAt: true } } },
      },
    },
  });
};

export const getTeamBySlug = async (slug: string) => {
  return prisma.team.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
    },
  });
};

export const getUserTeams = async (userId: string) => {
  return prisma.team.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      _count: { select: { members: true, repositories: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const updateTeam = async (
  teamId: string,
  data: { name?: string; description?: string }
) => {
  return prisma.team.update({
    where: { id: teamId },
    data,
  });
};

export const deleteTeam = async (teamId: string) => {
  return prisma.team.delete({ where: { id: teamId } });
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: string
) => {
  return prisma.teamMember.create({
    data: { teamId, userId, role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  return prisma.teamMember.deleteMany({
    where: { teamId, userId },
  });
};

export const getTeamMember = async (teamId: string, userId: string) => {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
};

export const updateMemberRole = async (
  teamId: string,
  userId: string,
  role: string
) => {
  return prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role },
  });
};

export const createInvitation = async (
  teamId: string,
  email: string,
  role: string,
  invitedBy: string,
  expiresAt: Date
) => {
  return prisma.teamInvitation.create({
    data: { teamId, email, role, invitedBy, expiresAt },
  });
};

export const getInvitation = async (teamId: string, email: string) => {
  return prisma.teamInvitation.findUnique({
    where: { teamId_email: { teamId, email } },
  });
};

export const getInvitationById = async (id: string) => {
  return prisma.teamInvitation.findUnique({
    where: { id },
    include: { team: { select: { id: true, name: true, teamCode: true } } },
  });
};

export const getInvitationsByEmail = async (email: string) => {
  return prisma.teamInvitation.findMany({
    where: { email, status: "pending" },
    include: { team: { select: { id: true, name: true, teamCode: true, owner: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getTeamInvitations = async (teamId: string) => {
  return prisma.teamInvitation.findMany({
    where: { teamId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
};

export const updateInvitationStatus = async (
  id: string,
  status: string
) => {
  return prisma.teamInvitation.update({
    where: { id },
    data: { status },
  });
};

export const shareRepository = async (
  teamId: string,
  repositoryId: string,
  sharedBy: string,
  permission: string
) => {
  return prisma.teamRepository.upsert({
    where: { teamId_repositoryId: { teamId, repositoryId } },
    update: { permission, sharedBy },
    create: { teamId, repositoryId, sharedBy, permission },
  });
};

export const removeSharedRepository = async (
  teamId: string,
  repositoryId: string
) => {
  return prisma.teamRepository.deleteMany({
    where: { teamId, repositoryId },
  });
};

export const getSharedRepositories = async (teamId: string) => {
  return prisma.teamRepository.findMany({
    where: { teamId },
    include: {
      repository: {
        select: { id: true, name: true, githubUrl: true, localPath: true, createdAt: true },
      },
    },
    orderBy: { sharedAt: "desc" },
  });
};

export const getTeamsForRepository = async (repositoryId: string) => {
  return prisma.teamRepository.findMany({
    where: { repositoryId },
    include: {
      team: { select: { id: true, name: true, slug: true } },
    },
  });
};

export const getTeamByCode = async (teamCode: string) => {
  return prisma.team.findUnique({
    where: { teamCode },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { members: true, repositories: true } },
    },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
};

export const findUserByCode = async (userCode: string) => {
  return prisma.user.findUnique({
    where: { userCode },
    select: { id: true, name: true, email: true, image: true, userCode: true },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, image: true, userCode: true },
  });
};

export const searchTeamsByCode = async (query: string) => {
  return prisma.team.findMany({
    where: {
      OR: [
        { teamCode: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      teamCode: true,
      description: true,
      visibility: true,
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { members: true, repositories: true } },
    },
    take: 10,
  });
};

// ─── Shared Documents ─────────────────────────────────────────

export const createDocument = async (
  teamId: string,
  authorId: string,
  title: string,
  content?: string
) => {
  return prisma.sharedDocument.create({
    data: { teamId, authorId, title, content },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
};

export const getTeamDocuments = async (teamId: string) => {
  return prisma.sharedDocument.findMany({
    where: { teamId },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const getDocumentById = async (id: string) => {
  return prisma.sharedDocument.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
};

export const updateDocument = async (
  id: string,
  data: { title?: string; content?: string; status?: string }
) => {
  return prisma.sharedDocument.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
};

export const deleteDocument = async (id: string) => {
  return prisma.sharedDocument.delete({ where: { id } });
};

// ─── Team Code Reviews ────────────────────────────────────────

export const getTeamCodeReviews = async (teamId: string) => {
  return prisma.codeReview.findMany({
    where: { teamId },
    include: {
      repository: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const linkCodeReviewToTeam = async (reviewId: string, teamId: string) => {
  return prisma.codeReview.update({
    where: { id: reviewId },
    data: { teamId },
  });
};

// ─── Team Test Reports ───────────────────────────────────────

export const getTeamTestReports = async (teamId: string) => {
  return prisma.testReport.findMany({
    where: { teamId },
    include: {
      repository: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const linkTestReportToTeam = async (reportId: string, teamId: string) => {
  return prisma.testReport.update({
    where: { id: reportId },
    data: { teamId },
  });
};

export const searchUsers = async (query: string) => {
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { userCode: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      userCode: true,
    },
    take: 10,
  });
};
