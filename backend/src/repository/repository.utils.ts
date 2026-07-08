const ignoredDirectories = [
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "coverage",
  ".turbo",
  ".idea",
  ".vscode"
];

export const shouldIgnore = (name: string): boolean => {
  return ignoredDirectories.includes(name);
};