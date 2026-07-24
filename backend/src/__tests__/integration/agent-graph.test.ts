import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    "Integration test response.\n\n---SELF_EVAL---\nConfidence: 0.9\nQuality: high\nCompleteness: 85%\nNotes: Test\n---END_EVAL---"
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () { yield "mock"; }),
}));

vi.mock("../../services/search.service.js", () => ({
  semanticSearch: vi.fn().mockResolvedValue([
    {
      id: "c1",
      content: "export function calculate(a: number, b: number) { return a + b; }",
      filePath: "src/calc.ts",
      startLine: 1,
      endLine: 2,
      distance: 0.15,
      repositoryId: "repo-int",
      codeChunkId: "cc-int-1",
    },
    {
      id: "c2",
      content: "import { calculate } from './calc';\nexport const result = calculate(1, 2);",
      filePath: "src/index.ts",
      startLine: 1,
      endLine: 2,
      distance: 0.3,
      repositoryId: "repo-int",
      codeChunkId: "cc-int-2",
    },
  ]),
  multiQuerySearch: vi.fn().mockResolvedValue([
    {
      id: "c1",
      content: "export function calculate(a: number, b: number) { return a + b; }",
      filePath: "src/calc.ts",
      startLine: 1,
      endLine: 2,
      distance: 0.15,
      repositoryId: "repo-int",
      codeChunkId: "cc-int-1",
    },
    {
      id: "c2",
      content: "import { calculate } from './calc';\nexport const result = calculate(1, 2);",
      filePath: "src/index.ts",
      startLine: 1,
      endLine: 2,
      distance: 0.3,
      repositoryId: "repo-int",
      codeChunkId: "cc-int-2",
    },
  ]),
}));

vi.mock("../../rag/context-builder.js", () => ({
  buildContext: vi.fn().mockImplementation((chunks: any[]) => {
    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) return "No context";
    return chunks.map((c: any) => `[★ ${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`).join("\n\n---\n\n");
  }),
}));

import { agentGraph } from "../../agents/graph.state.js";

describe("Agent Graph Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should compile the graph successfully", () => {
    expect(agentGraph).toBeDefined();
    expect(typeof agentGraph.invoke).toBe("function");
  });

  it("should run answer agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Hello world",
      repositoryId: "repo-int",
    });

    expect(result).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(["answer", "explain"]).toContain(result.plan.task);
    expect(result.chunks).toBeInstanceOf(Array);
    expect(result.reasoning).toBeDefined();
    expect(result.answer).toBeTypeOf("string");
    expect(result.answer.length).toBeGreaterThan(0);
  });

  it("should route to review agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Review this code for bugs and issues",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("review");
    expect(result.reviewResult).toBeDefined();
    expect(result.reviewResult.summary).toBeTypeOf("string");
  });

  it("should route to test agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Generate unit tests for this function",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("test");
    expect(result.testResult).toBeTypeOf("string");
  });

  it("should route to security agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Run a security audit on this codebase",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("security");
    expect(result.securityResult).toBeTypeOf("string");
  });

  it("should route to architecture agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Analyze the architecture and design patterns",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("architecture");
    expect(result.architecture).toBeTypeOf("string");
  });

  it("should route to documentation agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Generate API documentation for this module",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("documentation");
    expect(result.documentation).toBeTypeOf("string");
  });

  it("should route to commit message agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Write a commit message for these changes",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("commit");
    expect(result.commitResult).toBeTypeOf("string");
  });

  it("should route to fix agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Fix the null pointer exception in the login handler",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("fix");
    expect(result.fixResult).toBeTypeOf("string");
  });

  it("should route to pull request agent through graph", async () => {
    const result = await agentGraph.invoke({
      question: "Create a pull request description for these changes",
      repositoryId: "repo-int",
    });

    expect(result.plan.task).toBe("pullRequest");
    expect(result.pullRequest).toBeTypeOf("string");
  });

  it("should include execution trace in graph output", async () => {
    const result = await agentGraph.invoke({
      question: "What does this code do?",
      repositoryId: "repo-int",
    });

    expect(result.executionTrace).toBeInstanceOf(Array);
    expect(result.executionTrace.length).toBeGreaterThan(0);
  });

  it("should include agent timings in graph output", async () => {
    const result = await agentGraph.invoke({
      question: "What does this code do?",
      repositoryId: "repo-int",
    });

    expect(result.agentTimings).toBeDefined();
    expect(typeof result.agentTimings).toBe("object");
  });
});
