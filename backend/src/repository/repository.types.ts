export interface RepositoryFile {
  name: string;
  path: string;
  extension: string;
  size: number;
}

export interface RepositoryScanResult {
  totalFiles: number;
  files: RepositoryFile[];
}

export interface RepositoryAnalysisResult extends RepositoryScanResult {
  totalChunks: number;
}