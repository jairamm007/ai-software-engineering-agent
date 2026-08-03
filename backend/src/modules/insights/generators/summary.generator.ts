import type { InsightSummary, RepositoryFileLite } from "../types.js";
import { CODE_EXTENSIONS, readRepoJson } from "../fs.util.js";
import {
  detectAiFramework,
  detectBackendFramework,
  detectDatabase,
  detectFrontendFramework,
  detectVectorDb,
} from "./techstack.generator.js";

export interface SummaryInput {
  name: string;
  description?: string | null;
  localPath: string | null;
  files: RepositoryFileLite[];
  moduleCount: number;
}

interface PackageJson {
  description?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const detectPrimaryLanguage = (files: RepositoryFileLite[]): string => {
  const counts = new Map<string, number>();
  for (const f of files) {
    if (!CODE_EXTENSIONS.includes(f.extension)) continue;
    counts.set(f.extension, (counts.get(f.extension) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return EXTENSION_TO_LANGUAGE[top ?? ""] ?? (top ? top.replace(".", "").toUpperCase() : "Unknown");
};

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript (React)",
  ".js": "JavaScript",
  ".jsx": "JavaScript (React)",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".rb": "Ruby",
  ".cs": "C#",
  ".php": "PHP",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".c": "C",
  ".cpp": "C++",
  ".h": "C/C++",
  ".hpp": "C++",
  ".swift": "Swift",
  ".kt": "Kotlin",
};

const countFolders = (files: RepositoryFileLite[]): number => {
  const dirs = new Set<string>();
  for (const f of files) {
    const parts = f.path.split("/");
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join("/"));
    }
  }
  return dirs.size;
};

export const generateSummary = (input: SummaryInput): InsightSummary => {
  const pkg = readRepoJson<PackageJson>(input.localPath, "package.json");
  const deps: Record<string, string> = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };

  let description = input.description ?? pkg?.description ?? null;
  if (!description && input.files.length === 0) {
    description = `The ${input.name} repository.`;
  }

  return {
    name: input.name,
    description,
    primaryLanguage: detectPrimaryLanguage(input.files),
    frontendFramework: detectFrontendFramework(deps),
    backendFramework: detectBackendFramework(deps),
    database: detectDatabase(deps, null),
    vectorDb: detectVectorDb(deps, null),
    aiFramework: detectAiFramework(deps),
    totalFiles: input.files.length,
    totalFolders: countFolders(input.files),
    moduleCount: input.moduleCount,
  };
};
