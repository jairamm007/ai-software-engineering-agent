import "dotenv/config";

import {
  createRepository,
  getRepositoryByGithubUrl,
} from "./repository/repository.repository.js";

async function main() {
  const repository = await createRepository(
    "react",
    "https://github.com/facebook/react",
    "./temp/react"
  );

  console.log("Created Repository:");
  console.log(repository);

  const found = await getRepositoryByGithubUrl(
    repository.githubUrl
  );

  console.log("\nFound Repository:");
  console.log(found);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));