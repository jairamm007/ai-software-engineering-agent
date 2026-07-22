import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface ReadmeSection {
  title: string;
  content: string;
  level: number;
}

export interface ReadmeResult {
  title: string;
  description: string;
  sections: ReadmeSection[];
  badges: string[];
  rawMarkdown: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  handler: string;
  auth: boolean;
  description: string;
  file: string;
  line: number;
}

export interface ApiDocGroup {
  group: string;
  prefix: string;
  endpoints: ApiEndpoint[];
}

export interface ApiDocsResult {
  groups: ApiDocGroup[];
  totalEndpoints: number;
  authEndpoints: number;
  publicEndpoints: number;
}

export interface FunctionDoc {
  name: string;
  file: string;
  line: number;
  endLine: number;
  params: { name: string; type: string; description: string; optional: boolean; default?: string }[];
  returnType: string;
  description: string;
  examples: string[];
  isExported: boolean;
  isAsync: boolean;
  complexity: number;
  tags: string[];
}

export interface ClassDoc {
  name: string;
  file: string;
  line: number;
  endLine: number;
  description: string;
  extends: string | null;
  implements: string[];
  methods: { name: string; params: string; returnType: string; description: string; line: number; isStatic: boolean; visibility: string }[];
  properties: { name: string; type: string; description: string; line: number; visibility: string }[];
  constructor: { params: string; description: string } | null;
  isExported: boolean;
  tags: string[];
}

export interface ArchModule {
  name: string;
  path: string;
  fileCount: number;
  lineCount: number;
  description: string;
  exports: string[];
}

export interface ArchDependency {
  from: string;
  to: string;
  weight: number;
}

export interface ArchitectureDocsResult {
  modules: ArchModule[];
  dependencies: ArchDependency[];
  layers: { name: string; modules: string[] }[];
  entryPoints: string[];
  summary: string;
}

export interface DocGeneratorResult {
  readme: ReadmeResult;
  apiDocs: ApiDocsResult;
  functionDocs: FunctionDoc[];
  classDocs: ClassDoc[];
  architecture: ArchitectureDocsResult;
}

export const generateAllDocs = async (id: string): Promise<DocGeneratorResult> => {
  const response = await api.get<ApiResponse<DocGeneratorResult>>(`/repository/${id}/documentation/all`);
  return response.data.data;
};

export const generateReadme = async (id: string): Promise<ReadmeResult> => {
  const response = await api.get<ApiResponse<ReadmeResult>>(`/repository/${id}/documentation/readme`);
  return response.data.data;
};

export const generateApiDocs = async (id: string): Promise<ApiDocsResult> => {
  const response = await api.get<ApiResponse<ApiDocsResult>>(`/repository/${id}/documentation/api-docs`);
  return response.data.data;
};

export const generateFunctionDocs = async (id: string): Promise<FunctionDoc[]> => {
  const response = await api.get<ApiResponse<FunctionDoc[]>>(`/repository/${id}/documentation/functions`);
  return response.data.data;
};

export const generateClassDocs = async (id: string): Promise<ClassDoc[]> => {
  const response = await api.get<ApiResponse<ClassDoc[]>>(`/repository/${id}/documentation/classes`);
  return response.data.data;
};

export const generateArchitectureDocs = async (id: string): Promise<ArchitectureDocsResult> => {
  const response = await api.get<ApiResponse<ArchitectureDocsResult>>(`/repository/${id}/documentation/architecture`);
  return response.data.data;
};
