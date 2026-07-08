export interface IndexedChunk {
  content: string;
  embedding: number[];

  startLine: number;
  endLine: number;
}

export interface IndexedFile {
  path: string;
  extension: string;
  size: number;
  chunks: IndexedChunk[];
}

export interface RepositoryIndexResult {
  totalFiles: number;
  totalChunks: number;
  totalEmbeddings: number;

  files: IndexedFile[];
}