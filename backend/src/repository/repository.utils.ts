const ignoredDirectories = [
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo",
  ".idea",
  ".vscode",
  "__pycache__",
  ".venv",
  "venv",
  "env",
  ".gradle",
  "target",
  "bin",
  "obj",
  ".DS_Store",
];

const ignoredExtensions = new Set([
  // Binary / media
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
  ".mp3", ".mp4", ".avi", ".mov", ".wav",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib", ".o", ".a",
  ".woff", ".woff2", ".ttf", ".eot",
  // Lock / generated
  ".lock", ".min.js", ".min.css",
  // Images / data
  ".sqlite", ".db", ".pickle", ".pkl",
]);

const ignoredFileNames = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "Gemfile.lock", "Cargo.lock", "poetry.lock",
  "composer.lock", "go.sum",
  ".DS_Store", "Thumbs.db", "desktop.ini",
]);

export const shouldIgnore = (name: string): boolean => {
  return ignoredDirectories.includes(name);
};

export const shouldIgnoreFile = (filePath: string): boolean => {
  const fileName = filePath.split("/").pop() ?? filePath.split("\\").pop() ?? "";
  if (ignoredFileNames.has(fileName)) return true;

  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const ext = fileName.slice(dotIndex).toLowerCase();
  return ignoredExtensions.has(ext);
};