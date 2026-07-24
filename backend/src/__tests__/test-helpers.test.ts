import { describe, it, expect } from "vitest";
import {
  createMockPlanResult,
  createMockRetrievedChunk,
  createMockReasoningResult,
  createMockChunks,
  expectValidPlanResult,
  expectValidReasoningResult,
  SAMPLE_CODE,
} from "./utils/test-helpers.js";

describe("Test Helpers", () => {
  describe("createMockPlanResult", () => {
    it("should create a valid default plan result", () => {
      const result = createMockPlanResult();
      expectValidPlanResult(result);
      expect(result.task).toBe("answer");
      expect(result.confidence).toBe(0.85);
      expect(result.repositoryId).toBe("repo-123");
    });

    it("should allow overrides", () => {
      const result = createMockPlanResult({ task: "review", confidence: 0.95 });
      expect(result.task).toBe("review");
      expect(result.confidence).toBe(0.95);
    });
  });

  describe("createMockRetrievedChunk", () => {
    it("should create a valid default chunk", () => {
      const chunk = createMockRetrievedChunk();
      expect(chunk.id).toBe("chunk-1");
      expect(chunk.filePath).toBe("src/test.ts");
      expect(chunk.startLine).toBe(1);
      expect(chunk.endLine).toBe(3);
      expect(chunk.distance).toBe(0.25);
      expect(chunk.content).toContain("testFunction");
    });

    it("should allow overrides", () => {
      const chunk = createMockRetrievedChunk({ filePath: "src/custom.ts", distance: 0.5 });
      expect(chunk.filePath).toBe("src/custom.ts");
      expect(chunk.distance).toBe(0.5);
    });
  });

  describe("createMockReasoningResult", () => {
    it("should create a valid default reasoning result", () => {
      const result = createMockReasoningResult();
      expectValidReasoningResult(result);
      expect(result.totalChunks).toBe(1);
      expect(result.keyFiles).toContain("src/test.ts");
    });

    it("should allow overrides", () => {
      const result = createMockReasoningResult({
        totalChunks: 10,
        complexity: { score: 80, level: "high" },
      });
      expect(result.totalChunks).toBe(10);
      expect(result.complexity.level).toBe("high");
    });
  });

  describe("createMockChunks", () => {
    it("should create the specified number of chunks", () => {
      const chunks = createMockChunks(5);
      expect(chunks).toHaveLength(5);
    });

    it("should create valid chunk objects", () => {
      const chunks = createMockChunks(3);
      chunks.forEach((chunk, i) => {
        expect(chunk.id).toBe(`chunk-${i}`);
        expect(chunk.filePath).toBeTypeOf("string");
        expect(chunk.startLine).toBeGreaterThan(0);
        expect(chunk.endLine).toBeGreaterThan(chunk.startLine);
        expect(chunk.distance).toBeGreaterThanOrEqual(0);
        expect(chunk.distance).toBeLessThanOrEqual(1);
      });
    });

    it("should cycle through file paths", () => {
      const chunks = createMockChunks(10);
      const paths = [...new Set(chunks.map((c) => c.filePath))];
      expect(paths.length).toBeLessThanOrEqual(5);
    });
  });

  describe("SAMPLE_CODE", () => {
    it("should have valid TypeScript-like code strings", () => {
      expect(SAMPLE_CODE.simpleFunction).toContain("export function add");
      expect(SAMPLE_CODE.complexClass).toContain("export class AgentService");
      expect(SAMPLE_CODE.reactComponent).toContain("import { useState");
      expect(SAMPLE_CODE.expressRoute).toContain("const router = Router()");
      expect(SAMPLE_CODE.vulnerableCode).toContain("eval(cmd)");
    });
  });
});
