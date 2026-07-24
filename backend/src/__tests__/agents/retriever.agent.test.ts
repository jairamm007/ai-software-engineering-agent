import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../services/search.service.js", () => ({
  semanticSearch: vi.fn().mockResolvedValue([
    {
      id: "c1", content: "function test() {}", filePath: "src/test.ts",
      startLine: 1, endLine: 3, distance: 0.2, repositoryId: "repo-123", codeChunkId: "cc-1",
    },
    {
      id: "c2", content: "class Service {}", filePath: "src/service.ts",
      startLine: 1, endLine: 3, distance: 0.4, repositoryId: "repo-123", codeChunkId: "cc-2",
    },
    {
      id: "c3", content: "const x = 1;", filePath: "src/utils.ts",
      startLine: 1, endLine: 3, distance: 0.6, repositoryId: "repo-123", codeChunkId: "cc-3",
    },
  ]),
  multiQuerySearch: vi.fn().mockResolvedValue([
    {
      id: "c1", content: "function test() {}", filePath: "src/test.ts",
      startLine: 1, endLine: 3, distance: 0.2, repositoryId: "repo-123", codeChunkId: "cc-1",
    },
    {
      id: "c2", content: "class Service {}", filePath: "src/service.ts",
      startLine: 1, endLine: 3, distance: 0.4, repositoryId: "repo-123", codeChunkId: "cc-2",
    },
    {
      id: "c3", content: "const x = 1;", filePath: "src/utils.ts",
      startLine: 1, endLine: 3, distance: 0.6, repositoryId: "repo-123", codeChunkId: "cc-3",
    },
  ]),
}));

vi.mock("../../agents/agent-tools.js", () => ({
  getTool: vi.fn().mockImplementation((name: string) => {
    if (name === "expand_query") {
      return {
        name: "expand_query",
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: { expandedTerms: ["alternative query"] },
        }),
      };
    }
    return undefined;
  }),
}));

import { retrieverAgent } from "../../agents/retriever.agent.js";
import { createMockPlanResult } from "../utils/test-helpers.js";

describe("Retriever Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty result when search is not needed", async () => {
    const plan = createMockPlanResult({ needsRepositorySearch: false });
    const result = await retrieverAgent(plan);
    expect(result.chunks).toHaveLength(0);
    expect(result.totalRetrieved).toBe(0);
  });

  it("should retrieve chunks when search is needed", async () => {
    const plan = createMockPlanResult({ needsRepositorySearch: true });
    const result = await retrieverAgent(plan);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.totalRetrieved).toBeGreaterThan(0);
    expect(result.filesTouched).toBeGreaterThan(0);
  });

  it("should track queries used", async () => {
    const plan = createMockPlanResult({ needsRepositorySearch: true });
    const result = await retrieverAgent(plan);
    expect(result.queriesUsed).toBeInstanceOf(Array);
    expect(result.queriesUsed.length).toBeGreaterThan(0);
  });

  it("should calculate average relevance", async () => {
    const plan = createMockPlanResult({ needsRepositorySearch: true });
    const result = await retrieverAgent(plan);
    expect(result.averageRelevance).toBeGreaterThanOrEqual(0);
    expect(result.averageRelevance).toBeLessThanOrEqual(1);
  });

  it("should work with memory integration", async () => {
    const { AgentMemory } = await import("../../agents/agent-memory.js");
    const memory = AgentMemory.create("retriever-test", "Test question");
    const plan = createMockPlanResult({ needsRepositorySearch: true });

    const result = await retrieverAgent(plan, memory);
    expect(result.chunks.length).toBeGreaterThan(0);

    const history = memory.getExecutionOrder();
    expect(history).toContain("retriever");
    memory.destroy();
  });
});
