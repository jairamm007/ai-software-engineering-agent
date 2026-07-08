import fs from "fs";
import path from "path";

import {
  RepositoryFile,
  RepositoryAnalysisResult,
} from "./repository.types.js";

import { shouldIgnore } from "./repository.utils.js";
import { chunkFile } from "../rag/chunker.js";

export const scanRepository = (
  repositoryPath: string
): RepositoryAnalysisResult => {
  const files: RepositoryFile[] = [];
  let totalChunks = 0;

  const scan = (currentPath: string) => {
    const entries = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (shouldIgnore(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else {
        const stats = fs.statSync(fullPath);

        files.push({
          name: entry.name,
          path: fullPath,
          extension: path.extname(entry.name),
          size: stats.size,
        });

        try {
          const chunks = chunkFile(fullPath);
          totalChunks += chunks.length;
        } catch {
          // Skip binary or unreadable files
        }
      }
    }
  };

  scan(repositoryPath);

  return {
    totalFiles: files.length,
    totalChunks,
    files,
  };
};