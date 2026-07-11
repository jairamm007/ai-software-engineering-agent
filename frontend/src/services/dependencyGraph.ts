import api from "@/lib/axios";

import type { ApiResponse } from "@/types/api";

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

export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  analytics: DependencyGraphAnalytics;
}

export const getDependencyGraph = async (
  id: string
): Promise<DependencyGraph> => {
  const response = await api.get<ApiResponse<DependencyGraph>>(
    `/repository/${id}/dependency-graph`
  );

  return response.data.data;
};

export const summarizeDependencyGraph = async (id: string) => {
  const response = await api.post<ApiResponse<unknown>>(
    `/repository/${id}/dependency-graph/summary`
  );

  return response.data.data;
};
