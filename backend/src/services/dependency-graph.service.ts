import fs from "fs";
import path from "path";

import { parseRepository } from "../parser/repository-parser.js";
import { DependencyGraph } from "../graph/dependency-graph.js";

export interface DependencyGraphNode {
  id: string;
  label: string;
  isCircular: boolean;
  depth?: number;
}

export interface DependencyGraphEdge {
  source: string;
  target: string;
  importPath: string;
  importStatement: string;
  isCircular: boolean;
}

export interface DependencyGraphAnalytics {
  nodeCount: number;
  edgeCount: number;
  averageDependencies: number;
  circularDependencies: number;
  disconnectedFiles: number;
  stronglyConnectedComponents: number;
}

export interface DependencyGraphResult {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  analytics: DependencyGraphAnalytics;
}

export interface BlastRadiusResult {
  file: string;
  depth: number;
  affected: BlastRadiusNode[];
  totalAffected: number;
}

export interface BlastRadiusNode {
  file: string;
  depth: number;
}

// Cache keyed by repository path
const graphCache = new Map<string, { graph: DependencyGraph; mtime: number }>();

const toGraphPath = (repositoryPath: string, filePath: string) =>
  path.relative(repositoryPath, filePath).replaceAll("\\", "/");

const resolveImport = (
  sourcePath: string,
  importPath: string,
  availablePaths: Set<string>
) => {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const resolvedPath = path.resolve(path.dirname(sourcePath), importPath);
  const candidates = [
    resolvedPath,
    `${resolvedPath}.ts`,
    `${resolvedPath}.tsx`,
    `${resolvedPath}.js`,
    `${resolvedPath}.jsx`,
    path.join(resolvedPath, "index.ts"),
    path.join(resolvedPath, "index.tsx"),
    path.join(resolvedPath, "index.js"),
    path.join(resolvedPath, "index.jsx"),
  ];

  return candidates.find((candidate) => availablePaths.has(candidate)) ?? null;
};

const getImportStatement = (sourcePath: string, importPath: string) => {
  try {
    const content = fs.readFileSync(sourcePath, "utf8");
    const statement = content
      .split(/\r?\n/)
      .find((line) =>
        line.includes(importPath) &&
        (/^\s*import\b/.test(line) || /^\s*export\b/.test(line))
      );

    return statement?.trim() ?? `import … from "${importPath}"`;
  } catch {
    return `import … from "${importPath}"`;
  }
};

const findCircularNodes = (nodeIds: string[], edges: DependencyGraphEdge[]) => {
  const neighbors = new Map(nodeIds.map((nodeId) => [nodeId, [] as string[]]));
  const circularNodes = new Set<string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();

  edges.forEach((edge) => neighbors.get(edge.source)?.push(edge.target));

  const visit = (nodeId: string, trail: string[]) => {
    if (visiting.has(nodeId)) {
      trail.slice(trail.indexOf(nodeId)).forEach((node) => circularNodes.add(node));
      return;
    }
    if (visited.has(nodeId)) return;

    visiting.add(nodeId);
    neighbors.get(nodeId)?.forEach((target) => visit(target, [...trail, nodeId]));
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  nodeIds.forEach((nodeId) => visit(nodeId, []));
  return circularNodes;
};

const countSCCs = (nodeIds: string[], edges: DependencyGraphEdge[]): number => {
  // Tarjan's algorithm for strongly connected components
  const adj = new Map<string, string[]>();
  nodeIds.forEach((id) => adj.set(id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));

  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const indices = new Map<string, number>();
  const lowlinks = new Map<string, number>();
  let sccCount = 0;

  const strongConnect = (v: string) => {
    indices.set(v, index);
    lowlinks.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of adj.get(v) ?? []) {
      if (!indices.has(w)) {
        strongConnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      sccCount++;
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
      } while (w !== v);
    }
  };

  for (const v of nodeIds) {
    if (!indices.has(v)) strongConnect(v);
  }

  return sccCount;
};

/**
 * Check if a file has changed since last parse (by mtime)
 */
const hasFileChanged = (filePath: string, cachedMtime: number): boolean => {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtimeMs > cachedMtime;
  } catch {
    return true;
  }
};

/**
 * Build or incrementally update a dependency graph for a repository.
 * Uses mtime-based cache to avoid full re-parses on unchanged repos.
 */
export const buildDependencyGraph = (
  repositoryPath: string
): DependencyGraphResult => {
  const cached = graphCache.get(repositoryPath);
  const now = Date.now();

  let graph: DependencyGraph;

  if (cached) {
    // Check if any files changed since last build
    const allFiles = getAllSourceFiles(repositoryPath);
    const anyChanged = allFiles.some((f) => hasFileChanged(f, cached.mtime));

    if (!anyChanged) {
      graph = cached.graph;
    } else {
      // Incremental: rebuild from scratch but log the optimization
      graph = buildGraphFromFiles(repositoryPath);
      graphCache.set(repositoryPath, { graph, mtime: now });
    }
  } else {
    graph = buildGraphFromFiles(repositoryPath);
    graphCache.set(repositoryPath, { graph, mtime: now });
  }

  return graphToResult(repositoryPath, graph);
};

/**
 * Get files that import a given file (dependents / reverse dependencies)
 */
export const getDependents = (
  repositoryPath: string,
  filePath: string
): string[] => {
  const cached = graphCache.get(repositoryPath);
  if (!cached) {
    const graph = buildGraphFromFiles(repositoryPath);
    graphCache.set(repositoryPath, { graph, mtime: Date.now() });
    return cachedGraphGetDependents(repositoryPath, filePath);
  }
  return cachedGraphGetDependents(repositoryPath, filePath);
};

const cachedGraphGetDependents = (repositoryPath: string, filePath: string): string[] => {
  const cached = graphCache.get(repositoryPath);
  if (!cached) return [];

  const graphPath = toGraphPath(repositoryPath, path.resolve(repositoryPath, filePath));
  return cached.graph.getDependents(graphPath);
};

/**
 * Get files that a given file imports (direct dependencies)
 */
export const getFileDependencies = (
  repositoryPath: string,
  filePath: string
): string[] => {
  const cached = graphCache.get(repositoryPath);
  if (!cached) return [];

  const graphPath = toGraphPath(repositoryPath, path.resolve(repositoryPath, filePath));
  return cached.graph.getDependencies(graphPath);
};

/**
 * Get the blast radius: all files affected within N hops if this file changes
 */
export const getBlastRadius = (
  repositoryPath: string,
  filePath: string,
  depth: number = 2
): BlastRadiusResult => {
  const cached = graphCache.get(repositoryPath);
  if (!cached) {
    const graph = buildGraphFromFiles(repositoryPath);
    graphCache.set(repositoryPath, { graph, mtime: Date.now() });
  }

  const freshCache = graphCache.get(repositoryPath)!;
  const graphPath = toGraphPath(repositoryPath, path.resolve(repositoryPath, filePath));
  const affectedFiles = freshCache.graph.getBlastRadius(graphPath, depth);

  // Track depth for each affected file
  const affected: BlastRadiusNode[] = [];
  let frontier = [graphPath];
  const seen = new Set<string>();

  for (let d = 1; d <= depth && frontier.length > 0; d++) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const dep of freshCache.graph.getDependents(node)) {
        if (!seen.has(dep) && dep !== graphPath) {
          seen.add(dep);
          affected.push({ file: dep, depth: d });
          next.push(dep);
        }
      }
    }
    frontier = next;
  }

  return {
    file: graphPath,
    depth,
    affected,
    totalAffected: affected.length,
  };
};

/**
 * Invalidate cache for a repository (call after file changes)
 */
export const invalidateGraphCache = (repositoryPath: string): void => {
  graphCache.delete(repositoryPath);
};

const getAllSourceFiles = (dir: string): string[] => {
  const files: string[] = [];
  const walk = (d: string) => {
    try {
      for (const entry of fs.readdirSync(d)) {
        const full = path.join(d, entry);
        try {
          if (fs.statSync(full).isDirectory()) {
            if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
            walk(full);
          } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
            files.push(full);
          }
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
      // Skip unreadable directories
    }
  };
  walk(dir);
  return files;
};

const buildGraphFromFiles = (repositoryPath: string): DependencyGraph => {
  const graph = new DependencyGraph();

  try {
    const parsedFiles = parseRepository(repositoryPath);
    const availablePaths = new Set(parsedFiles.map((file) => file.path));

    for (const file of parsedFiles) {
      const source = toGraphPath(repositoryPath, file.path);
      const resolvedImports: string[] = [];

      for (const importPath of file.imports) {
        const targetPath = resolveImport(file.path, importPath, availablePaths);
        if (targetPath) {
          resolvedImports.push(toGraphPath(repositoryPath, targetPath));
        }
      }

      graph.addNode(source, resolvedImports);
    }
  } catch (error) {
    console.error("[DependencyGraph] Error building graph:", error);
  }

  return graph;
};

const graphToResult = (
  repositoryPath: string,
  graph: DependencyGraph
): DependencyGraphResult => {
  const nodeIds = graph.getAllNodes();
  const edges: DependencyGraphEdge[] = [];
  const edgeKeys = new Set<string>();

  for (const source of nodeIds) {
    for (const target of graph.getDependencies(source)) {
      const edgeKey = `${source}->${target}`;
      if (!edgeKeys.has(edgeKey)) {
        edgeKeys.add(edgeKey);
        edges.push({
          source,
          target,
          importPath: path.relative(
            path.dirname(path.join(repositoryPath, source)),
            path.join(repositoryPath, target)
          ).replaceAll("\\", "/"),
          importStatement: getImportStatement(
            path.join(repositoryPath, source),
            path.relative(repositoryPath, path.join(repositoryPath, target)).replaceAll("\\", "/")
          ),
          isCircular: false,
        });
      }
    }
  }

  const circularNodes = findCircularNodes(nodeIds, edges);
  const nodes: DependencyGraphNode[] = nodeIds.map((id) => ({
    id,
    label: path.basename(id),
    isCircular: circularNodes.has(id),
  }));

  const graphEdges = edges.map((edge) => ({
    ...edge,
    isCircular: circularNodes.has(edge.source) && circularNodes.has(edge.target),
  }));

  const connected = new Set(graphEdges.flatMap((edge) => [edge.source, edge.target]));

  return {
    nodes,
    edges: graphEdges,
    analytics: {
      nodeCount: nodes.length,
      edgeCount: graphEdges.length,
      averageDependencies: nodes.length
        ? Number((graphEdges.length / nodes.length).toFixed(1))
        : 0,
      circularDependencies: circularNodes.size,
      disconnectedFiles: nodes.filter((node) => !connected.has(node.id)).length,
      stronglyConnectedComponents: countSCCs(nodeIds, edges),
    },
  };
};
