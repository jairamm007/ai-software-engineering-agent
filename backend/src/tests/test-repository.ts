import "dotenv/config";

import {
  createRepository,
  getRepositoryByGithubUrl,
} from "../repository/repository.repository.js";

const TEST_USER_ID = "test-user-000";

async function main() {
  const repository = await createRepository(
    "react",
    "https://github.com/facebook/react",
    "./temp/react",
    TEST_USER_ID
  );

  console.log("Created Repository:");
  console.log(repository);

  const found = await getRepositoryByGithubUrl(
    repository.githubUrl,
    TEST_USER_ID
  );

  console.log("\nFound Repository:");
  console.log(found);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
