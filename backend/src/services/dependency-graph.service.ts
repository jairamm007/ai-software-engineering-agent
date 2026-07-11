import fs from "fs";
import path from "path";

import { parseRepository } from "../parser/repository-parser.js";

export interface DependencyGraphNode {
  id: string;
  label: string;
  isCircular: boolean;
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
}

export interface DependencyGraphResult {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  analytics: DependencyGraphAnalytics;
}

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
    path.join(resolvedPath, "index.ts"),
    path.join(resolvedPath, "index.tsx"),
    path.join(resolvedPath, "index.js"),
  ];

  return candidates.find((candidate) => availablePaths.has(candidate)) ?? null;
};

const getImportStatement = (sourcePath: string, importPath: string) => {
  const content = fs.readFileSync(sourcePath, "utf8");
  const statement = content
    .split(/\r?\n/)
    .find((line) =>
      line.includes(importPath) &&
      (/^\s*import\b/.test(line) || /^\s*export\b/.test(line))
    );

  return statement?.trim() ?? `import … from "${importPath}"`;
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

export const buildDependencyGraph = (
  repositoryPath: string
): DependencyGraphResult => {
  const parsedFiles = parseRepository(repositoryPath);
  const availablePaths = new Set(parsedFiles.map((file) => file.path));
  const baseNodes = parsedFiles.map((file) => ({
    id: toGraphPath(repositoryPath, file.path),
    label: path.basename(file.path),
  }));
  const edgeKeys = new Set<string>();
  const edges: DependencyGraphEdge[] = [];

  for (const file of parsedFiles) {
    const source = toGraphPath(repositoryPath, file.path);

    for (const importPath of file.imports) {
      const targetPath = resolveImport(
        file.path,
        importPath,
        availablePaths
      );

      if (!targetPath) {
        continue;
      }

      const target = toGraphPath(repositoryPath, targetPath);
      const edgeKey = `${source}->${target}`;

      if (!edgeKeys.has(edgeKey)) {
        edgeKeys.add(edgeKey);
        edges.push({
          source,
          target,
          importPath,
          importStatement: getImportStatement(file.path, importPath),
          isCircular: false,
        });
      }
    }
  }

  const circularNodes = findCircularNodes(baseNodes.map((node) => node.id), edges);
  const nodes = baseNodes.map((node) => ({
    ...node,
    isCircular: circularNodes.has(node.id),
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
      averageDependencies: nodes.length ? Number((graphEdges.length / nodes.length).toFixed(1)) : 0,
      circularDependencies: circularNodes.size,
      disconnectedFiles: nodes.filter((node) => !connected.has(node.id)).length,
    },
  };
};
