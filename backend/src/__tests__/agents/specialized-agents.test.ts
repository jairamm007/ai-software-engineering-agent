import { describe, it, expect, vi, beforeEach } from "vitest";
import { codeReviewAgent } from "../../agents/code-review.agent.js";
import { fixAgent } from "../../agents/fix.agent.js";
import { testGeneratorAgent } from "../../agents/test-generator.agent.js";
import { architectureAgent } from "../../agents/architecture.agent.js";
import { documentationAgent } from "../../agents/documentation.agent.js";
import { securityAgent } from "../../agents/security.agent.js";
import { commitMessageAgent } from "../../agents/commit-message.agent.js";
import { pullRequestAgent } from "../../agents/pull-request.agent.js";
import { answerAgent } from "../../agents/answer.agent.js";
import {
  createMockPlanResult,
  createMockReasoningResult,
} from "../utils/test-helpers.js";

vi.mock("../../ai/providers/llm.service.js", () => ({
  generateText: vi.fn().mockResolvedValue(
    "Mock agent output for testing.\n\n---SELF_EVAL---\nConfidence: 0.85\nQuality: high\nCompleteness: 88%\nNotes: Good\n---END_EVAL---"
  ),
  generateTextStream: vi.fn().mockImplementation(async function* () {
    yield "mock";
  }),
}));

describe("Specialized Agents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const plan = createMockPlanResult();
  const reasoning = createMockReasoningResult();

  describe("codeReviewAgent", () => {
    it("should return a CodeReviewResult with summary", async () => {
      const result = await codeReviewAgent(plan, reasoning);
      expect(result).toBeDefined();
      expect(result.summary).toBeTypeOf("string");
      expect(result.summary.length).toBeGreaterThan(0);
    });
  });

  describe("fixAgent", () => {
    it("should return a string output", async () => {
      const result = await fixAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("testGeneratorAgent", () => {
    it("should return a string output", async () => {
      const result = await testGeneratorAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("architectureAgent", () => {
    it("should return a string output", async () => {
      const result = await architectureAgent(plan, reasoning.context);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("documentationAgent", () => {
    it("should return a string output", async () => {
      const result = await documentationAgent(plan, reasoning.context);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("securityAgent", () => {
    it("should return a string output", async () => {
      const result = await securityAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("commitMessageAgent", () => {
    it("should return a string output", async () => {
      const result = await commitMessageAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("pullRequestAgent", () => {
    it("should return a string output", async () => {
      const result = await pullRequestAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("answerAgent", () => {
    it("should return a string output", async () => {
      const result = await answerAgent(plan, reasoning);
      expect(result).toBeTypeOf("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Memory integration", () => {
    it("should work with memory for all agents", async () => {
      const { AgentMemory } = await import("../../agents/agent-memory.js");
      const memory = AgentMemory.create("specialized-test", "Test");

      await codeReviewAgent(plan, reasoning, memory);
      await fixAgent(plan, reasoning, memory);
      await testGeneratorAgent(plan, reasoning, memory);

      const insights = memory.getInsights();
      expect(insights.length).toBeGreaterThan(0);

      memory.destroy();
    });
  });
});
