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

export const indexGitHubRepository = async (
  repositoryUrl: string,
  repositoryName: string
) => {
  // Clone repository
  const repositoryPath = await cloneRepository(
    repositoryUrl,
    repositoryName
  );

  // Save repository
  const repository = await createRepository(
    repositoryName,
    repositoryUrl,
    repositoryPath
  );

  // Index repository
  const indexResult = await indexRepository(repositoryPath);

  // Save files and chunks
  for (const file of indexResult.files) {
    const repositoryFile = await createRepositoryFile(
      repository.id,
      file.path,
      file.extension,
      file.size
    );

    for (const chunk of file.chunks) {
      await createCodeChunk(
        repositoryFile.id,
        chunk.content,
        chunk.startLine,
        chunk.endLine
      );
    }
  }

  return {
    repository,
    indexResult,
  };
};