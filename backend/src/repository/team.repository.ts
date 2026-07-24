import { prisma } from "../database/prisma.js";

export const createTeam = async (
  name: string,
  slug: string,
  description: string | undefined,
  ownerId: string
) => {
  return prisma.team.create({
    data: {
      name,
      slug,
      description,
      ownerId,
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
