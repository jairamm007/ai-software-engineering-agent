import path from "path";

import { scanRepository } from "../repository/repository.scanner.js";
import { chunkFile } from "../rag/chunker.js";

import {
  IndexedFile,
  RepositoryIndexResult,
} from "./indexer.types.js";

export const indexRepository = async (
  repositoryPath: string
): Promise<RepositoryIndexResult> => {
  const scanResult = scanRepository(repositoryPath);

  const indexedFiles: IndexedFile[] = [];

  for (const file of scanResult.files) {
    try {
      const chunks = chunkFile(file.path);
      const relativePath = path
        .relative(repositoryPath, file.path)
        .replace(/\\/g, "/");

      indexedFiles.push({
        path: relativePath,
        extension: path.extname(file.path),
        size: file.size,
        chunks,
      });
    } catch {
      // Skip unreadable or binary files
    }
  }

  return {
    totalFiles: scanResult.totalFiles,
    totalChunks: scanResult.totalChunks,
    files: indexedFiles,
  };
};