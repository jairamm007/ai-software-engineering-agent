import path from "path";
import { simpleGit, SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

export const cloneRepository = async (
  repoUrl: string,
  repoName: string
): Promise<string> => {
  const uniqueFolder = `${repoName}-${Date.now()}`;

  const clonePath = path.resolve(
    process.cwd(),
    "temp",
    uniqueFolder
  );

  await git.clone(repoUrl, clonePath);

  return clonePath;
};