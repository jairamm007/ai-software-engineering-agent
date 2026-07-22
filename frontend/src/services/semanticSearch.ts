import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface SemanticChunk {
  repository: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  distance: number;
}

export interface FileSearchResult {
  path: string;
  name: string;
  extension: string;
  size: number;
  lines: number;
  modifiedAt: string;
}

export interface FunctionSearchResult {
  name: string;
  file: string;
  line: number;
  endLine: number;
  exported: boolean;
  params: number;
}

export interface ClassSearchResult {
  name: string;
  file: string;
  line: number;
  endLine: number;
  exported: boolean;
  methods: number;
}

export interface SearchFilters {
  language?: string;
  extension?: string;
  minLines?: number;
  maxLines?: number;
  path?: string;
}

export interface CombinedSearchResult {
  semantic: SemanticChunk[];
  files: FileSearchResult[];
  functions: FunctionSearchResult[];
  classes: ClassSearchResult[];
  totalResults: number;
}

export const combinedSearch = async (
  id: string,
  q: string,
  filters?: SearchFilters
): Promise<CombinedSearchResult> => {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (filters?.language) params.language = filters.language;
  if (filters?.extension) params.extension = filters.extension;
  if (filters?.minLines) params.minLines = String(filters.minLines);
  if (filters?.maxLines) params.maxLines = String(filters.maxLines);
  if (filters?.path) params.path = filters.path;

  const response = await api.get<ApiResponse<CombinedSearchResult>>(
    `/repository/${id}/search`,
    { params }
  );
  return response.data.data;
};

export const semanticSearch = async (
  id: string,
  q: string,
  limit = 10
): Promise<SemanticChunk[]> => {
  const response = await api.get<ApiResponse<SemanticChunk[]>>(
    `/repository/${id}/search/semantic`,
    { params: { q, limit } }
  );
  return response.data.data;
};

export const searchFiles = async (
  id: string,
  q: string,
  filters?: SearchFilters
): Promise<FileSearchResult[]> => {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (filters?.language) params.language = filters.language;
  if (filters?.extension) params.extension = filters.extension;
  if (filters?.minLines) params.minLines = String(filters.minLines);
  if (filters?.maxLines) params.maxLines = String(filters.maxLines);
  if (filters?.path) params.path = filters.path;

  const response = await api.get<ApiResponse<FileSearchResult[]>>(
    `/repository/${id}/search/files`,
    { params }
  );
  return response.data.data;
};

export const searchFunctions = async (
  id: string,
  q: string,
  filters?: SearchFilters
): Promise<FunctionSearchResult[]> => {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (filters?.language) params.language = filters.language;

  const response = await api.get<ApiResponse<FunctionSearchResult[]>>(
    `/repository/${id}/search/functions`,
    { params }
  );
  return response.data.data;
};

export const searchClasses = async (
  id: string,
  q: string,
  filters?: SearchFilters
): Promise<ClassSearchResult[]> => {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (filters?.language) params.language = filters.language;

  const response = await api.get<ApiResponse<ClassSearchResult[]>>(
    `/repository/${id}/search/classes`,
    { params }
  );
  return response.data.data;
};
