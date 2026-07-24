import { describe, it, expect, vi } from "vitest";

const mockChunks = [
  {
    id: "c1", content: "function test() {}", filePath: "src/test.ts",
    startLine: 1, endLine: 1, distance: 0.2, repositoryId: "repo-123", codeChunkId: "cc-1",
  },
  {
    id: "c2", content: "class Service {}", filePath: "src/service.ts",
    startLine: 1, endLine: 1, distance: 0.4, repositoryId: "repo-123", codeChunkId: "cc-2",
  },
];

vi.mock("../../embeddings/embedding.service.js", () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
}));

vi.mock("../../vector/vector.repository.js", () => ({
  searchNearestChunks: vi.fn().mockImplementation((_emb: any, limit: number) => {
    return Promise.resolve(mockChunks.slice(0, limit));
  }),
}));

import { semanticSearch, multiQuerySearch } from "../../services/search.service.js";

describe("Search Service", () => {
  describe("semanticSearch", () => {
    it("should return chunks from vector search", async () => {
      const results = await semanticSearch("test function", 10, "repo-123");
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].filePath).toBe("src/test.ts");
    });

    it("should respect limit parameter", async () => {
      const results = await semanticSearch("test", 1, "repo-123");
      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe("multiQuerySearch", () => {
    it("should return merged results from multiple queries", async () => {
      const results = await multiQuerySearch("test function", 10, "repo-123");
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should deduplicate results", async () => {
      const results = await multiQuerySearch("test function", 10, "repo-123");
      const filePaths = results.map((r) => `${r.filePath}:${r.startLine}-${r.endLine}`);
      expect(new Set(filePaths).size).toBe(filePaths.length);
    });

    it("should sort by distance", async () => {
      const results = await multiQuerySearch("test function", 10, "repo-123");
      for (let i = 1; i < results.length; i++) {
        expect(results[i].distance).toBeGreaterThanOrEqual(results[i - 1].distance);
      }
    });
  });
});
