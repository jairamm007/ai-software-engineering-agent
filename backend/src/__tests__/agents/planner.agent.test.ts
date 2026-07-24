import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    '{"task":"answer","needsRepositorySearch":true,"reasoning":"LLM analysis","subtasks":["analyze"],"priority":"medium","complexity":"moderate","confidence":0.8}'
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () { yield "mock"; }),
}));

import { plannerAgent } from "../../agents/planner.agent.js";

describe("Planner Agent", () => {
  describe("Regex-based planning (default)", () => {
    it("should identify review tasks", async () => {
      const result = await plannerAgent({ question: "Review this code for bugs" });
      expect(result.task).toBe("review");
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.needsRepositorySearch).toBe(true);
      expect(result.question).toBe("Review this code for bugs");
    });

    it("should identify test tasks", async () => {
      const result = await plannerAgent({ question: "Generate unit tests for this function" });
      expect(result.task).toBe("test");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify security tasks", async () => {
      const result = await plannerAgent({ question: "Run a security audit on this codebase" });
      expect(result.task).toBe("security");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify architecture tasks", async () => {
      const result = await plannerAgent({ question: "Analyze the architecture and design patterns" });
      expect(result.task).toBe("architecture");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify documentation tasks", async () => {
      const result = await plannerAgent({ question: "Generate API documentation for all endpoints" });
      expect(result.task).toBe("documentation");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify commit tasks", async () => {
      const result = await plannerAgent({ question: "Write a commit message for these changes" });
      expect(result.task).toBe("commit");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify pull request tasks", async () => {
      const result = await plannerAgent({ question: "Create a PR description" });
      expect(result.task).toBe("pullRequest");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify fix tasks", async () => {
      const result = await plannerAgent({ question: "Fix the bug in the connection handler and improve the code" });
      expect(result.task).toBe("fix");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should identify explain tasks", async () => {
      const result = await plannerAgent({ question: "Explain how the authentication system works" });
      expect(result.task).toBe("explain");
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("should default to answer for ambiguous queries", async () => {
      const result = await plannerAgent({ question: "Hello world" });
      expect(result.task).toBe("answer");
    });

    it("should include reasoning string", async () => {
      const result = await plannerAgent({ question: "Review this code for bugs" });
      expect(result.reasoning).toBeTypeOf("string");
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it("should include subtasks array", async () => {
      const result = await plannerAgent({ question: "Review this code" });
      expect(result.subtasks).toBeInstanceOf(Array);
    });

    it("should include priority level", async () => {
      const result = await plannerAgent({ question: "Review this code" });
      expect(["low", "medium", "high", "critical"]).toContain(result.priority);
    });

    it("should include estimated complexity", async () => {
      const result = await plannerAgent({ question: "Review this code" });
      expect(["simple", "moderate", "complex"]).toContain(result.estimatedComplexity);
    });
  });

  describe("Repository context", () => {
    it("should set needsRepositorySearch to true when repositoryId is provided", async () => {
      const result = await plannerAgent({
        question: "Hello",
        repositoryId: "repo-123",
      });
      expect(result.needsRepositorySearch).toBe(true);
      expect(result.repositoryId).toBe("repo-123");
    });

    it("should set needsRepositorySearch to true when filePath is provided", async () => {
      const result = await plannerAgent({
        question: "Hello",
        filePath: "src/index.ts",
      });
      expect(result.needsRepositorySearch).toBe(true);
      expect(result.filePath).toBe("src/index.ts");
    });
  });

  describe("Confidence calculation", () => {
    it("should have high confidence for clear review queries", async () => {
      const result = await plannerAgent({
        question: "Review this code for bugs and performance issues",
      });
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it("should have lower confidence for ambiguous queries", async () => {
      const result = await plannerAgent({
        question: "the thing",
      });
      expect(result.confidence).toBeLessThanOrEqual(0.8);
    });
  });
});
