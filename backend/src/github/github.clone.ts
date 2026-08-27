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

  try {
    await git.clone(repoUrl, clonePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error("Git is unavailable in the backend runtime. Install Git and redeploy the backend.");
    }
    throw error;
  }

  return clonePath;
};