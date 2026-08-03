import fs from "fs";
import path from "path";

export const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "__pycache__",
  ".cache",
  ".vscode",
  ".idea",
  "vendor",
  "target",
]);

export const CODE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".rb",
  ".cs", ".php", ".vue", ".svelte", ".c", ".cpp", ".h", ".hpp",
  ".swift", ".kt",
];

export const readRepoFile = (
  repoPath: string | null | undefined,
  relPath: string
): string | null => {
  if (!repoPath) return null;
  try {
    const full = path.join(repoPath, relPath);
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full, "utf8");
  } catch {
    return null;
  }
};

export const repoFileExists = (
  repoPath: string | null | undefined,
  relPath: string
): boolean => {
  if (!repoPath) return false;
  try {
    return fs.existsSync(path.join(repoPath, relPath));
  } catch {
    return false;
  }
};

export const repoDirExists = (
  repoPath: string | null | undefined,
  relPath: string
): boolean => {
  if (!repoPath) return false;
  try {
    return fs.statSync(path.join(repoPath, relPath)).isDirectory();
  } catch {
    return false;
  }
};

export const readRepoJson = <T>(
  repoPath: string | null | undefined,
  relPath: string
): T | null => {
  const content = readRepoFile(repoPath, relPath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
};

export const pathExistsInFiles = (
  files: { path: string }[],
  relPath: string
): boolean => files.some((f) => f.path === relPath);

export const pathPrefixInFiles = (
  files: { path: string }[],
  prefix: string
): boolean => files.some((f) => f.path.startsWith(prefix));
