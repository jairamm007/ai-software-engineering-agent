import { describe, it, expect } from "vitest";
import { buildContext } from "../../rag/context-builder.js";
import { createMockChunks } from "../utils/test-helpers.js";

describe("Context Builder", () => {
  describe("buildContext", () => {
    it("should return a no-context message for empty chunks", () => {
      const result = buildContext([]);
      expect(result).toContain("No relevant repository context found");
    });

    it("should build context from chunks", () => {
      const chunks = createMockChunks(3);
      const result = buildContext(chunks);
      expect(result).toContain("Files");
      expect(result).toContain("chunks");
      expect(result).toContain("src/");
      expect(result.length).toBeGreaterThan(50);
    });

    it("should group chunks by file", () => {
      const chunks = [
        { content: "chunk1", filePath: "a.ts", startLine: 1, endLine: 5, distance: 0.2 },
        { content: "chunk2", filePath: "a.ts", startLine: 6, endLine: 10, distance: 0.3 },
        { content: "chunk3", filePath: "b.ts", startLine: 1, endLine: 5, distance: 0.4 },
      ];
      const result = buildContext(chunks as any);
      expect(result).toContain("a.ts");
      expect(result).toContain("b.ts");
    });

    it("should deduplicate chunks", () => {
      const chunk = { content: "dup", filePath: "x.ts", startLine: 1, endLine: 5, distance: 0.1 };
      const result = buildContext([chunk, chunk, chunk] as any);
      const occurrences = result.split("x.ts:L1-5").length - 1;
      expect(occurrences).toBe(1);
    });

    it("should sort files by relevance (distance)", () => {
      const chunks = [
        { content: "far", filePath: "far.ts", startLine: 1, endLine: 1, distance: 0.8 },
        { content: "near", filePath: "near.ts", startLine: 1, endLine: 1, distance: 0.1 },
      ];
      const result = buildContext(chunks as any);
      const nearPos = result.indexOf("near.ts");
      const farPos = result.indexOf("far.ts");
      expect(nearPos).toBeLessThan(farPos);
    });

    it("should mark relevance with symbols", () => {
      const chunks = [
        { content: "high", filePath: "h.ts", startLine: 1, endLine: 1, distance: 0.1 },
        { content: "low", filePath: "l.ts", startLine: 1, endLine: 1, distance: 0.8 },
      ];
      const result = buildContext(chunks as any);
      expect(result).toContain("★");
      expect(result).toContain("○");
    });

    it("should sort chunks within a file by start line", () => {
      const chunks = [
        { content: "second", filePath: "f.ts", startLine: 10, endLine: 20, distance: 0.2 },
        { content: "first", filePath: "f.ts", startLine: 1, endLine: 5, distance: 0.1 },
      ];
      const result = buildContext(chunks as any);
      const firstPos = result.indexOf("first");
      const secondPos = result.indexOf("second");
      expect(firstPos).toBeLessThan(secondPos);
    });
  });
});
