import { describe, it, expect } from "vitest";
import { generateSummary } from "../../../modules/insights/generators/summary.generator.js";
import {
  detectModules,
  detectModuleCandidates,
} from "../../../modules/insights/generators/modules.generator.js";
import { buildDependencyGraph } from "../../../modules/insights/generators/dependencies.generator.js";

const sampleFiles = [
  { path: "src/pages/Home.tsx", extension: ".tsx", size: 100 },
  { path: "src/pages/About.tsx", extension: ".tsx", size: 100 },
  { path: "src/services/api.ts", extension: ".ts", size: 100 },
  { path: "src/services/auth.ts", extension: ".ts", size: 100 },
  { path: "src/models/user.ts", extension: ".ts", size: 100 },
  { path: "src/utils/format.ts", extension: ".ts", size: 100 },
  { path: "package.json", extension: ".json", size: 100 },
  { path: "README.md", extension: ".md", size: 100 },
];

describe("insights summary generator", () => {
  it("detects primary language and file/folder counts", () => {
    const summary = generateSummary({
      name: "demo-app",
      description: "A demo",
      localPath: null,
      files: sampleFiles,
      moduleCount: 4,
    });
    expect(summary.name).toBe("demo-app");
    expect(summary.primaryLanguage).toBe("TypeScript");
    expect(summary.totalFiles).toBe(8);
    expect(summary.totalFolders).toBe(5);
    expect(summary.moduleCount).toBe(4);
    expect(summary.description).toBe("A demo");
  });

  it("falls back to a default description when none available", () => {
    const summary = generateSummary({
      name: "bare",
      description: null,
      localPath: null,
      files: [],
      moduleCount: 0,
    });
    expect(summary.description).toContain("bare");
    expect(summary.primaryLanguage).toBe("Unknown");
  });
});

describe("insights modules generator", () => {
  it("detects module candidates from indexed files only", () => {
    const candidates = detectModuleCandidates(sampleFiles);
    expect(candidates.sort()).toEqual(["src"]);
  });

  it("only counts top-level folders that contain code", () => {
    const files = [
      { path: "src/index.ts", extension: ".ts", size: 10 },
      { path: "docs/guide.md", extension: ".md", size: 10 },
    ];
    const candidates = detectModuleCandidates(files);
    expect(candidates).toEqual(["src"]);
  });

  it("builds modules with inferred responsibilities and empty deps without a local path", () => {
    const modules = detectModules({ localPath: null, files: sampleFiles });
    expect(modules.length).toBeGreaterThan(0);
    const src = modules.find((m) => m.path === "src");
    expect(src?.responsibilities.length).toBeGreaterThan(0);
    expect(src?.dependencies).toEqual([]);
  });
});

describe("insights dependency graph", () => {
  it("builds nodes and edges from module dependencies", () => {
    const graph = buildDependencyGraph([
      {
        name: "Services",
        path: "services",
        fileCount: 2,
        lineCount: 10,
        responsibilities: [],
        dependencies: ["models", "utils"],
      },
      {
        name: "Models",
        path: "models",
        fileCount: 1,
        lineCount: 5,
        responsibilities: [],
        dependencies: [],
      },
      {
        name: "Utils",
        path: "utils",
        fileCount: 1,
        lineCount: 5,
        responsibilities: [],
        dependencies: [],
      },
    ]);
    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toEqual([{ from: "services", to: "models", weight: 1 }, { from: "services", to: "utils", weight: 1 }]);
  });
});
