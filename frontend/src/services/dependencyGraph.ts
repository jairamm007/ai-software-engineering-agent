import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";

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

export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  analytics: DependencyGraphAnalytics;
}

export interface BlastRadiusNode {
  file: string;
  depth: number;
}

export interface BlastRadiusResult {
  file: string;
  depth: number;
  affected: BlastRadiusNode[];
  totalAffected: number;
}

export interface FileDependencies {
  file: string;
  dependents: string[];
  dependencies: string[];
}

export const getDependencyGraph = async (
  id: string
): Promise<DependencyGraph> => {
  const response = await api.get<ApiResponse<DependencyGraph>>(
    `/repository/${id}/dependency-graph`
  );

  return response.data.data;
};

export const getFileDependencies = async (
  id: string,
  filePath: string
): Promise<FileDependencies> => {
  const response = await api.get<ApiResponse<FileDependencies>>(
    `/repository/${id}/dependency-graph/dependents`,
    { params: { file: filePath } }
  );

  return response.data.data;
};

export const getBlastRadius = async (
  id: string,
  filePath: string,
  depth: number = 2
): Promise<BlastRadiusResult> => {
  const response = await api.get<ApiResponse<BlastRadiusResult>>(
    `/repository/${id}/dependency-graph/blast-radius`,
    { params: { file: filePath, depth } }
  );

  return response.data.data;
};

export const invalidateGraphCache = async (id: string): Promise<void> => {
  await api.post(`/repository/${id}/dependency-graph/invalidate`);
};

export const summarizeDependencyGraph = async (id: string, signal?: AbortSignal) => {
  const response = await api.post<ApiResponse<unknown>>(
    `/repository/${id}/dependency-graph/summary`,
    undefined,
    { signal }
  );

  return response.data.data;
};
