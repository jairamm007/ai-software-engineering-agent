import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface FolderNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  children?: FolderNode[];
  extension?: string;
}

export interface LanguageStat {
  language: string;
  files: number;
  lines: number;
  bytes: number;
  percentage: number;
  color: string;
}

export interface ComplexityResult {
  file: string;
  extension: string;
  lines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functions: number;
  classes: number;
  complexity: number;
  maintainabilityIndex: number;
}

export interface ImportGraphEdge {
  source: string;
  target: string;
  importType: "named" | "default" | "namespace" | "side-effect";
  specifiers: string[];
}

export interface ImportGraphNode {
  id: string;
  file: string;
  imports: number;
  importedBy: number;
  isExternal: boolean;
}

export interface ImportGraphResult {
  nodes: ImportGraphNode[];
  edges: ImportGraphEdge[];
  clusters: { name: string; files: string[] }[];
  externalDependencies: string[];
}

export interface CallGraphFunction {
  name: string;
  file: string;
  line: number;
  endLine: number;
  calls: string[];
  calledBy: string[];
  params: number;
  isExported: boolean;
}

export interface CallGraphResult {
  functions: CallGraphFunction[];
  edges: { source: string; target: string; file: string }[];
  orphanFunctions: string[];
  highlyConnected: { name: string; connections: number }[];
}

export interface ArchitectureModule {
  id: string;
  name: string;
  type: "service" | "controller" | "model" | "route" | "util" | "component" | "page" | "hook" | "context" | "config" | "test" | "other";
  files: string[];
  dependencies: string[];
  lineCount: number;
}

export interface ArchitectureResult {
  modules: ArchitectureModule[];
  layers: { name: string; modules: string[] }[];
  suggestions: string[];
}

export const getFolderTree = async (id: string): Promise<FolderNode> => {
  const response = await api.get<ApiResponse<FolderNode>>(`/repository/${id}/intelligence/folder-tree`);
  return response.data.data;
};

export const getLanguageStatistics = async (id: string): Promise<LanguageStat[]> => {
  const response = await api.get<ApiResponse<LanguageStat[]>>(`/repository/${id}/intelligence/languages`);
  return response.data.data;
};

export const getComplexityAnalysis = async (id: string): Promise<ComplexityResult[]> => {
  const response = await api.get<ApiResponse<ComplexityResult[]>>(`/repository/${id}/intelligence/complexity`);
  return response.data.data;
};

export const getImportGraph = async (id: string): Promise<ImportGraphResult> => {
  const response = await api.get<ApiResponse<ImportGraphResult>>(`/repository/${id}/intelligence/import-graph`);
  return response.data.data;
};

export const getCallGraph = async (id: string): Promise<CallGraphResult> => {
  const response = await api.get<ApiResponse<CallGraphResult>>(`/repository/${id}/intelligence/call-graph`);
  return response.data.data;
};

export const getArchitectureDiagram = async (id: string): Promise<ArchitectureResult> => {
  const response = await api.get<ApiResponse<ArchitectureResult>>(`/repository/${id}/intelligence/architecture`);
  return response.data.data;
};
