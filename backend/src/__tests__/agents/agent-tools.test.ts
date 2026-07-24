import { describe, it, expect } from "vitest";
import {
  registerTool,
  getTool,
  getAllTools,
  getToolsForAgent,
  describeTools,
} from "../../agents/agent-tools.js";

describe("Agent Tools", () => {
  describe("Tool Registration", () => {
    it("should register and retrieve a tool", () => {
      const tool = getTool("analyze_query_complexity");
      expect(tool).toBeDefined();
      expect(tool!.name).toBe("analyze_query_complexity");
      expect(tool!.description).toBeTypeOf("string");
      expect(tool!.parameters).toBeInstanceOf(Array);
      expect(tool!.execute).toBeTypeOf("function");
    });

    it("should return all registered tools", () => {
      const tools = getAllTools();
      expect(tools.length).toBeGreaterThan(0);
      tools.forEach((t) => {
        expect(t.name).toBeTypeOf("string");
        expect(t.description).toBeTypeOf("string");
        expect(t.execute).toBeTypeOf("function");
      });
    });

    it("should return undefined for non-existent tool", () => {
      expect(getTool("nonexistent")).toBeUndefined();
    });
  });

  describe("analyze_query_complexity tool", () => {
    it("should analyze simple queries", async () => {
      const tool = getTool("analyze_query_complexity")!;
      const result = await tool.execute({ query: "hello" }, {});
      expect(result.success).toBe(true);
      const data = result.data as { complexity: string; wordCount: number };
      expect(data.complexity).toBe("simple");
      expect(data.wordCount).toBe(1);
    });

    it("should analyze complex queries", async () => {
      const tool = getTool("analyze_query_complexity")!;
      const result = await tool.execute(
        { query: "Review this file function and fix the error and generate tests and audit security" },
        {}
      );
      const data = result.data as { complexity: string; hasCodeRefs: boolean; hasAction: boolean };
      expect(data.hasCodeRefs).toBe(true);
      expect(data.hasAction).toBe(true);
    });
  });

  describe("extract_entities tool", () => {
    it("should extract file references", async () => {
      const tool = getTool("extract_entities")!;
      const result = await tool.execute(
        { query: "Review `src/index.ts` and fix `utils/helper.ts`" },
        {}
      );
      expect(result.success).toBe(true);
      const data = result.data as { files: string[] };
      expect(data.files).toContain("src/index.ts");
      expect(data.files).toContain("utils/helper.ts");
    });
  });

  describe("search_variants tool", () => {
    it("should generate search variants", async () => {
      const tool = getTool("search_variants")!;
      const result = await tool.execute(
        { query: "review authentication middleware", taskType: "review" },
        {}
      );
      expect(result.success).toBe(true);
      const data = result.data as string[];
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toBe("review authentication middleware");
    });

    it("should include task-specific variants", async () => {
      const tool = getTool("search_variants")!;
      const result = await tool.execute(
        { query: "security check auth token validation", taskType: "security" },
        {}
      );
      const data = result.data as string[];
      expect(data.some((v) => v.includes("vulnerability"))).toBe(true);
    });
  });

  describe("analyze_complexity tool", () => {
    it("should analyze code complexity", async () => {
      const tool = getTool("analyze_complexity")!;
      const code = `function test() {
        if (a) {
          for (let i = 0; i < 10; i++) {
            if (b) { while (c) {} }
          }
        }
      }`;
      const result = await tool.execute({ code }, {});
      expect(result.success).toBe(true);
      const data = result.data as { lineCount: number; cyclomaticComplexity: number; complexity: string };
      expect(data.lineCount).toBeGreaterThan(0);
      expect(data.cyclomaticComplexity).toBeGreaterThan(1);
    });
  });

  describe("scan_vulnerabilities tool", () => {
    it("should detect eval() injection", async () => {
      const tool = getTool("scan_vulnerabilities")!;
      const result = await tool.execute(
        { code: 'eval(userInput);', language: "javascript" },
        {}
      );
      expect(result.success).toBe(true);
      const data = result.data as Array<{ type: string; severity: string }>;
      expect(data.some((v) => v.type.includes("eval"))).toBe(true);
    });

    it("should detect XSS via innerHTML", async () => {
      const tool = getTool("scan_vulnerabilities")!;
      const result = await tool.execute(
        { code: 'document.body.innerHTML = userInput;' },
        {}
      );
      const data = result.data as Array<{ type: string }>;
      expect(data.some((v) => v.type.includes("innerHTML"))).toBe(true);
    });

    it("should detect hardcoded secrets", async () => {
      const tool = getTool("scan_vulnerabilities")!;
      const result = await tool.execute(
        { code: 'const password = "admin123";\nconst apiKey = "sk-live-abc123";' },
        {}
      );
      const data = result.data as Array<{ type: string }>;
      expect(data.some((v) => v.type.includes("Password"))).toBe(true);
    });

    it("should return empty for clean code", async () => {
      const tool = getTool("scan_vulnerabilities")!;
      const result = await tool.execute(
        { code: 'const x = 1;\nconst y = 2;\nconst z = x + y;' },
        {}
      );
      const data = result.data as Array<{ type: string }>;
      expect(data).toHaveLength(0);
    });
  });

  describe("validate_syntax tool", () => {
    it("should detect mismatched braces", async () => {
      const tool = getTool("validate_syntax")!;
      const result = await tool.execute(
        { code: 'function test() { return 1;' },
        {}
      );
      const data = result.data as { valid: boolean; issues: string[] };
      expect(data.valid).toBe(false);
      expect(data.issues.length).toBeGreaterThan(0);
    });

    it("should pass valid syntax", async () => {
      const tool = getTool("validate_syntax")!;
      const result = await tool.execute(
        { code: 'function test() { return 1; }' },
        {}
      );
      const data = result.data as { valid: boolean };
      expect(data.valid).toBe(true);
    });
  });

  describe("generate_test_cases tool", () => {
    it("should generate test case definitions", async () => {
      const tool = getTool("generate_test_cases")!;
      const result = await tool.execute(
        { functionName: "add", parameters: "a: number, b: number", returnType: "number" },
        {}
      );
      expect(result.success).toBe(true);
      const data = result.data as Array<{ name: string; type: string }>;
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].name).toContain("add");
    });
  });

  describe("getToolsForAgent", () => {
    it("should return tools for a specific agent type", () => {
      const tools = getToolsForAgent("security");
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name === "scan_vulnerabilities")).toBe(true);
    });

    it("should return empty array for unknown agent type", () => {
      const tools = getToolsForAgent("nonexistent");
      expect(tools).toHaveLength(0);
    });
  });

  describe("describeTools", () => {
    it("should produce a readable description", () => {
      const tools = getAllTools().slice(0, 3);
      const desc = describeTools(tools);
      expect(desc).toBeTypeOf("string");
      expect(desc.length).toBeGreaterThan(0);
      expect(desc).toContain("analyze_query_complexity");
    });
  });

  describe("generate_diff tool", () => {
    it("should compute line differences", async () => {
      const tool = getTool("generate_diff")!;
      const result = await tool.execute(
        {
          original: "line1\nline2\nline3",
          improved: "line1\nline2-modified\nline3\nline4",
        },
        {}
      );
      expect(result.success).toBe(true);
      const data = result.data as { addedCount: number; removedCount: number };
      expect(data.addedCount).toBeGreaterThanOrEqual(0);
      expect(data.removedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("extract_dependencies tool", () => {
    it("should extract external imports", async () => {
      const tool = getTool("extract_dependencies")!;
      const result = await tool.execute(
        { code: "import { Router } from 'express';\nimport { helper } from './local';" },
        {}
      );
      const data = result.data as string[];
      expect(data.some((d) => d.includes("Router"))).toBe(true);
      expect(data.some((d) => d.includes("express"))).toBe(true);
    });
  });
});
