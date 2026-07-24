import { describe, it, expect, vi, beforeEach } from "vitest";
import { orchestrateMultiAgent, getAgentDefinitions } from "../../services/multi-agent.service.js";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    "Mock agent output.\n\n---SELF_EVAL---\nConfidence: 0.8\nQuality: medium\nCompleteness: 75%\nNotes: Test\n---END_EVAL---"
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () {
    yield "mock stream";
  }),
}));

vi.mock("../../services/search.service.js", () => ({
  semanticSearch: vi.fn().mockResolvedValue([
    {
      id: "c1",
      content: "export function test() { return 1; }",
      filePath: "src/test.ts",
      startLine: 1,
      endLine: 3,
      distance: 0.2,
      repositoryId: "repo-123",
      codeChunkId: "cc-1",
    },
  ]),
  multiQuerySearch: vi.fn().mockResolvedValue([
    {
      id: "c1",
      content: "export function test() { return 1; }",
      filePath: "src/test.ts",
      startLine: 1,
      endLine: 3,
      distance: 0.2,
      repositoryId: "repo-123",
      codeChunkId: "cc-1",
    },
  ]),
}));

vi.mock("../../rag/context-builder.js", () => ({
  buildContext: vi.fn().mockImplementation((chunks: any[]) => {
    if (!chunks || chunks.length === 0) return "No context";
    return chunks.map((c: any) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`).join("\n");
  }),
}));

describe("Multi-Agent Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAgentDefinitions", () => {
    it("should return all agent definitions", () => {
      const defs = getAgentDefinitions();
      expect(defs.length).toBeGreaterThan(0);
      expect(defs.every((d) => d.id && d.label)).toBe(true);
    });

    it("should include standard agent types", () => {
      const defs = getAgentDefinitions();
      const ids = defs.map((d) => d.id);
      expect(ids).toContain("planner");
      expect(ids).toContain("retriever");
      expect(ids).toContain("reasoner");
      expect(ids).toContain("answer");
      expect(ids).toContain("codeReview");
    });
  });

  describe("orchestrateMultiAgent", () => {
    it("should run the full pipeline", async () => {
      const result = await orchestrateMultiAgent(
        "Review this code for bugs",
        "repo-123"
      );

      expect(result).toBeDefined();
      expect(result.question).toBe("Review this code for bugs");
      expect(result.task).toBeTypeOf("string");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.steps).toBeInstanceOf(Array);
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
    });

    it("should track execution steps", async () => {
      const result = await orchestrateMultiAgent("Fix this bug", "repo-123");

      expect(result.steps.length).toBeGreaterThanOrEqual(3);
      expect(result.steps[0].agent).toBe("planner");
      expect(result.steps[1].agent).toBe("retriever");
      expect(result.steps[2].agent).toBe("reasoner");
    });

    it("should include memory insights", async () => {
      const result = await orchestrateMultiAgent("Security audit", "repo-123");

      expect(result.memoryInsights).toBeInstanceOf(Array);
    });

    it("should include performance metrics", async () => {
      const result = await orchestrateMultiAgent("Test generation", "repo-123");

      expect(result.performanceMetrics).toBeDefined();
      expect(typeof result.performanceMetrics).toBe("object");
    });

    it("should include execution trace", async () => {
      const result = await orchestrateMultiAgent("Documentation", "repo-123");

      expect(result.executionTrace).toBeInstanceOf(Array);
    });

    it("should route to correct specialized agent", async () => {
      const reviewResult = await orchestrateMultiAgent("Review code for bugs", "repo-123");
      expect(reviewResult.task).toBe("review");

      const securityResult = await orchestrateMultiAgent("Security audit of auth", "repo-123");
      expect(securityResult.task).toBe("security");
    });
  });
});
