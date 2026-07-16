import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { DependencyGraph } from "../graph/dependency-graph.js";
import {
  buildDependencyGraph,
  getBlastRadius,
  getDependents,
  getFileDependencies,
  invalidateGraphCache,
} from "../services/dependency-graph.service.js";

const FIXTURE_DIR = path.join(os.tmpdir(), "dep-graph-test-fixture");

function writeFile(relativePath: string, content: string) {
  const full = path.join(FIXTURE_DIR, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

beforeAll(() => {
  // Create fixture repo:
  // a.ts imports b.ts and c.ts
  // b.ts imports c.ts
  // c.ts imports nothing (leaf)
  // d.ts imports b.ts
  // e.ts imports nothing (disconnected)
  writeFile("src/a.ts", `import { foo } from "./b";\nimport { bar } from "./c";\n`);
  writeFile("src/b.ts", `import { baz } from "./c";\nexport const foo = 1;\n`);
  writeFile("src/c.ts", `export const baz = 1;\nexport const bar = 2;\n`);
  writeFile("src/d.ts", `import { foo } from "./b";\nexport const d = 1;\n`);
  writeFile("src/e.ts", `export const e = 1;\n`);
});

afterAll(() => {
  fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
});

describe("DependencyGraph class", () => {
  it("tracks dependencies and dependents", () => {
    const g = new DependencyGraph();
    g.addNode("a.ts", ["b.ts", "c.ts"]);
    g.addNode("b.ts", ["c.ts"]);
    g.addNode("c.ts", []);

    expect(g.getDependencies("a.ts")).toEqual(
      expect.arrayContaining(["b.ts", "c.ts"])
    );
    expect(g.getDependents("c.ts")).toEqual(
      expect.arrayContaining(["a.ts", "b.ts"])
    );
    expect(g.getDependents("a.ts")).toEqual([]);
  });

  it("calculates blast radius within depth", () => {
    const g = new DependencyGraph();
    g.addNode("a.ts", ["b.ts"]);
    g.addNode("b.ts", ["c.ts"]);
    g.addNode("c.ts", ["d.ts"]);
    g.addNode("d.ts", []);

    const radius = g.getBlastRadius("d.ts", 2);
    expect(radius).toEqual(expect.arrayContaining(["c.ts", "b.ts"]));
    expect(radius).not.toContain("a.ts"); // depth 2 from d: c(1) -> b(2)
  });

  it("detects circular dependencies", () => {
    const g = new DependencyGraph();
    g.addNode("a.ts", ["b.ts"]);
    g.addNode("b.ts", ["c.ts"]);
    g.addNode("c.ts", ["a.ts"]); // circular!

    const cycles = g.detectCircular();
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles[0]).toContain("a.ts");
  });

  it("returns empty blast radius for leaf nodes", () => {
    const g = new DependencyGraph();
    g.addNode("a.ts", ["b.ts"]);
    g.addNode("b.ts", []);

    const radius = g.getBlastRadius("b.ts", 3);
    expect(radius).toEqual([]);
  });
});

describe("buildDependencyGraph", () => {
  beforeAll(() => {
    invalidateGraphCache(FIXTURE_DIR);
  });

  it("builds graph from fixture repo", () => {
    const result = buildDependencyGraph(FIXTURE_DIR);

    expect(result.nodes.length).toBe(5);
    expect(result.edges.length).toBeGreaterThan(0);
    expect(result.analytics.nodeCount).toBe(5);
    expect(result.analytics.disconnectedFiles).toBeGreaterThanOrEqual(1); // e.ts
  });

  it("has correct node labels", () => {
    const result = buildDependencyGraph(FIXTURE_DIR);
    const labels = result.nodes.map((n) => n.label);

    expect(labels).toContain("a.ts");
    expect(labels).toContain("b.ts");
    expect(labels).toContain("c.ts");
    expect(labels).toContain("d.ts");
    expect(labels).toContain("e.ts");
  });
});

describe("getBlastRadius", () => {
  beforeAll(() => {
    invalidateGraphCache(FIXTURE_DIR);
    buildDependencyGraph(FIXTURE_DIR);
  });

  it("returns affected files for c.ts", () => {
    const result = getBlastRadius(FIXTURE_DIR, "src/c.ts", 2);

    expect(result.totalAffected).toBeGreaterThanOrEqual(2); // b.ts and a.ts depend on c.ts
    expect(result.affected.some((a) => a.file.includes("b.ts"))).toBe(true);
  });

  it("returns empty for disconnected file e.ts", () => {
    const result = getBlastRadius(FIXTURE_DIR, "src/e.ts", 3);

    expect(result.totalAffected).toBe(0);
  });
});

describe("getDependents", () => {
  beforeAll(() => {
    invalidateGraphCache(FIXTURE_DIR);
    buildDependencyGraph(FIXTURE_DIR);
  });

  it("returns files that import c.ts", () => {
    const deps = getDependents(FIXTURE_DIR, "src/c.ts");

    expect(deps).toEqual(expect.arrayContaining([
      expect.stringContaining("b.ts"),
      expect.stringContaining("a.ts"),
    ]));
  });

  it("returns empty for file nobody imports", () => {
    const deps = getDependents(FIXTURE_DIR, "src/e.ts");

    expect(deps).toEqual([]);
  });
});

describe("getFileDependencies", () => {
  beforeAll(() => {
    invalidateGraphCache(FIXTURE_DIR);
    buildDependencyGraph(FIXTURE_DIR);
  });

  it("returns files that a.ts imports", () => {
    const deps = getFileDependencies(FIXTURE_DIR, "src/a.ts");

    expect(deps).toEqual(expect.arrayContaining([
      expect.stringContaining("b.ts"),
      expect.stringContaining("c.ts"),
    ]));
  });

  it("returns empty for leaf file c.ts", () => {
    const deps = getFileDependencies(FIXTURE_DIR, "src/c.ts");

    expect(deps).toEqual([]);
  });
});
