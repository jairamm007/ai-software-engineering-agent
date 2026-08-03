import type { DependencyGraph, InsightModule } from "../types.js";

export const buildDependencyGraph = (modules: InsightModule[]): DependencyGraph => {
  const nodes = modules.map((m) => ({
    id: m.path,
    label: m.name,
    group: "module",
  }));

  const edgeMap = new Map<string, { from: string; to: string; weight: number }>();
  for (const m of modules) {
    for (const dep of m.dependencies) {
      const key = `${m.path}->${dep}`;
      const existing = edgeMap.get(key);
      if (existing) {
        existing.weight += 1;
      } else {
        edgeMap.set(key, { from: m.path, to: dep, weight: 1 });
      }
    }
  }

  return { nodes, edges: [...edgeMap.values()].sort((a, b) => b.weight - a.weight) };
};
