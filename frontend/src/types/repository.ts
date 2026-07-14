export interface CodeChunk {
  id: string;
  content: string;
  startLine: number;
  endLine: number;
}

export interface RepositoryFile {
  id: string;
  path: string;
  extension: string;
  size: number;
  chunks: CodeChunk[];
}

export interface RepositoryListItem {
  id: string;
  name: string;
  githubUrl: string;
  localPath: string;
  createdAt: string;
  _count: { files: number };
  files: { _count: { chunks: number } }[];
}

export interface Repository {
  id: string;
  name: string;
  githubUrl: string;
  localPath: string;
  createdAt: string;
  files: RepositoryFile[];
}
