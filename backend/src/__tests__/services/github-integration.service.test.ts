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

vi.mock("octokit", () => {
  const dataFn = () => vi.fn().mockResolvedValue({ data: [] });
  const mockOctokit = {
    rest: {
      users: { getAuthenticated: dataFn() },
      repos: {
        listForAuthenticatedUser: dataFn(),
        listForOrg: dataFn(),
        get: dataFn(),
        listBranches: dataFn(),
        listCommits: dataFn(),
        listContributors: dataFn(),
        listLanguages: dataFn(),
        listTags: dataFn(),
        listReleases: dataFn(),
        listDeployments: dataFn(),
        listDeploymentStatuses: dataFn(),
        getCommit: dataFn(),
        getReadme: dataFn(),
        compareCommitsWithBasehead: dataFn(),
        getBranchProtection: dataFn(),
        updateBranchProtection: dataFn(),
      },
      pulls: {
        list: dataFn(),
        get: dataFn(),
        listFiles: dataFn(),
        listReviews: dataFn(),
        listReviewComments: dataFn(),
        listCommits: dataFn(),
        create: dataFn(),
        createReview: dataFn(),
        merge: dataFn(),
      },
      issues: {
        listForRepo: dataFn(),
        get: dataFn(),
        listComments: dataFn(),
        listLabelsForRepo: dataFn(),
        listMilestones: dataFn(),
        create: dataFn(),
        createComment: dataFn(),
      },
      checks: { listForRef: dataFn() },
      actions: {
        listRepoWorkflows: dataFn(),
        listWorkflowRuns: dataFn(),
        listWorkflowRunsForRepo: dataFn(),
        getWorkflowRun: dataFn(),
        listJobsForWorkflowRun: dataFn(),
      },
      orgs: { listForAuthenticatedUser: dataFn() },
      licenses: { getForRepo: dataFn() },
    },
  };
  return {
    Octokit: class {
      constructor() {
        return mockOctokit;
      }
    },
    __mockOctokit: mockOctokit,
  };
});

vi.mock("../../services/repository-index.service.js", () => ({
  indexGitHubRepository: vi.fn(),
}));

import {
  connectGitHub,
  autoConnectGitHub,
  disconnectGitHub,
  listIntegrations,
  getIntegration,
  listUserRepositories,
  importRepository,
  listBranches,
  listCommits,
  listPullRequests,
  getPullRequest,
  listIssues,
  getIssue,
  syncRepository,
  analyzeRepository,
} from "../../services/github-integration.service.js";
import { indexGitHubRepository } from "../../services/repository-index.service.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

async function getMockOctokit() {
  const mod = await import("octokit");
  return (mod as any).__mockOctokit;
}

describe("GitHub Integration Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("autoConnectGitHub", () => {
    it("should auto-connect using OAuth token", async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        accessToken: "gho_oauth_token",
      } as any);
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue(null);
      mockPrisma.gitHubIntegration.create.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "gho_oauth_token",
      } as any);

      const result = await autoConnectGitHub("user-1");
      expect(result.method).toBe("oauth");
      expect(result.integration.id).toBe("int-1");
    });

    it("should reactivate existing integration on auto-connect", async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        accessToken: "gho_oauth_token",
      } as any);
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-existing",
        token: "ghp_xxx",
        isActive: false,
      } as any);
      mockPrisma.gitHubIntegration.update.mockResolvedValue({
        id: "int-existing",
        isActive: true,
      } as any);

      const result = await autoConnectGitHub("user-1");
      expect(result.integration.isActive).toBe(true);
      expect(mockPrisma.gitHubIntegration.update).toHaveBeenCalled();
    });

    it("should throw if GitHub account not linked", async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(autoConnectGitHub("user-1")).rejects.toThrow("GitHub account not linked");
    });
  });

  describe("connectGitHub", () => {
    it("should create new integration", async () => {
      const mockOcto = await getMockOctokit();
      mockOcto.rest.users.getAuthenticated.mockResolvedValue({
        headers: { "x-oauth-scopes": "repo, workflow" },
        data: { login: "octocat", id: 1 },
      });
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue(null);
      mockPrisma.gitHubIntegration.create.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);

      const result = await connectGitHub("user-1", "ghp_xxx");

      expect(result.integration.id).toBe("int-1");
      expect(result.githubUser.login).toBe("octocat");
    });

    it("should reactivate existing integration", async () => {
      const mockOcto = await getMockOctokit();
      mockOcto.rest.users.getAuthenticated.mockResolvedValue({
        headers: { "x-oauth-scopes": "repo, workflow" },
        data: { login: "octocat", id: 1 },
      });
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-existing",
        token: "ghp_xxx",
        isActive: false,
      } as any);
      mockPrisma.gitHubIntegration.update.mockResolvedValue({
        id: "int-existing",
        isActive: true,
      } as any);

      const result = await connectGitHub("user-1", "ghp_xxx");

      expect(result.integration.isActive).toBe(true);
      expect(mockPrisma.gitHubIntegration.update).toHaveBeenCalled();
    });
  });

  describe("disconnectGitHub", () => {
    it("should delete integration", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockPrisma.gitHubIntegration.delete.mockResolvedValue({} as any);

      const result = await disconnectGitHub("user-1", "int-1");
      expect(result).toBe(true);
    });

    it("should throw if integration not found", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue(null);

      await expect(disconnectGitHub("user-1", "int-1")).rejects.toThrow("Integration not found");
    });

    it("should throw if not owner", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-2",
        token: "ghp_xxx",
      } as any);

      await expect(disconnectGitHub("user-1", "int-1")).rejects.toThrow("Integration not found");
    });
  });

  describe("listIntegrations", () => {
    it("should return user integrations", async () => {
      mockPrisma.gitHubIntegration.findMany.mockResolvedValue([
        { id: "int-1", token: "ghp_xxx", _count: { repos: 5 } },
      ] as any);

      const result = await listIntegrations("user-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getIntegration", () => {
    it("should return integration if owned by user", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
        repos: [],
      } as any);

      const result = await getIntegration("user-1", "int-1");
      expect(result.id).toBe("int-1");
    });

    it("should throw if not found", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue(null);
      await expect(getIntegration("user-1", "int-1")).rejects.toThrow("Integration not found");
    });
  });

  describe("listUserRepositories", () => {
    it("should list repos from GitHub API", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.repos.listForAuthenticatedUser.mockResolvedValue({
        data: [
          {
            id: 1,
            owner: { login: "octocat" },
            name: "hello-world",
            full_name: "octocat/hello-world",
            description: "A test repo",
            default_branch: "main",
            private: false,
            language: "TypeScript",
            stargazers_count: 10,
            forks_count: 3,
            open_issues_count: 1,
            html_url: "https://github.com/octocat/hello-world",
            updated_at: "2025-01-01T00:00:00Z",
          },
        ],
      });

      const result = await listUserRepositories("user-1", "int-1");
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe("octocat/hello-world");
    });
  });

  describe("importRepository", () => {
    it("should import a repository", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.repos.get.mockResolvedValue({
        data: {
          owner: { login: "octocat" },
          name: "hello-world",
          full_name: "octocat/hello-world",
          description: "A test repo",
          default_branch: "main",
          private: false,
          language: "TypeScript",
          stargazers_count: 10,
          forks_count: 3,
          open_issues_count: 1,
        },
      });
      mockPrisma.gitHubIntegrationRepository.upsert.mockResolvedValue({
        id: "repo-1",
        name: "hello-world",
      } as any);
      mockPrisma.gitHubIntegration.update.mockResolvedValue({} as any);
      vi.mocked(indexGitHubRepository).mockResolvedValue({
        repository: null,
        indexResult: null,
        fileTree: null,
      } as any);

      const result = await importRepository("user-1", "int-1", "octocat", "hello-world");
      expect(result.integrationRepo.name).toBe("hello-world");
    });
  });

  describe("listBranches", () => {
    it("should list branches for a repo", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.repos.get.mockResolvedValue({
        data: { default_branch: "main" },
      });
      mockOcto.rest.repos.listBranches.mockResolvedValue({
        data: [
          { name: "main", commit: { sha: "abc123" }, protected: false },
          { name: "dev", commit: { sha: "def456" }, protected: false },
        ],
      });

      const result = await listBranches("user-1", "int-1", "octocat", "hello-world");
      expect(result).toHaveLength(2);
      expect(result[0].isDefault).toBe(true);
      expect(result[1].isDefault).toBe(false);
    });
  });

  describe("listCommits", () => {
    it("should list commits", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.repos.listCommits.mockResolvedValue({
        data: [
          {
            sha: "abc123",
            commit: {
              message: "Initial commit",
              author: { name: "Octocat", email: "octo@test.com", date: "2025-01-01" },
            },
            html_url: "https://github.com/octocat/hello-world/commit/abc123",
          },
        ],
      });

      const result = await listCommits("user-1", "int-1", "octocat", "hello-world");
      expect(result).toHaveLength(1);
      expect(result[0].message).toBe("Initial commit");
    });
  });

  describe("listPullRequests", () => {
    it("should list pull requests", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.pulls.list.mockResolvedValue({
        data: [
          {
            number: 1,
            title: "Add feature",
            body: "Description",
            state: "open",
            user: { login: "octocat" },
            head: { ref: "feature" },
            base: { ref: "main" },
            merged: false,
            mergeable: true,
            additions: 10,
            deletions: 5,
            changed_files: 2,
            html_url: "https://github.com/octocat/hello-world/pull/1",
            created_at: "2025-01-01",
            updated_at: "2025-01-02",
            merged_at: null,
          },
        ],
      });

      const result = await listPullRequests("user-1", "int-1", "octocat", "hello-world");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Add feature");
    });
  });

  describe("getPullRequest", () => {
    it("should get PR detail with files and reviews", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.pulls.get.mockResolvedValue({
        data: {
          number: 1,
          title: "Add feature",
          body: "Description",
          state: "open",
          user: { login: "octocat" },
          head: { ref: "feature" },
          base: { ref: "main" },
          merged: false,
          mergeable: true,
          additions: 10,
          deletions: 5,
          changed_files: 2,
          html_url: "https://github.com/octocat/hello-world/pull/1",
          created_at: "2025-01-01",
          updated_at: "2025-01-02",
          merged_at: null,
          labels: [],
        },
      });
      mockOcto.rest.pulls.listFiles.mockResolvedValue({
        data: [
          {
            filename: "src/index.ts",
            status: "modified",
            additions: 10,
            deletions: 5,
            changes: 15,
            patch: "@@ -1 +1 @@",
          },
        ],
      });
      mockOcto.rest.pulls.listReviews.mockResolvedValue({
        data: [
          {
            user: { login: "reviewer1" },
            state: "APPROVED",
            body: "Looks good",
            submitted_at: "2025-01-03",
          },
        ],
      });

      const result = await getPullRequest("user-1", "int-1", "octocat", "hello-world", 1);
      expect(result.files).toHaveLength(1);
      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0].state).toBe("APPROVED");
    });
  });

  describe("listIssues", () => {
    it("should list issues excluding PRs", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.issues.listForRepo.mockResolvedValue({
        data: [
          {
            number: 1,
            title: "Bug report",
            body: "Something is broken",
            state: "open",
            user: { login: "octocat" },
            labels: [{ name: "bug" }],
            assignees: [{ login: "dev1" }],
            comments: 3,
            html_url: "https://github.com/octocat/hello-world/issues/1",
            created_at: "2025-01-01",
            updated_at: "2025-01-02",
            closed_at: null,
            pull_request: undefined,
          },
          {
            number: 2,
            title: "PR title",
            body: "PR body",
            state: "open",
            user: { login: "octocat" },
            labels: [],
            assignees: [],
            comments: 0,
            html_url: "https://github.com/octocat/hello-world/pull/2",
            created_at: "2025-01-01",
            updated_at: "2025-01-02",
            closed_at: null,
            pull_request: { url: "..." },
          },
        ],
      });

      const result = await listIssues("user-1", "int-1", "octocat", "hello-world");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Bug report");
    });
  });

  describe("getIssue", () => {
    it("should get issue with comments", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.issues.get.mockResolvedValue({
        data: {
          number: 1,
          title: "Bug report",
          body: "Something is broken",
          state: "open",
          user: { login: "octocat" },
          labels: [{ name: "bug" }],
          assignees: [{ login: "dev1" }],
          comments: 2,
          html_url: "https://github.com/octocat/hello-world/issues/1",
          created_at: "2025-01-01",
          updated_at: "2025-01-02",
          closed_at: null,
        },
      });
      mockOcto.rest.issues.listComments.mockResolvedValue({
        data: [
          {
            user: { login: "dev1" },
            body: "Looking into it",
            created_at: "2025-01-01T12:00:00Z",
            updated_at: "2025-01-01T12:00:00Z",
          },
        ],
      });

      const result = await getIssue("user-1", "int-1", "octocat", "hello-world", 1);
      expect(result.commentsList).toHaveLength(1);
      expect(result.commentsList[0].author).toBe("dev1");
    });
  });

  describe("syncRepository", () => {
    it("should sync an imported repo", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockPrisma.gitHubIntegrationRepository.findUnique.mockResolvedValue({
        id: "repo-1",
        owner: "octocat",
        name: "hello-world",
      } as any);
      mockOcto.rest.repos.get.mockResolvedValue({
        data: {
          owner: { login: "octocat" },
          name: "hello-world",
          full_name: "octocat/hello-world",
          description: "Updated desc",
          default_branch: "main",
          private: false,
          language: "TypeScript",
          stargazers_count: 20,
          forks_count: 5,
          open_issues_count: 2,
        },
      });
      mockPrisma.gitHubIntegrationRepository.upsert.mockResolvedValue({
        id: "repo-1",
        starsCount: 20,
      } as any);
      mockPrisma.gitHubIntegration.update.mockResolvedValue({} as any);

      const result = await syncRepository("user-1", "int-1", "octocat", "hello-world");
      expect(result.repository.starsCount).toBe(20);
    });

    it("should throw if repo not imported", async () => {
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockPrisma.gitHubIntegrationRepository.findUnique.mockResolvedValue(null);

      await expect(
        syncRepository("user-1", "int-1", "octocat", "hello-world")
      ).rejects.toThrow("Repository not imported");
    });
  });

  describe("analyzeRepository", () => {
    it("should return repo analysis", async () => {
      const mockOcto = await getMockOctokit();
      mockPrisma.gitHubIntegration.findUnique.mockResolvedValue({
        id: "int-1",
        userId: "user-1",
        token: "ghp_xxx",
      } as any);
      mockOcto.rest.repos.get.mockResolvedValue({
        data: {
          full_name: "octocat/hello-world",
          description: "A test repo",
          language: "TypeScript",
          stargazers_count: 10,
          forks_count: 3,
          open_issues_count: 2,
          default_branch: "main",
          created_at: "2024-01-01",
          updated_at: "2025-01-01",
        },
      });
      mockOcto.rest.pulls.list.mockResolvedValue({
        data: [
          { number: 1, title: "PR 1", user: { login: "dev1" }, html_url: "..." },
          { number: 2, title: "PR 2", user: { login: "dev2" }, html_url: "..." },
        ],
      });
      mockOcto.rest.issues.listForRepo.mockResolvedValue({
        data: [
          {
            number: 1,
            title: "Issue 1",
            user: { login: "user1" },
            labels: [{ name: "bug" }],
            html_url: "...",
            pull_request: undefined,
          },
        ],
      });
      mockOcto.rest.repos.listContributors.mockResolvedValue({
        data: [
          { login: "dev1" },
          { login: "dev2" },
        ],
      });

      const result = await analyzeRepository("user-1", "int-1", "octocat", "hello-world");
      expect(result.summary.openPRs).toBe(2);
      expect(result.summary.openIssues).toBe(1);
      expect(result.summary.contributors).toBe(2);
    });
  });
});
