import path from "path";

import { scanRepository } from "../repository/repository.scanner.js";
import { shouldIgnoreFile } from "../repository/repository.utils.js";
import { chunkFile } from "../rag/chunker.js";

import {
  IndexedFile,
  RepositoryIndexResult,
} from "./indexer.types.js";

export const indexRepository = async (
  repositoryPath: string
): Promise<RepositoryIndexResult> => {
  const scanResult = await scanRepository(repositoryPath);

  const indexedFiles: IndexedFile[] = [];
  let skippedFiles = 0;

  for (const file of scanResult.files) {
    const relativePath = path
      .relative(repositoryPath, file.path)
      .replace(/\\/g, "/");

    if (shouldIgnoreFile(relativePath)) {
      skippedFiles++;
      continue;
    }

    try {
      const chunks = await chunkFile(file.path);
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

  console.log(`  Skipped ${skippedFiles} binary/lock/generated files`);

  const totalChunks = indexedFiles.reduce(
    (sum, file) => sum + file.chunks.length,
    0
  );

  return {
    totalFiles: indexedFiles.length,
    totalChunks,
    files: indexedFiles,
  };
};
