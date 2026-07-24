import { describe, it, expect, vi } from "vitest";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    '{"task":"answer","needsRepositorySearch":true,"reasoning":"LLM","subtasks":["analyze"],"priority":"medium","complexity":"moderate","confidence":0.8}'
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () { yield "mock"; }),
}));

import { plannerAgent, type PlannerTask } from "../../agents/planner.agent.js";

describe("Planner Agent E2E", () => {
  const testCases: Array<{ input: string; expectedTask: PlannerTask }> = [
    { input: "Review this codebase for bugs and performance issues", expectedTask: "review" },
    { input: "Generate unit tests for the authentication module", expectedTask: "test" },
    { input: "Run a security audit and check for vulnerabilities", expectedTask: "security" },
    { input: "Analyze the architecture and suggest improvements", expectedTask: "architecture" },
    { input: "Generate API documentation for all endpoints", expectedTask: "documentation" },
    { input: "Write a commit message for the recent changes", expectedTask: "commit" },
    { input: "Create a pull request description", expectedTask: "pullRequest" },
    { input: "Fix the memory leak in the connection pool", expectedTask: "fix" },
    { input: "Explain how the middleware system works", expectedTask: "explain" },
    { input: "What is the purpose of the AgentService class?", expectedTask: "explain" },
  ];

  for (const { input, expectedTask } of testCases) {
    it(`should classify "${input.slice(0, 50)}..." as ${expectedTask}`, async () => {
      const result = await plannerAgent({ question: input });
      expect(result.task).toBe(expectedTask);
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.reasoning).toBeTypeOf("string");
      expect(result.subtasks).toBeInstanceOf(Array);
      expect(["low", "medium", "high", "critical"]).toContain(result.priority);
      expect(["simple", "moderate", "complex"]).toContain(result.estimatedComplexity);
    });
  }

  it("should handle complex multi-intent queries", async () => {
    const result = await plannerAgent({
      question: "Review this code for security vulnerabilities and generate tests",
    });
    expect(["review", "security", "test"]).toContain(result.task);
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it("should handle queries with file references", async () => {
    const result = await plannerAgent({
      question: "Review `src/auth/middleware.ts` for bugs",
      repositoryId: "repo-123",
      filePath: "src/auth/middleware.ts",
    });
    expect(result.task).toBe("review");
    expect(result.needsRepositorySearch).toBe(true);
    expect(result.repositoryId).toBe("repo-123");
    expect(result.filePath).toBe("src/auth/middleware.ts");
  });

  it("should provide consistent results for same input", async () => {
    const input = "Review this code for bugs";
    const r1 = await plannerAgent({ question: input });
    const r2 = await plannerAgent({ question: input });
    expect(r1.task).toBe(r2.task);
  });
});
