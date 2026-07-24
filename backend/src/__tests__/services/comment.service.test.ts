import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractMentions } from "../../services/comment.service.js";

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
    teamMember: { findUnique: vi.fn() },
    teamActivity: { create: vi.fn() },
  },
}));

describe("Comment Service - Mentions", () => {
  it("should extract single mention", () => {
    const mentions = extractMentions("Hello @john how are you?");
    expect(mentions).toEqual(["john"]);
  });

  it("should extract multiple mentions", () => {
    const mentions = extractMentions("Hey @alice and @bob check this");
    expect(mentions).toEqual(["alice", "bob"]);
  });

  it("should deduplicate mentions", () => {
    const mentions = extractMentions("@alice said @alice is right");
    expect(mentions).toEqual(["alice"]);
  });

  it("should return empty array when no mentions", () => {
    const mentions = extractMentions("Hello everyone");
    expect(mentions).toEqual([]);
  });

  it("should handle mention at start", () => {
    const mentions = extractMentions("@john please review");
    expect(mentions).toEqual(["john"]);
  });

  it("should handle mention at end", () => {
    const mentions = extractMentions("Thanks @john");
    expect(mentions).toEqual(["john"]);
  });

  it("should handle empty string", () => {
    const mentions = extractMentions("");
    expect(mentions).toEqual([]);
  });

  it("should extract mentions with numbers", () => {
    const mentions = extractMentions("Hey @user123 check this");
    expect(mentions).toEqual(["user123"]);
  });
});
