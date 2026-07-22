import fs from "fs";
import path from "path";

import { prisma } from "../database/prisma.js";
import { searchNearestChunks, RetrievedChunk } from "../vector/vector.repository.js";
import { semanticSearch } from "./search.service.js";

export interface SearchFilters {
  language?: string;
  extension?: string;
  minLines?: number;
  maxLines?: number;
  path?: string;
}

export interface FileSearchResult {
  path: string;
  name: string;
  extension: string;
  size: number;
  lines: number;
  modifiedAt: string;
}

export interface FunctionSearchResult {
  name: string;
  file: string;
  line: number;
  endLine: number;
  exported: boolean;
  params: number;
}

export interface ClassSearchResult {
  name: string;
  file: string;
  line: number;
  endLine: number;
  exported: boolean;
  methods: number;
}

export interface SearchResults {
  semantic: RetrievedChunk[];
  files: FileSearchResult[];
  functions: FunctionSearchResult[];
  classes: ClassSearchResult[];
  totalResults: number;
}

const EXTENSION_MAP: Record<string, string[]> = {
  typescript: [".ts", ".tsx"],
  javascript: [".js", ".jsx"],
  python: [".py"],
  java: [".java"],
  go: [".go"],
  rust: [".rs"],
  cpp: [".cpp", ".cc", ".cxx", ".h", ".hpp"],
  c: [".c", ".h"],
  ruby: [".rb"],
  php: [".php"],
  swift: [".swift"],
  kotlin: [".kt", ".kts"],
  html: [".html", ".htm"],
  css: [".css", ".scss", ".less"],
  json: [".json"],
  yaml: [".yaml", ".yml"],
  markdown: [".md", ".mdx"],
  shell: [".sh", ".bash"],
  sql: [".sql"],
};

function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

function walkDirectory(
  dir: string,
  extensions?: string[],
  basePath?: string,
  maxDepth = 10,
  currentDepth = 0
): FileSearchResult[] {
  const results: FileSearchResult[] = [];
  if (currentDepth > maxDepth) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDirectory(fullPath, extensions, basePath, maxDepth, currentDepth + 1));
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!extensions || extensions.includes(ext)) {
          const stat = fs.statSync(fullPath);
          const relPath = basePath ? path.relative(basePath, fullPath) : fullPath;
          results.push({
            path: relPath,
            name: entry.name,
            extension: ext,
            size: stat.size,
            lines: countLines(fullPath),
            modifiedAt: stat.mtime.toISOString(),
          });
        }
      }
    }
  } catch {}

  return results;
}

export const searchFiles = (
  repositoryPath: string,
  query: string,
  filters?: SearchFilters
): FileSearchResult[] => {
  const extensions = filters?.language
    ? EXTENSION_MAP[filters.language.toLowerCase()]
    : filters?.extension
      ? [filters.extension.startsWith(".") ? filters.extension : `.${filters.extension}`]
      : undefined;

  let files = walkDirectory(repositoryPath, extensions, repositoryPath);

  if (query) {
    const lowerQuery = query.toLowerCase();
    files = files.filter(
      (f) =>
        f.name.toLowerCase().includes(lowerQuery) ||
        f.path.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters?.minLines) files = files.filter((f) => f.lines >= filters.minLines!);
  if (filters?.maxLines) files = files.filter((f) => f.lines <= filters.maxLines!);
  if (filters?.path) {
    const lowerPath = filters.path.toLowerCase();
    files = files.filter((f) => f.path.toLowerCase().includes(lowerPath));
  }

  files.sort((a, b) => b.size - a.size);
  return files.slice(0, 100);
};

export const searchFunctions = (
  repositoryPath: string,
  query: string,
  filters?: SearchFilters
): FunctionSearchResult[] => {
  const extensions = filters?.language
    ? EXTENSION_MAP[filters.language.toLowerCase()]
    : [".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs"];

  const files = walkDirectory(repositoryPath, extensions, repositoryPath);
  const results: FunctionSearchResult[] = [];
  const lowerQuery = query?.toLowerCase() || "";

  for (const file of files) {
    try {
      const fullPath = path.join(repositoryPath, file.path);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        let match: RegExpMatchArray | null = null;
        let name = "";
        let exported = false;
        let params = 0;

        if (file.extension === ".py") {
          match = trimmed.match(/^(async\s+)?def\s+(\w+)\s*\(([^)]*)\)/);
          if (match) {
            name = match[2];
            exported = !name.startsWith("_");
            params = match[3] ? match[3].split(",").length : 0;
          }
        } else if (file.extension === ".go") {
          match = trimmed.match(/^func\s+(\([^)]+\)\s+)?(\w+)\s*\(([^)]*)\)/);
          if (match) {
            name = match[2];
            exported = name[0] === name[0].toUpperCase();
            params = match[3] ? match[3].split(",").length : 0;
          }
        } else if (file.extension === ".rs") {
          match = trimmed.match(/^(pub\s+)?(async\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/);
          if (match) {
            name = match[3];
            exported = trimmed.startsWith("pub");
            params = match[4] ? match[4].split(",").length : 0;
          }
        } else if (file.extension === ".java") {
          match = trimmed.match(/^(public|protected|private)?\s*(static)?\s*\w+\s+(\w+)\s*\(([^)]*)\)/);
          if (match) {
            name = match[3];
            exported = match[1] === "public";
            params = match[4] ? match[4].split(",").length : 0;
          }
        } else {
          // TS/JS patterns
          match = trimmed.match(/^(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/);
          if (match) {
            name = match[4];
            exported = !!match[1];
            params = match[5] ? match[5].split(",").length : 0;
          } else {
            match = trimmed.match(/^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(?([^)]*)\)?\s*=>/);
            if (match) {
              name = match[3];
              exported = !!match[1];
              params = match[4] ? match[4].split(",").length : 0;
            } else {
              match = trimmed.match(/^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*(?:<[^>]*>)?\s*\(([^)]*)\)/);
              if (match) {
                name = match[3];
                exported = !!match[1];
                params = match[4] ? match[4].split(",").length : 0;
              }
            }
          }
        }

        if (name && (!lowerQuery || name.toLowerCase().includes(lowerQuery))) {
          let endLine = i + 1;
          if (file.extension !== ".py" && file.extension !== ".go") {
            let braceCount = 0;
            let foundOpen = false;
            for (let j = i; j < Math.min(i + 200, lines.length); j++) {
              for (const ch of lines[j]) {
                if (ch === "{") { braceCount++; foundOpen = true; }
                if (ch === "}") braceCount--;
              }
              if (foundOpen && braceCount <= 0) { endLine = j + 1; break; }
            }
          }

          results.push({ name, file: file.path, line: i + 1, endLine, exported, params });
        }
      }
    } catch {}
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  return results.slice(0, 200);
};

export const searchClasses = (
  repositoryPath: string,
  query: string,
  filters?: SearchFilters
): ClassSearchResult[] => {
  const extensions = filters?.language
    ? EXTENSION_MAP[filters.language.toLowerCase()]
    : [".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".rs"];

  const files = walkDirectory(repositoryPath, extensions, repositoryPath);
  const results: ClassSearchResult[] = [];
  const lowerQuery = query?.toLowerCase() || "";

  for (const file of files) {
    try {
      const fullPath = path.join(repositoryPath, file.path);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        let match: RegExpMatchArray | null = null;
        let name = "";
        let exported = false;

        if (file.extension === ".py") {
          match = trimmed.match(/^class\s+(\w+)[^:]*:/);
          if (match) {
            name = match[1];
            exported = !name.startsWith("_");
          }
        } else if (file.extension === ".java" || file.extension === ".rs") {
          match = trimmed.match(/^(pub\s+)?(abstract\s+)?class\s+(\w+)/);
          if (match) {
            name = match[3];
            exported = trimmed.includes("pub") || file.extension === ".java";
          }
        } else {
          match = trimmed.match(/^(export\s+)?(default\s+)?(abstract\s+)?class\s+(\w+)/);
          if (match) {
            name = match[4];
            exported = !!match[1];
          }
        }

        if (name && (!lowerQuery || name.toLowerCase().includes(lowerQuery))) {
          let endLine = i + 1;
          let braceCount = 0;
          let foundOpen = false;
          for (let j = i; j < Math.min(i + 500, lines.length); j++) {
            for (const ch of lines[j]) {
              if (ch === "{") { braceCount++; foundOpen = true; }
              if (ch === "}") braceCount--;
            }
            if (foundOpen && braceCount <= 0) { endLine = j + 1; break; }
          }

          const classBody = lines.slice(i, endLine).join("\n");
          const methodCount = (classBody.match(/(?:def\s+\w+|function\s+\w+|=>\s*\w+\s*\(|fn\s+\w+)/g) || []).length;

          results.push({ name, file: file.path, line: i + 1, endLine, exported, methods: methodCount });
        }
      }
    } catch {}
  }

  results.sort((a, b) => a.name.localeCompare(b.name));
  return results.slice(0, 100);
};

export const combinedSearch = async (
  repositoryId: string,
  repositoryPath: string,
  query: string,
  filters?: SearchFilters
): Promise<SearchResults> => {
  const [semantic, files, functions, classes] = await Promise.all([
    semanticSearch(query, 10, repositoryId).catch(() => [] as RetrievedChunk[]),
    Promise.resolve(searchFiles(repositoryPath, query, filters)),
    Promise.resolve(searchFunctions(repositoryPath, query, filters)),
    Promise.resolve(searchClasses(repositoryPath, query, filters)),
  ]);

  return {
    semantic,
    files,
    functions,
    classes,
    totalResults: semantic.length + files.length + functions.length + classes.length,
  };
};
