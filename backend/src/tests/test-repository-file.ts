import "dotenv/config";

import {
  getRepositoryByGithubUrl,
} from "../repository/repository.repository.js";

import {
  createRepositoryFile,
  getRepositoryFiles,
} from "../repository/repository-file.repository.js";

async function main() {
  const repository = await getRepositoryByGithubUrl(
    "https://github.com/facebook/react"
  );

  if (!repository) {
    throw new Error("Repository not found.");
  }

  await createRepositoryFile(
    repository.id,
    "src/App.tsx",
    ".tsx",
    2048
  );

  await createRepositoryFile(
    repository.id,
    "src/index.tsx",
    ".tsx",
    1024
  );

  const files = await getRepositoryFiles(repository.id);

  console.log(files);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));