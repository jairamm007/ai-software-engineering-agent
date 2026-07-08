import path from "path";

import { scanRepository } from "../repository/repository.scanner.js";
import { chunkFile } from "../rag/chunker.js";
import { generateEmbedding } from "../embeddings/embedding.service.js";

import {
  IndexedChunk,
  IndexedFile,
  RepositoryIndexResult,
} from "./indexer.types.js";

export const indexRepository = async (
  repositoryPath: string
): Promise<RepositoryIndexResult> => {
  const scanResult = scanRepository(repositoryPath);

  let totalEmbeddings = 0;

  const indexedFiles: IndexedFile[] = [];

  for (const file of scanResult.files) {
    try {
      const chunks = chunkFile(file.path);

      const indexedChunks: IndexedChunk[] = [];

      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.content);

        indexedChunks.push({
          content: chunk.content,
          embedding,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        });

        totalEmbeddings++;
      }

      indexedFiles.push({
        path: file.path,
        extension: path.extname(file.path),
        size: file.size,
        chunks: indexedChunks,
      });
    } catch {
      // Skip unreadable or binary files
    }
  }

  return {
    totalFiles: scanResult.totalFiles,
    totalChunks: scanResult.totalChunks,
    totalEmbeddings,
    files: indexedFiles,
  };
};