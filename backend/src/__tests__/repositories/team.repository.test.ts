import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    team: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teamMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
    teamInvitation: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    teamRepository: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    teamActivity: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import {
  createTeam,
  getTeamById,
  getUserTeams,
  addTeamMember,
  removeTeamMember,
  getTeamMember,
  updateMemberRole,
  createInvitation,
  updateInvitationStatus,
  shareRepository,
  getSharedRepositories,
} from "../../repository/team.repository.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

describe("Team Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a team with owner member", async () => {
    mockPrisma.team.create.mockResolvedValue({
      id: "team-1",
      name: "Test Team",
      slug: "test-team",
      members: [{ userId: "user-1", role: "owner" }],
    } as any);

    const result = await createTeam("Test Team", "test-team", undefined, "user-1");

    expect(mockPrisma.team.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Test Team",
          slug: "test-team",
        }),
      })
    );
    expect(result.id).toBe("team-1");
  });

  it("should get team by ID", async () => {
    mockPrisma.team.findUnique.mockResolvedValue({
      id: "team-1",
      name: "Test Team",
    } as any);

    const result = await getTeamById("team-1");
    expect(result).toBeDefined();
    expect(mockPrisma.team.findUnique).toHaveBeenCalled();
  });

  it("should get user teams", async () => {
    mockPrisma.team.findMany.mockResolvedValue([
      { id: "team-1", name: "Team A" },
      { id: "team-2", name: "Team B" },
    ] as any);

    const result = await getUserTeams("user-1");
    expect(result).toHaveLength(2);
  });

  it("should add team member", async () => {
    mockPrisma.teamMember.create.mockResolvedValue({
      id: "member-1",
      teamId: "team-1",
      userId: "user-2",
      role: "member",
    } as any);

    const result = await addTeamMember("team-1", "user-2", "member");
    expect(result.role).toBe("member");
  });

  it("should remove team member", async () => {
    mockPrisma.teamMember.deleteMany.mockResolvedValue({ count: 1 } as any);

    const result = await removeTeamMember("team-1", "user-2");
    expect(result.count).toBe(1);
  });

  it("should get team member", async () => {
    mockPrisma.teamMember.findUnique.mockResolvedValue({
      teamId: "team-1",
      userId: "user-1",
      role: "admin",
    } as any);

    const result = await getTeamMember("team-1", "user-1");
    expect(result).toBeDefined();
    expect(result?.role).toBe("admin");
  });

  it("should update member role", async () => {
    mockPrisma.teamMember.update.mockResolvedValue({
      teamId: "team-1",
      userId: "user-2",
      role: "admin",
    } as any);

    const result = await updateMemberRole("team-1", "user-2", "admin");
    expect(result.role).toBe("admin");
  });

  it("should create invitation", async () => {
    const expiresAt = new Date();
    mockPrisma.teamInvitation.create.mockResolvedValue({
      id: "inv-1",
      teamId: "team-1",
      email: "test@example.com",
      role: "member",
      expiresAt,
    } as any);

    const result = await createInvitation("team-1", "test@example.com", "member", "user-1", expiresAt);
    expect(result.email).toBe("test@example.com");
  });

  it("should update invitation status", async () => {
    mockPrisma.teamInvitation.update.mockResolvedValue({
      id: "inv-1",
      status: "accepted",
    } as any);

    const result = await updateInvitationStatus("inv-1", "accepted");
    expect(result.status).toBe("accepted");
  });

  it("should share repository", async () => {
    mockPrisma.teamRepository.upsert.mockResolvedValue({
      id: "share-1",
      teamId: "team-1",
      repositoryId: "repo-1",
      permission: "read",
    } as any);

    const result = await shareRepository("team-1", "repo-1", "user-1", "read");
    expect(result.permission).toBe("read");
  });

  it("should get shared repositories", async () => {
    mockPrisma.teamRepository.findMany.mockResolvedValue([
      { id: "share-1", repository: { name: "Repo A" } },
    ] as any);

    const result = await getSharedRepositories("team-1");
    expect(result).toHaveLength(1);
  });
});
