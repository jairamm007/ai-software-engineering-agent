import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AgentMemory } from "../../agents/agent-memory.js";

describe("AgentMemory", () => {
  let memory: AgentMemory;

  beforeEach(() => {
    memory = AgentMemory.create("test-session-1", "Test question");
  });

  afterEach(() => {
    memory.destroy();
  });

  describe("Creation", () => {
    it("should create a new memory instance", () => {
      expect(memory).toBeDefined();
      expect(memory.getState().sessionId).toBe("test-session-1");
      expect(memory.getState().question).toBe("Test question");
    });

    it("should return same instance for same sessionId", () => {
      const mem1 = AgentMemory.create("same-id", "Q1");
      const mem2 = AgentMemory.create("same-id", "Q2");
      expect(mem1).toBe(mem2);
      mem1.destroy();
    });

    it("should get instance by sessionId", () => {
      const retrieved = AgentMemory.getInstance("test-session-1");
      expect(retrieved).toBe(memory);
    });

    it("should return undefined for non-existent session", () => {
      const result = AgentMemory.getInstance("non-existent");
      expect(result).toBeUndefined();
    });
  });

  describe("Plan", () => {
    it("should set and get plan", () => {
      const plan = { task: "review", confidence: 0.9 };
      memory.setPlan(plan as any);
      expect(memory.getState().plan).toBe(plan);
    });
  });

  describe("Chunks", () => {
    it("should set and get chunks", () => {
      const chunks = [{ filePath: "test.ts", content: "hello" }];
      memory.setChunks(chunks as any);
      expect(memory.getState().chunks).toBe(chunks);
    });
  });

  describe("Reasoning", () => {
    it("should set and get reasoning", () => {
      const reasoning = { context: "test context", totalChunks: 5 };
      memory.setReasoning(reasoning as any);
      expect(memory.getState().reasoning).toBe(reasoning);
    });
  });

  describe("Insights", () => {
    it("should add insights", () => {
      memory.addInsight({ agent: "test", type: "finding", content: "Found something", severity: "info" });
      expect(memory.getInsights()).toHaveLength(1);
      expect(memory.getInsights()[0].agent).toBe("test");
    });

    it("should filter insights by agent", () => {
      memory.addInsight({ agent: "planner", type: "finding", content: "P1", severity: "info" });
      memory.addInsight({ agent: "retriever", type: "finding", content: "R1", severity: "low" });
      memory.addInsight({ agent: "planner", type: "warning", content: "P2", severity: "medium" });

      const plannerInsights = memory.getInsights("planner");
      expect(plannerInsights).toHaveLength(2);
    });

    it("should filter insights by severity", () => {
      memory.addInsight({ agent: "a", type: "finding", content: "1", severity: "info" });
      memory.addInsight({ agent: "a", type: "warning", content: "2", severity: "high" });
      memory.addInsight({ agent: "a", type: "finding", content: "3", severity: "info" });

      const highSeverity = memory.getInsightsBySeverity("high");
      expect(highSeverity).toHaveLength(1);
    });

    it("should add timestamp to insights", () => {
      memory.addInsight({ agent: "test", type: "finding", content: "Test", severity: "info" });
      const insight = memory.getInsights()[0];
      expect(insight.timestamp).toBeTypeOf("number");
      expect(insight.timestamp).toBeGreaterThan(0);
    });
  });

  describe("Metrics", () => {
    it("should set and get metrics", () => {
      memory.setMetrics("planner", { executionTimeMs: 100, tokensProcessed: 500, confidence: 0.9, coverageScore: 80 });
      const m = memory.getMetrics("planner");
      expect(m).toBeDefined();
      expect(m!.executionTimeMs).toBe(100);
      expect(m!.confidence).toBe(0.9);
    });

    it("should return all metrics", () => {
      memory.setMetrics("a", { executionTimeMs: 10, tokensProcessed: 100, confidence: 0.8, coverageScore: 50 });
      memory.setMetrics("b", { executionTimeMs: 20, tokensProcessed: 200, confidence: 0.7, coverageScore: 60 });
      const all = memory.getAllMetrics();
      expect(all.size).toBe(2);
    });
  });

  describe("Shared Context", () => {
    it("should set and get shared values", () => {
      memory.setShared("key1", "value1");
      expect(memory.getShared<string>("key1")).toBe("value1");
    });

    it("should handle complex types", () => {
      const data = { items: [1, 2, 3], nested: { a: true } };
      memory.setShared("complex", data);
      expect(memory.getShared("complex")).toEqual(data);
    });

    it("should return undefined for missing keys", () => {
      expect(memory.getShared("missing")).toBeUndefined();
    });
  });

  describe("Execution History", () => {
    it("should record execution order", () => {
      memory.recordExecution("planner");
      memory.recordExecution("retriever");
      memory.recordExecution("reasoner");
      expect(memory.getExecutionOrder()).toEqual(["planner", "retriever", "reasoner"]);
    });
  });

  describe("Subscriptions", () => {
    it("should notify listeners on state changes", () => {
      let notified = false;
      memory.subscribe(() => { notified = true; });
      memory.setPlan({ task: "test" } as any);
      expect(notified).toBe(true);
    });

    it("should unsubscribe correctly", () => {
      let count = 0;
      const unsub = memory.subscribe(() => { count++; });
      memory.setPlan({ task: "1" } as any);
      unsub();
      memory.setPlan({ task: "2" } as any);
      expect(count).toBe(1);
    });
  });

  describe("toContextString", () => {
    it("should produce a readable context string", () => {
      memory.setPlan({ task: "review", confidence: 0.9 } as any);
      memory.addInsight({ agent: "planner", type: "finding", content: "Found issue", severity: "high" });
      memory.setMetrics("planner", { executionTimeMs: 100, tokensProcessed: 0, confidence: 0.9, coverageScore: 0 });

      const str = memory.toContextString();
      expect(str).toContain("test-session-1");
      expect(str).toContain("Test question");
      expect(str).toContain("review");
      expect(str).toContain("Insights");
      expect(str).toContain("Metrics");
    });
  });

  describe("Clear and Destroy", () => {
    it("should clear all state", () => {
      memory.addInsight({ agent: "a", type: "finding", content: "1", severity: "info" });
      memory.setMetrics("a", { executionTimeMs: 10, tokensProcessed: 0, confidence: 0.5, coverageScore: 0 });
      memory.clear();
      expect(memory.getInsights()).toHaveLength(0);
      expect(memory.getAllMetrics().size).toBe(0);
    });

    it("should destroy and remove from static map", () => {
      memory.destroy();
      expect(AgentMemory.getInstance("test-session-1")).toBeUndefined();
    });
  });
});
