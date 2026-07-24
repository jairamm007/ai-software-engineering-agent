import { describe, it, expect, vi, beforeEach } from "vitest";
import { reasonerAgent } from "../../agents/reasoner.agent.js";
import { createMockChunks } from "../utils/test-helpers.js";

vi.mock("../../rag/context-builder.js", () => ({
  buildContext: vi.fn().mockImplementation((chunks: any[]) => {
    if (!chunks || chunks.length === 0) {
      return "No relevant repository context found.";
    }
    return chunks
      .map((c: any) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`)
      .join("\n\n---\n\n");
  }),
}));

describe("Reasoner Agent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a valid reasoning result", async () => {
    const chunks = createMockChunks(3);
    const result = await reasonerAgent(chunks);

    expect(result).toBeDefined();
    expect(result.context).toBeTypeOf("string");
    expect(result.totalChunks).toBe(3);
    expect(result.chainOfThought).toBeInstanceOf(Array);
    expect(result.patterns).toBeInstanceOf(Array);
    expect(result.dependencies).toBeInstanceOf(Array);
    expect(result.complexity).toBeDefined();
    expect(result.keyFiles).toBeInstanceOf(Array);
  });

  it("should build context from chunks", async () => {
    const chunks = createMockChunks(2);
    const result = await reasonerAgent(chunks);

    expect(result.context).toContain("src/");
    expect(result.context.length).toBeGreaterThan(0);
  });

  it("should extract chain of thought", async () => {
    const chunks = createMockChunks(3);
    const result = await reasonerAgent(chunks);

    expect(result.chainOfThought.length).toBeGreaterThan(0);
    expect(result.chainOfThought[0]).toContain("relevant files");
  });

  it("should detect code patterns", async () => {
    const chunks = createMockChunks(3);
    const result = await reasonerAgent(chunks);

    expect(result.patterns).toBeInstanceOf(Array);
    result.patterns.forEach((p) => {
      expect(p).toBeTypeOf("string");
    });
  });

  it("should extract dependencies", async () => {
    const chunks = [
      {
        content: `import { something } from 'lodash';\nimport { helper } from './utils';`,
        filePath: "src/test.ts",
        startLine: 1,
        endLine: 2,
        distance: 0.2,
      },
    ];

    const result = await reasonerAgent(chunks as any);

    expect(result.dependencies).toContain("lodash");
    expect(result.dependencies).not.toContain("./utils");
  });

  it("should analyze complexity", async () => {
    const simpleChunks = [{ content: "const x = 1;", filePath: "a.ts", startLine: 1, endLine: 1, distance: 0.1 }];
    const result = await reasonerAgent(simpleChunks as any);

    expect(result.complexity).toBeDefined();
    expect(result.complexity.score).toBeGreaterThanOrEqual(0);
    expect(["low", "moderate", "high", "very_high", "none"]).toContain(result.complexity.level);
  });

  it("should identify key files", async () => {
    const chunks = createMockChunks(5);
    const result = await reasonerAgent(chunks);

    expect(result.keyFiles).toBeInstanceOf(Array);
    expect(result.keyFiles.length).toBeGreaterThan(0);
    expect(result.keyFiles.length).toBeLessThanOrEqual(10);
  });

  it("should handle empty chunks", async () => {
    const result = await reasonerAgent([]);

    expect(result.totalChunks).toBe(0);
    expect(result.context).toContain("No relevant repository context");
    expect(result.complexity.level).toBe("none");
  });

  it("should prioritize files by relevance", async () => {
    const chunks = [
      { content: "function a() {}", filePath: "high-relevance.ts", startLine: 1, endLine: 1, distance: 0.1 },
      { content: "function b() {}", filePath: "low-relevance.ts", startLine: 1, endLine: 1, distance: 0.8 },
    ];

    const result = await reasonerAgent(chunks as any);
    expect(result.keyFiles[0]).toBe("high-relevance.ts");
  });
});
