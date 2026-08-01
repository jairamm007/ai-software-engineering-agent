import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    account: {
      findFirst: vi.fn(),
    },
    gitHubIntegration: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    gitHubIntegrationRepository: {
      create: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import {
  getGitHubOAuthToken,
  createIntegration,
  getIntegrationById,
  getIntegrationByUserAndUrl,
  getUserIntegrations,
  updateIntegration,
  deleteIntegration,
  createIntegrationRepo,
  getIntegrationRepos,
  getIntegrationRepo,
  deleteIntegrationRepos,
} from "../../repository/github-integration.repository.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

describe("GitHub Integration Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get GitHub OAuth token for user", async () => {
    mockPrisma.account.findFirst.mockResolvedValue({
      accessToken: "gho_oauth_token",
    } as any);

    const result = await getGitHubOAuthToken("user-1");

    expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", providerId: "github" },
      select: { accessToken: true },
    });
    expect(result).toBe("gho_oauth_token");
  });

  it("should return null if no GitHub account linked", async () => {
    mockPrisma.account.findFirst.mockResolvedValue(null);

    const result = await getGitHubOAuthToken("user-1");
    expect(result).toBeNull();
  });

  it("should create an integration", async () => {
    mockPrisma.gitHubIntegration.create.mockResolvedValue({
      id: "int-1",
      userId: "user-1",
      githubUrl: "https://github.com",
      token: "ghp_xxx",
      isActive: true,
    } as any);

    const result = await createIntegration("user-1", "https://github.com", "ghp_xxx");

    expect(mockPrisma.gitHubIntegration.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        githubUrl: "https://github.com",
        token: expect.stringMatching(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/),
      },
    });
    expect(result.id).toBe("int-1");
  });

  it("should get integration by id with repos", async () => {
    mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
      id: "int-1",
      userId: "user-1",
      token: "ghp_xxx",
      repos: [{ id: "repo-1", name: "my-app" }],
    } as any);

    const result = await getIntegrationById("int-1");

    expect(mockPrisma.gitHubIntegration.findUnique).toHaveBeenCalledWith({
      where: { id: "int-1" },
      include: { repos: { orderBy: { updatedAt: "desc" } } },
    });
    expect(result?.repos).toHaveLength(1);
  });

  it("should get integration by user and url", async () => {
    mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
      id: "int-1",
      userId: "user-1",
      token: "ghp_xxx",
    } as any);

    const result = await getIntegrationByUserAndUrl("user-1", "https://github.com");

    expect(mockPrisma.gitHubIntegration.findUnique).toHaveBeenCalledWith({
      where: { userId_githubUrl: { userId: "user-1", githubUrl: "https://github.com" } },
    });
    expect(result?.id).toBe("int-1");
  });

  it("should get all user integrations", async () => {
    mockPrisma.gitHubIntegration.findMany.mockResolvedValue([
      { id: "int-1", token: "ghp_xxx", _count: { repos: 5 } },
      { id: "int-2", token: "ghp_xxx", _count: { repos: 2 } },
    ] as any);

    const result = await getUserIntegrations("user-1");

    expect(mockPrisma.gitHubIntegration.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { _count: { select: { repos: true } } },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toHaveLength(2);
  });

  it("should update integration", async () => {
    mockPrisma.gitHubIntegration.update.mockResolvedValue({
      id: "int-1",
      isActive: false,
    } as any);

    const result = await updateIntegration("int-1", { isActive: false });

    expect(mockPrisma.gitHubIntegration.update).toHaveBeenCalledWith({
      where: { id: "int-1" },
      data: { isActive: false },
    });
    expect(result.isActive).toBe(false);
  });

  it("should delete integration", async () => {
    mockPrisma.gitHubIntegration.delete.mockResolvedValue({ id: "int-1" } as any);

    const result = await deleteIntegration("int-1");

    expect(mockPrisma.gitHubIntegration.delete).toHaveBeenCalledWith({ where: { id: "int-1" } });
    expect(result.id).toBe("int-1");
  });

  it("should upsert integration repo", async () => {
    mockPrisma.gitHubIntegrationRepository.upsert.mockResolvedValue({
      id: "repo-1",
      integrationId: "int-1",
      owner: "octocat",
      name: "hello-world",
    } as any);

    const result = await createIntegrationRepo("int-1", {
      owner: "octocat",
      name: "hello-world",
      fullName: "octocat/hello-world",
      defaultBranch: "main",
      isPrivate: false,
      starsCount: 10,
      forksCount: 3,
      openIssuesCount: 1,
    });

    expect(mockPrisma.gitHubIntegrationRepository.upsert).toHaveBeenCalled();
    expect(result.owner).toBe("octocat");
  });

  it("should get integration repos", async () => {
    mockPrisma.gitHubIntegrationRepository.findMany.mockResolvedValue([
      { id: "repo-1", name: "app" },
      { id: "repo-2", name: "lib" },
    ] as any);

    const result = await getIntegrationRepos("int-1");

    expect(mockPrisma.gitHubIntegrationRepository.findMany).toHaveBeenCalledWith({
      where: { integrationId: "int-1" },
      orderBy: { updatedAt: "desc" },
    });
    expect(result).toHaveLength(2);
  });

  it("should get integration repo by owner and name", async () => {
    mockPrisma.gitHubIntegrationRepository.findUnique.mockResolvedValue({
      id: "repo-1",
      owner: "octocat",
      name: "hello-world",
    } as any);

    const result = await getIntegrationRepo("int-1", "octocat", "hello-world");

    expect(mockPrisma.gitHubIntegrationRepository.findUnique).toHaveBeenCalledWith({
      where: { integrationId_owner_name: { integrationId: "int-1", owner: "octocat", name: "hello-world" } },
    });
    expect(result?.name).toBe("hello-world");
  });

  it("should delete integration repos", async () => {
    mockPrisma.gitHubIntegrationRepository.deleteMany.mockResolvedValue({ count: 3 } as any);

    const result = await deleteIntegrationRepos("int-1");

    expect(mockPrisma.gitHubIntegrationRepository.deleteMany).toHaveBeenCalledWith({
      where: { integrationId: "int-1" },
    });
    expect(result.count).toBe(3);
  });
});
