import { cloneRepository } from "../github/github.clone.js";

import { indexRepository } from "../indexer/repository.indexer.js";

import {
  createRepository,
} from "../repository/repository.repository.js";

import {
  createRepositoryFile,
  createRepositoryFilesBulk,
} from "../repository/repository-file.repository.js";

import {
  createCodeChunk,
  createCodeChunksBulk,
} from "../repository/code-chunk.repository.js";

import { createChunkEmbedding } from "./embedding.service.js";

const EMBEDDING_BATCH_SIZE = 10;
const EMBEDDING_DELAY_MS = 100;
const DB_BATCH_SIZE = 50;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const buildFileTree = (files: { path: string }[]): string => {
  const tree: Record<string, any> = {};
  for (const file of files) {
    const parts = file.path.split("/");
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = null;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }
  return JSON.stringify(tree);
};

export const indexGitHubRepository = async (
  repositoryUrl: string,
  repositoryName: string,
  userId: string
) => {
  console.log("\n========== Repository Indexing Started ==========");

  const repositoryPath = await cloneRepository(
    repositoryUrl,
    `${userId}/${repositoryName}`
  );

  console.log("✅ Repository cloned:", repositoryPath);

  const repository = await createRepository(
    repositoryName,
    repositoryUrl,
    repositoryPath,
    userId
  );

  console.log("✅ Repository saved:", repository.id);

  const indexResult = await indexRepository(repositoryPath);

  console.log(`📁 Files found: ${indexResult.totalFiles}`);
  console.log(`📦 Total chunks: ${indexResult.totalChunks}`);

  const fileTree = buildFileTree(
    indexResult.files.map((f) => ({ path: f.path }))
  );
  console.log(`🌳 File tree built (${fileTree.length} chars)`);

  const allChunks: { chunkId: string; content: string }[] = [];

  for (let i = 0; i < indexResult.files.length; i += DB_BATCH_SIZE) {
    const fileBatch = indexResult.files.slice(i, i + DB_BATCH_SIZE);

    const fileRecords = await Promise.all(
      fileBatch.map(async (file) => {
        const repoFile = await createRepositoryFile(
          repository.id,
          file.path,
          file.extension,
          file.size
        );
        return { file, repoFile };
      })
    );

    for (const { file, repoFile } of fileRecords) {
      const chunkDataList = file.chunks.map((chunk) => ({
        fileId: repoFile.id,
        content: chunk.content,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
      }));

      const savedChunks = await createCodeChunksBulk(chunkDataList);

      for (let j = 0; j < savedChunks.length; j++) {
        allChunks.push({
          chunkId: savedChunks[j].id,
          content: file.chunks[j].content,
        });
      }
    }
  }

  console.log(`\n🧠 Generating embeddings for ${allChunks.length} chunks in batches of ${EMBEDDING_BATCH_SIZE}...`);

  for (let i = 0; i < allChunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = allChunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchNum = Math.floor(i / EMBEDDING_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allChunks.length / EMBEDDING_BATCH_SIZE);

    if (batchNum % 10 === 0 || batchNum === totalBatches) {
      console.log(`  Batch ${batchNum}/${totalBatches}...`);
    }

    await Promise.allSettled(
      batch.map(async (c) => {
        try {
          await createChunkEmbedding(c.chunkId, c.content);
        } catch (err) {
          console.error(`  ⚠️ Embedding failed for chunk ${c.chunkId}:`, err);
        }
      })
    );

    if (i + EMBEDDING_BATCH_SIZE < allChunks.length) {
      await sleep(EMBEDDING_DELAY_MS);
    }
  }

  console.log(
    "========== Repository Indexing Finished ==========\n"
  );

  return {
    repository,
    indexResult,
    fileTree,
  };
};
