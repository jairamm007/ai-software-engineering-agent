import { describe, it, expect } from "vitest";
import {
  getAgentMetadata,
  getAllAgentMetadata,
  getAgentCapabilities,
  getAgentsByCapability,
  getParallelizableAgents,
  getAgentDependencies,
  type AgentMetadata,
} from "../../agents/agent-registry.js";
import type { AgentType } from "../../agents/agent.types.js";

describe("Agent Registry", () => {
  describe("getAgentMetadata", () => {
    it("should return metadata for all known agent types", () => {
      const types: AgentType[] = [
        "answer", "review", "fix", "commit", "architecture",
        "documentation", "pullRequest", "test", "security",
      ];

      for (const type of types) {
        const meta = getAgentMetadata(type);
        expect(meta).toBeDefined();
        expect(meta!.type).toBe(type);
        expect(meta!.displayName).toBeTypeOf("string");
        expect(meta!.description).toBeTypeOf("string");
        expect(meta!.capabilities).toBeInstanceOf(Array);
        expect(meta!.capabilities.length).toBeGreaterThan(0);
        expect(meta!.outputFormat).toBeDefined();
        expect(meta!.maxInputTokens).toBeGreaterThan(0);
      }
    });

    it("should return undefined for unknown type", () => {
      expect(getAgentMetadata("unknown" as AgentType)).toBeUndefined();
    });
  });

  describe("getAllAgentMetadata", () => {
    it("should return all registered agents", () => {
      const all = getAllAgentMetadata();
      expect(all.length).toBe(9);
    });

    it("should have unique types", () => {
      const all = getAllAgentMetadata();
      const types = all.map((a) => a.type);
      expect(new Set(types).size).toBe(types.length);
    });
  });

  describe("getAgentCapabilities", () => {
    it("should return capabilities for known agent", () => {
      const caps = getAgentCapabilities("review");
      expect(caps.length).toBeGreaterThan(0);
      caps.forEach((c) => {
        expect(c.name).toBeTypeOf("string");
        expect(c.description).toBeTypeOf("string");
      });
    });

    it("should return empty array for unknown agent", () => {
      expect(getAgentCapabilities("unknown" as AgentType)).toEqual([]);
    });
  });

  describe("getAgentsByCapability", () => {
    it("should find agents with a specific capability", () => {
      const agents = getAgentsByCapability("bug-detection");
      expect(agents.length).toBeGreaterThan(0);
      expect(agents.some((a) => a.type === "review")).toBe(true);
    });

    it("should return empty array for non-existent capability", () => {
      const agents = getAgentsByCapability("nonexistent-capability");
      expect(agents).toHaveLength(0);
    });
  });

  describe("getParallelizableAgents", () => {
    it("should return agents that can parallelize", () => {
      const agents = getParallelizableAgents();
      agents.forEach((a) => {
        expect(a.canParallelize).toBe(true);
      });
    });
  });

  describe("getAgentDependencies", () => {
    it("should return dependencies for agents", () => {
      for (const type of ["answer", "review", "test", "security"] as AgentType[]) {
        const deps = getAgentDependencies(type);
        expect(deps).toBeInstanceOf(Array);
      }
    });
  });

  describe("Metadata consistency", () => {
    it("should have valid requiredContext arrays", () => {
      const all = getAllAgentMetadata();
      for (const meta of all) {
        expect(meta.requiredContext).toBeInstanceOf(Array);
        expect(meta.requiredContext.length).toBeGreaterThan(0);
      }
    });

    it("should have valid outputFormat values", () => {
      const all = getAllAgentMetadata();
      const validFormats = ["text", "structured", "code", "report"];
      for (const meta of all) {
        expect(validFormats).toContain(meta.outputFormat);
      }
    });

    it("should have valid estimatedLatencyMs values", () => {
      const all = getAllAgentMetadata();
      for (const meta of all) {
        expect(meta.estimatedLatencyMs).toBeGreaterThan(0);
      }
    });
  });
});
