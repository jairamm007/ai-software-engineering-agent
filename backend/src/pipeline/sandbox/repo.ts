import fs from "node:fs";
import path from "node:path";
import { simpleGit, ResetMode } from "simple-git";
import { exec } from "./docker.js";

const TEMP_ROOT = path.resolve(process.cwd(), "temp", "pipeline");

export const ensureRunDir = (runId: string): string => {
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  return path.join(TEMP_ROOT, runId);
};

export const cloneRepo = async (
  repoUrl: string,
  runId: string,
  branch?: string
): Promise<string> => {
  const dir = ensureRunDir(runId);
  fs.rmSync(dir, { recursive: true, force: true });
  const git = simpleGit();
  await git.clone(repoUrl, dir);
  if (branch) {
    const repo = simpleGit(dir);
    await repo.checkout(branch).catch(() => undefined);
  }
  return dir;
};

export const resetRepo = async (repoDir: string): Promise<void> => {
  const git = simpleGit(repoDir);
  await git.reset(ResetMode.HARD);
};

export const restoreFiles = async (
  repoDir: string,
  files: string[]
): Promise<void> => {
  if (files.length === 0) return;
  const git = simpleGit(repoDir);
  await git.checkout(["--", ...files]);
};

export const getChangedFiles = async (
  repoDir: string
): Promise<string[]> => {
  const git = simpleGit(repoDir);
  const status = await git.status();
  return status.not_added
    .concat(status.created)
    .concat(status.modified)
    .concat(status.deleted);
};

export const fileExistsInRepo = (repoDir: string, relPath: string): boolean => {
  const absolute = path.resolve(repoDir, relPath);
  return absolute.startsWith(path.resolve(repoDir)) && fs.existsSync(absolute);
};

export const readRepoFile = (
  repoDir: string,
  relPath: string,
  maxChars = 40_000
): string | null => {
  const absolute = path.resolve(repoDir, relPath);
  if (!fileExistsInRepo(repoDir, relPath)) return null;
  const content = fs.readFileSync(absolute, "utf-8");
  return content.length > maxChars
    ? `${content.slice(0, maxChars)}\n# ... [truncated, ${content.length - maxChars} chars omitted] ...`
    : content;
};

export const normalizeRelPath = (relPath: string): string => {
  return relPath.split("\\").join("/");
};
