import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  resolveComment,
  getCommentsByMention,
  getUnresolvedCommentCount,
} from "../../repository/comment.repository.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

describe("Comment Repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a comment", async () => {
    mockPrisma.comment.create.mockResolvedValue({
      id: "comment-1",
      teamId: "team-1",
      userId: "user-1",
      content: "Great work!",
      mentions: [],
    } as any);

    const result = await createComment("team-1", "user-1", "Great work!");
    expect(result.content).toBe("Great work!");
    expect(mockPrisma.comment.create).toHaveBeenCalled();
  });

  it("should create a comment with mentions", async () => {
    mockPrisma.comment.create.mockResolvedValue({
      id: "comment-2",
      content: "@alice check this",
      mentions: ["alice"],
    } as any);

    const result = await createComment(
      "team-1",
      "user-1",
      "@alice check this",
      undefined,
      undefined,
      ["alice"]
    );
    expect(result.mentions).toEqual(["alice"]);
  });

  it("should create a reply comment", async () => {
    mockPrisma.comment.create.mockResolvedValue({
      id: "comment-3",
      parentCommentId: "comment-1",
      content: "Reply",
    } as any);

    const result = await createComment(
      "team-1",
      "user-2",
      "Reply",
      undefined,
      "comment-1"
    );
    expect(result.parentCommentId).toBe("comment-1");
  });

  it("should get comments", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([
      { id: "comment-1", content: "First" },
      { id: "comment-2", content: "Second" },
    ] as any);

    const result = await getComments("team-1");
    expect(result).toHaveLength(2);
  });

  it("should get comments filtered by repository", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([
      { id: "comment-1", repositoryId: "repo-1" },
    ] as any);

    await getComments("team-1", { repositoryId: "repo-1" });

    expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ repositoryId: "repo-1" }),
      })
    );
  });

  it("should get comment by ID", async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({
      id: "comment-1",
      content: "Test",
    } as any);

    const result = await getCommentById("comment-1");
    expect(result).toBeDefined();
  });

  it("should update comment", async () => {
    mockPrisma.comment.update.mockResolvedValue({
      id: "comment-1",
      content: "Updated",
    } as any);

    const result = await updateComment("comment-1", "Updated", []);
    expect(result.content).toBe("Updated");
  });

  it("should delete comment", async () => {
    mockPrisma.comment.delete.mockResolvedValue({ id: "comment-1" } as any);

    const result = await deleteComment("comment-1");
    expect(result.id).toBe("comment-1");
  });

  it("should resolve comment", async () => {
    mockPrisma.comment.update.mockResolvedValue({
      id: "comment-1",
      resolved: true,
    } as any);

    const result = await resolveComment("comment-1", true);
    expect(result.resolved).toBe(true);
  });

  it("should get comments by mention", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([
      { id: "comment-1", mentions: ["user-1"] },
    ] as any);

    const result = await getCommentsByMention("team-1", "user-1");
    expect(result).toHaveLength(1);
  });

  it("should get unresolved comment count", async () => {
    mockPrisma.comment.count.mockResolvedValue(5 as any);

    const result = await getUnresolvedCommentCount("team-1");
    expect(result).toBe(5);
  });
});
