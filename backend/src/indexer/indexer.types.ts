import { CodeChunk } from "../rag/rag.types.js";

export interface IndexedFile {
  path: string;
  extension: string;
  size: number;
  chunks: CodeChunk[];
}

export interface RepositoryIndexResult {
  totalFiles: number;
  totalChunks: number;

  files: IndexedFile[];
}