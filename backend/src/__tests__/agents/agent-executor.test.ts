import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeAgent } from "../../agents/agent-executor.js";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    "This is a mock agent response for testing purposes.\n\n---SELF_EVAL---\nConfidence: 0.85\nQuality: high\nCompleteness: 90%\nNotes: Good response\n---END_EVAL---"
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () {
    yield "mock streaming response";
  }),
}));

describe("Agent Executor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute an agent and return cleaned output", async () => {
    const result = await executeAgent("answer", "test context", "What is this code?");
    expect(result).toBeTypeOf("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain("---SELF_EVAL---");
    expect(result).not.toContain("---END_EVAL---");
  });

  it("should truncate long context", async () => {
    const longContext = "x".repeat(70_000);
    const result = await executeAgent("answer", longContext, "test question");
    expect(result).toBeTypeOf("string");
  });

  it("should work with memory", async () => {
    const { AgentMemory } = await import("../../agents/agent-memory.js");
    const memory = AgentMemory.create("exec-test", "Test question");
    memory.addInsight({ agent: "planner", type: "finding", content: "Test insight", severity: "info" });
    memory.setShared("detectedPatterns", ["Module exports"]);

    const result = await executeAgent("answer", "test context", "test question", memory);
    expect(result).toBeTypeOf("string");

    const history = memory.getExecutionOrder();
    expect(history).toContain("answer");
    memory.destroy();
  });

  it("should add insights to memory on execution", async () => {
    const { AgentMemory } = await import("../../agents/agent-memory.js");
    const memory = AgentMemory.create("exec-insight-test", "Test");

    await executeAgent("review", "context", "question", memory);

    const insights = memory.getInsights("review");
    expect(insights.length).toBeGreaterThan(0);
    memory.destroy();
  });
});
