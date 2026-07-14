import fs from "fs/promises";
import path from "path";

import {
  RepositoryFile,
  RepositoryAnalysisResult,
} from "./repository.types.js";

import { shouldIgnore } from "./repository.utils.js";

export const scanRepository = async (
  repositoryPath: string
): Promise<RepositoryAnalysisResult> => {
  const files: RepositoryFile[] = [];

  const scan = async (currentPath: string) => {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.allSettled(
      entries.map(async (entry) => {
        if (shouldIgnore(entry.name)) {
          return;
        }

        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else {
          try {
            const stats = await fs.stat(fullPath);

            files.push({
              name: entry.name,
              path: fullPath,
              extension: path.extname(entry.name),
              size: stats.size,
            });
          } catch {
            // Skip files we can't stat
          }
        }
      })
    );
  };

  await scan(repositoryPath);

  return {
    totalFiles: files.length,
    totalChunks: 0,
    files,
  };
};
