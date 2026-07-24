import { describe, it, expect } from "vitest";
import { AGENTS } from "../../agents/prompts.js";
import type { AgentType } from "../../agents/agent.types.js";

describe("Agent Prompts", () => {
  const agentTypes: AgentType[] = [
    "answer", "review", "fix", "commit", "architecture",
    "documentation", "pullRequest", "test", "security",
  ];

  it("should have prompts for all agent types", () => {
    for (const type of agentTypes) {
      expect(AGENTS[type]).toBeDefined();
    }
  });

  it("should have valid prompt structure for all agents", () => {
    for (const type of agentTypes) {
      const agent = AGENTS[type];
      expect(agent.name).toBe(type);
      expect(agent.systemPrompt).toBeTypeOf("string");
      expect(agent.systemPrompt.length).toBeGreaterThan(100);
      expect(agent.userContextPrefix).toBeTypeOf("string");
      expect(agent.userContextPrefix!.length).toBeGreaterThan(10);
    }
  });

  it("should have review agent with all review dimensions", () => {
    const prompt = AGENTS.review.systemPrompt;
    expect(prompt).toContain("Correctness");
    expect(prompt).toContain("Security");
    expect(prompt).toContain("Performance");
    expect(prompt).toContain("Quality");
  });

  it("should have test agent with vitest reference", () => {
    const prompt = AGENTS.test.systemPrompt;
    expect(prompt).toContain("vitest");
    expect(prompt).toContain("describe");
    expect(prompt).toContain("it");
    expect(prompt).toContain("expect");
  });

  it("should have security agent with OWASP reference", () => {
    const prompt = AGENTS.security.systemPrompt;
    expect(prompt).toContain("OWASP");
    expect(prompt).toContain("CWE");
  });

  it("should have architecture agent with design patterns", () => {
    const prompt = AGENTS.architecture.systemPrompt;
    expect(prompt).toContain("System Overview");
    expect(prompt).toContain("Design Patterns");
    expect(prompt).toContain("Technical Debt");
  });

  it("should have documentation agent with API doc format", () => {
    const prompt = AGENTS.documentation.systemPrompt;
    expect(prompt).toContain("API Reference");
    expect(prompt).toContain("Parameters");
    expect(prompt).toContain("Returns");
  });

  it("should have commit agent with conventional commits", () => {
    const prompt = AGENTS.commit.systemPrompt;
    expect(prompt).toContain("Conventional Commit");
    expect(prompt).toContain("feat");
    expect(prompt).toContain("fix");
  });

  it("should have answer agent with structured format", () => {
    const prompt = AGENTS.answer.systemPrompt;
    expect(prompt).toContain("Answer");
    expect(prompt).toContain("Evidence");
    expect(prompt).toContain("How It Works");
  });

  it("should have fix agent with code fix format", () => {
    const prompt = AGENTS.fix.systemPrompt;
    expect(prompt).toContain("Bug Fixes");
    expect(prompt).toContain("Improved Code");
    expect(prompt).toContain("Migration Guide");
  });

  it("should have PR agent with checklist format", () => {
    const prompt = AGENTS.pullRequest.systemPrompt;
    expect(prompt).toContain("Summary");
    expect(prompt).toContain("Testing");
    expect(prompt).toContain("Deployment");
  });
});
