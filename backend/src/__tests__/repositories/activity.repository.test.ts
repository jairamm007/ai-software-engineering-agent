import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    teamActivity: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import {
  createActivity,
  getTeamActivities,
  getRecentActivityCount,
} from "../../repository/activity.repository.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

describe("Activity Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an activity", async () => {
    mockPrisma.teamActivity.create.mockResolvedValue({
      id: "activity-1",
      teamId: "team-1",
      userId: "user-1",
      action: "member_joined",
      details: "New member joined",
    } as any);

    const result = await createActivity("team-1", "user-1", "member_joined", "New member joined");
    expect(result.action).toBe("member_joined");
  });

  it("should get team activities", async () => {
    mockPrisma.teamActivity.findMany.mockResolvedValue([
      { id: "activity-1", action: "invite_sent" },
      { id: "activity-2", action: "member_joined" },
    ] as any);

    const result = await getTeamActivities("team-1");
    expect(result).toHaveLength(2);
  });

  it("should filter activities by action", async () => {
    mockPrisma.teamActivity.findMany.mockResolvedValue([
      { id: "activity-1", action: "invite_sent" },
    ] as any);

    await getTeamActivities("team-1", { action: "invite_sent" });

    expect(mockPrisma.teamActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ action: "invite_sent" }),
      })
    );
  });

  it("should respect limit and offset", async () => {
    mockPrisma.teamActivity.findMany.mockResolvedValue([] as any);

    await getTeamActivities("team-1", { limit: 10, offset: 20 });

    expect(mockPrisma.teamActivity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 20,
      })
    );
  });

  it("should get recent activity count", async () => {
    mockPrisma.teamActivity.count.mockResolvedValue(15 as any);

    const since = new Date("2024-01-01");
    const result = await getRecentActivityCount("team-1", since);
    expect(result).toBe(15);
  });
});
