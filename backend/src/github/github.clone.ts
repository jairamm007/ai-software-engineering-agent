import fs from "fs";
import path from "path";
import { simpleGit, SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

export const cloneRepository = async (
  repoUrl: string,
  repoName: string
): Promise<string> => {
  const uniqueFolder = `${repoName}-${Date.now()}`;

  const tempDir = path.resolve(process.cwd(), "temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const clonePath = path.resolve(tempDir, uniqueFolder);

  await git.clone(repoUrl, clonePath);

  return clonePath;
};