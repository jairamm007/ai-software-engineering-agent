import { cloneRepository } from "../github/github.clone.js";

import { indexRepository } from "../indexer/repository.indexer.js";

import {
  createRepository,
} from "../repository/repository.repository.js";

import {
  createRepositoryFile,
} from "../repository/repository-file.repository.js";

import {
  createCodeChunk,
} from "../repository/code-chunk.repository.js";

import { createChunkEmbedding } from "./embedding.service.js";

export const indexGitHubRepository = async (
  repositoryUrl: string,
  repositoryName: string,
  userId: string
) => {
  console.log("\n========== Repository Indexing Started ==========");

  // Clone repository — use userId-prefixed path for per-user isolation
  const repositoryPath = await cloneRepository(
    repositoryUrl,
    `${userId}/${repositoryName}`
  );

  console.log("✅ Repository cloned:", repositoryPath);

  // Save repository — scoped to this user
  const repository = await createRepository(
    repositoryName,
    repositoryUrl,
    repositoryPath,
    userId
  );

  console.log("✅ Repository saved:", repository.id);

  // Scan and chunk repository
  const indexResult = await indexRepository(repositoryPath);

  console.log(`📁 Files found: ${indexResult.totalFiles}`);
  console.log(`📦 Total chunks: ${indexResult.totalChunks}`);

  // Persist files, chunks and embeddings
  for (const file of indexResult.files) {
    console.log(`\n📄 Processing file: ${file.path}`);
    console.log(`Chunks: ${file.chunks.length}`);

    const repositoryFile = await createRepositoryFile(
      repository.id,
      file.path,
      file.extension,
      file.size
    );

    console.log(
      `✅ RepositoryFile saved: ${repositoryFile.id}`
    );

    for (const chunk of file.chunks) {
      console.log(
        `   ➜ Saving chunk (${chunk.startLine}-${chunk.endLine})`
      );

      const savedChunk = await createCodeChunk(
        repositoryFile.id,
        chunk.content,
        chunk.startLine,
        chunk.endLine
      );

      console.log(
        `   ✅ CodeChunk saved: ${savedChunk.id}`
      );

      // Generate embedding and store in pgvector
      await createChunkEmbedding(
        savedChunk.id,
        chunk.content
      );

      console.log("   🧠 Embedding stored");
    }
  }

  console.log(
    "========== Repository Indexing Finished ==========\n"
  );

  return {
    repository,
    indexResult,
  };
};
