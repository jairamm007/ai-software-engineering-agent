import fs from "fs";
import path from "path";

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "coverage",
  "__pycache__", ".cache", ".vscode", ".idea", "vendor", "target",
  ".tox", "eggs", "*.egg-info",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
  ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm",
  ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".woff", ".woff2", ".ttf", ".eot",
  ".lock", ".min.js", ".min.css",
]);

interface FolderNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  children?: FolderNode[];
  extension?: string;
}

interface LanguageStat {
  language: string;
  files: number;
  lines: number;
  bytes: number;
  percentage: number;
  color: string;
}

interface ComplexityResult {
  file: string;
  extension: string;
  lines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  functions: number;
  classes: number;
  complexity: number;
  maintainabilityIndex: number;
}

interface CallGraphFunction {
  name: string;
  file: string;
  line: number;
  endLine: number;
  calls: string[];
  calledBy: string[];
  params: number;
  isExported: boolean;
}

interface CallGraphResult {
  functions: CallGraphFunction[];
  edges: { source: string; target: string; file: string }[];
  orphanFunctions: string[];
  highlyConnected: { name: string; connections: number }[];
}

interface ImportGraphEdge {
  source: string;
  target: string;
  importType: "named" | "default" | "namespace" | "side-effect";
  specifiers: string[];
}

interface ImportGraphResult {
  nodes: { id: string; file: string; imports: number; importedBy: number; isExternal: boolean }[];
  edges: ImportGraphEdge[];
  clusters: { name: string; files: string[] }[];
  externalDependencies: string[];
}

interface ArchitectureModule {
  id: string;
  name: string;
  type: "service" | "controller" | "model" | "route" | "util" | "component" | "page" | "hook" | "context" | "config" | "test" | "other";
  files: string[];
  dependencies: string[];
  lineCount: number;
}

interface ArchitectureResult {
  modules: ArchitectureModule[];
  layers: { name: string; modules: string[] }[];
  suggestions: string[];
}

const EXTENSION_MAP: Record<string, string> = {
  ".ts": "TypeScript", ".tsx": "TypeScript (React)", ".js": "JavaScript",
  ".jsx": "JavaScript (React)", ".py": "Python", ".rb": "Ruby",
  ".go": "Go", ".rs": "Rust", ".java": "Java", ".kt": "Kotlin",
  ".cs": "C#", ".cpp": "C++", ".c": "C", ".h": "C/C++ Header",
  ".css": "CSS", ".scss": "SCSS", ".less": "LESS", ".html": "HTML",
  ".htm": "HTML", ".json": "JSON", ".yaml": "YAML", ".yml": "YAML",
  ".xml": "XML", ".md": "Markdown", ".txt": "Text", ".sql": "SQL",
  ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
  ".env": "Environment", ".dockerfile": "Docker",
  ".prisma": "Prisma", ".graphql": "GraphQL", ".gql": "GraphQL",
  ".vue": "Vue", ".svelte": "Svelte", ".astro": "Astro",
  ".php": "PHP", ".swift": "Swift", ".dart": "Dart",
  ".lua": "Lua", ".r": "R", ".toml": "TOML",
};

const LANGUAGE_COLORS: Record<string, string> = {
  "TypeScript": "#3178c6", "TypeScript (React)": "#3178c6",
  "JavaScript": "#f1e05a", "JavaScript (React)": "#f1e05a",
  "Python": "#3572A5", "Ruby": "#701516", "Go": "#00ADD8",
  "Rust": "#dea584", "Java": "#b07219", "Kotlin": "#A97BFF",
  "C#": "#178600", "C++": "#f34b7d", "C": "#555555",
  "C/C++ Header": "#555555", "CSS": "#563d7c", "SCSS": "#c6538c",
  "HTML": "#e34c26", "JSON": "#292929", "YAML": "#cb171e",
  "XML": "#0060ac", "Markdown": "#083fa1", "SQL": "#e38c00",
  "Shell": "#89e051", "Docker": "#384d54", "Prisma": "#2D3748",
  "GraphQL": "#e10098", "Vue": "#41b883", "Svelte": "#ff3e00",
  "PHP": "#4F5D95", "Text": "#666666", "Environment": "#ECD53F",
};

const MODULE_PATTERNS: Record<string, { pattern: RegExp; type: ArchitectureModule["type"] }> = {
  service: { pattern: /service|provider|handler|manager/i, type: "service" },
  controller: { pattern: /controller|resolver/i, type: "controller" },
  model: { pattern: /model|schema|entity|type|interface|dto/i, type: "model" },
  route: { pattern: /route|router|endpoint|middleware/i, type: "route" },
  util: { pattern: /util|helper|lib|common|shared|constant|config/i, type: "util" },
  component: { pattern: /component|widget|element/i, type: "component" },
  page: { pattern: /page|view|screen|layout/i, type: "page" },
  hook: { pattern: /hook|use[A-Z]/i, type: "hook" },
  context: { pattern: /context|provider|store/i, type: "context" },
  test: { pattern: /test|spec|__tests__|\.test\.|\.spec\./i, type: "test" },
};

function shouldIgnoreDir(dirName: string): boolean {
  return IGNORED_DIRS.has(dirName) || dirName.startsWith(".");
}

function getFileLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();
  if (base === "dockerfile") return "Docker";
  if (base === "prisma.schema") return "Prisma";
  return EXTENSION_MAP[ext] || ext.replace(".", "").toUpperCase() || "Unknown";
}

function getFileSize(filePath: string): number {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

function countLines(content: string) {
  const lines = content.split(/\r?\n/);
  let code = 0, comment = 0, blank = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { blank++; continue; }
    if (inBlockComment) {
      comment++;
      if (trimmed.includes("*/")) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("--")) {
      comment++; continue;
    }
    if (trimmed.startsWith("/*")) {
      comment++;
      if (!trimmed.includes("*/")) inBlockComment = true;
      continue;
    }
    code++;
  }

  return { total: lines.length, code, comment, blank };
}

function calculateComplexity(content: string): number {
  const complexityKeywords = [
    /\bif\b/g, /\belse\s+if\b/g, /\belse\b/g,
    /\bfor\b/g, /\bwhile\b/g, /\bdo\b/g,
    /\bswitch\b/g, /\bcase\b/g,
    /\bcatch\b/g, /\bthrow\b/g, /\btry\b/g,
    /\b&&\b/g, /\b\|\|\b/g, /\?\?/g,
    /\?.*:/g,
    /\.then\b/g, /\.catch\b/g,
    /\bawait\b/g,
  ];

  let complexity = 1;
  for (const regex of complexityKeywords) {
    const matches = content.match(regex);
    if (matches) complexity += matches.length;
  }
  return complexity;
}

function calculateMaintainabilityIndex(lines: number, complexity: number): number {
  if (lines === 0) return 100;
  const halsteadVolume = lines * Math.log2(Math.max(lines, 2));
  const mi = Math.max(0, 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * complexity - 16.2 * Math.log(lines));
  return Math.min(100, Math.round(mi));
}

function detectFunctions(content: string, filePath: string): CallGraphFunction[] {
  const functions: CallGraphFunction[] = [];
  const lines = content.split(/\r?\n/);
  const patterns = [
    { regex: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g, isExport: /export/ },
    { regex: /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g, isExport: /export/ },
    { regex: /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?=\s*(?:async\s*)?function\s*\(([^)]*)\)/g, isExport: /export/ },
    { regex: /(?:public|private|protected|static|async)+\s+(\w+)\s*\(([^)]*)\)\s*[{:]/g, isExport: /export/ },
  ];

  for (const { regex, isExport } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const name = match[1];
      if (["if", "for", "while", "switch", "catch", "return", "import", "export", "const", "let", "var"].includes(name)) continue;
      const lineNum = content.substring(0, match.index).split("\n").length;
      const params = match[2] ? match[2].split(",").filter(p => p.trim()).length : 0;
      const callPattern = new RegExp(`\\b${name}\\s*\\(`, "g");
      const calls: string[] = [];
      let endLine = lineNum;
      for (let i = lineNum; i < lines.length; i++) {
        if (lines[i].includes("{")) {
          let depth = 0;
          for (let j = i; j < lines.length; j++) {
            for (const ch of lines[j]) {
              if (ch === "{") depth++;
              if (ch === "}") depth--;
            }
            if (depth === 0 && j > i) { endLine = j + 1; break; }
          }
          break;
        }
        if (lines[i].includes("=>") || lines[i].includes(":")) { endLine = lineNum; break; }
      }

      const bodyLines = lines.slice(lineNum - 1, endLine).join("\n");
      const funcCallPattern = /\b([a-zA-Z_$][\w$]*)\s*\(/g;
      let funcMatch;
      while ((funcMatch = funcCallPattern.exec(bodyLines)) !== null) {
        const called = funcMatch[1];
        if (called !== name && !["if", "for", "while", "switch", "catch", "console", "require", "import"].includes(called)) {
          calls.push(called);
        }
      }

      functions.push({
        name,
        file: filePath,
        line: lineNum,
        endLine,
        calls: [...new Set(calls)],
        calledBy: [],
        params,
        isExported: isExport.test(match[0]),
      });
    }
  }

  return functions;
}

// ─── Folder Visualization ───────────────────────────────────────────

export const buildFolderTree = (repositoryPath: string): FolderNode => {
  const buildNode = (dirPath: string, relativeTo: string): FolderNode => {
    const entries = fs.readdirSync(dirPath);
    const children: FolderNode[] = [];
    let totalSize = 0;

    for (const entry of entries) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dirPath, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const child = buildNode(fullPath, relativeTo);
          children.push(child);
          totalSize += child.size;
        } else if (stat.isFile()) {
          const ext = path.extname(entry).toLowerCase();
          const size = stat.size;
          totalSize += size;
          children.push({
            name: entry,
            path: path.relative(relativeTo, fullPath).replaceAll("\\", "/"),
            type: "file",
            size,
            extension: ext,
          });
        }
      } catch { /* skip inaccessible */ }
    }

    children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return {
      name: path.basename(dirPath),
      path: path.relative(relativeTo, dirPath).replaceAll("\\", "/") || ".",
      type: "directory",
      size: totalSize,
      children,
    };
  };

  return buildNode(repositoryPath, repositoryPath);
};

// ─── Language Statistics ────────────────────────────────────────────

export const getLanguageStatistics = (repositoryPath: string): LanguageStat[] => {
  const stats = new Map<string, { files: number; lines: number; bytes: number }>();

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { walk(fullPath); continue; }
        if (!stat.isFile()) continue;
        if (BINARY_EXTENSIONS.has(path.extname(entry).toLowerCase())) continue;

        const lang = getFileLanguage(fullPath);
        if (lang === "Unknown") continue;

        const existing = stats.get(lang) ?? { files: 0, lines: 0, bytes: 0 };
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const counts = countLines(content);
          existing.files++;
          existing.lines += counts.total;
          existing.bytes += Buffer.byteLength(content, "utf8");
        } catch {
          existing.files++;
          existing.bytes += stat.size;
        }
        stats.set(lang, existing);
      } catch { /* skip */ }
    }
  };

  walk(repositoryPath);

  const totalBytes = Array.from(stats.values()).reduce((sum, s) => sum + s.bytes, 0);

  return Array.from(stats.entries())
    .map(([language, data]) => ({
      language,
      ...data,
      percentage: totalBytes > 0 ? Number(((data.bytes / totalBytes) * 100).toFixed(1)) : 0,
      color: LANGUAGE_COLORS[language] || "#6b7280",
    }))
    .sort((a, b) => b.bytes - a.bytes);
};

// ─── Complexity Analysis ────────────────────────────────────────────

export const getComplexityAnalysis = (repositoryPath: string): ComplexityResult[] => {
  const results: ComplexityResult[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { walk(fullPath); continue; }
        if (!stat.isFile()) continue;
        const ext = path.extname(entry).toLowerCase();
        if (![".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".rb", ".php", ".cs", ".cpp", ".c", ".h", ".swift", ".kt"].includes(ext)) continue;

        const content = fs.readFileSync(fullPath, "utf8");
        const lineCounts = countLines(content);
        const complexity = calculateComplexity(content);
        const maintainabilityIndex = calculateMaintainabilityIndex(lineCounts.code, complexity);

        const functionCount = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(|(?:public|private|protected)\s+\w+\s*\()/g) || []).length;
        const classCount = (content.match(/\bclass\s+\w+/g) || []).length;

        results.push({
          file: path.relative(repositoryPath, fullPath).replaceAll("\\", "/"),
          extension: ext,
          lines: lineCounts.total,
          codeLines: lineCounts.code,
          commentLines: lineCounts.comment,
          blankLines: lineCounts.blank,
          functions: functionCount,
          classes: classCount,
          complexity,
          maintainabilityIndex,
        });
      } catch { /* skip */ }
    }
  };

  walk(repositoryPath);
  return results.sort((a, b) => b.complexity - a.complexity);
};

// ─── Import Graph ───────────────────────────────────────────────────

export const getImportGraph = (repositoryPath: string): ImportGraphResult => {
  const nodeMap = new Map<string, { id: string; file: string; imports: number; importedBy: number; isExternal: boolean }>();
  const edges: ImportGraphEdge[] = [];
  const externalDeps = new Set<string>();
  const importCounts = new Map<string, number>();

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { walk(fullPath); continue; }
        if (!stat.isFile()) continue;
        const ext = path.extname(entry).toLowerCase();
        if (![".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"].includes(ext)) continue;

        const fileId = path.relative(repositoryPath, fullPath).replaceAll("\\", "/");
        const content = fs.readFileSync(fullPath, "utf8");
        const importRegex = /(?:import\s+(?:type\s+)?{([^}]*)}\s+from\s+["']([^"']+)["']|import\s+(\w+)\s+from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))/g;

        let match;
        const fileImports: ImportGraphEdge[] = [];

        while ((match = importRegex.exec(content)) !== null) {
          const namedSpecifiers = match[1] || "";
          const namedFrom = match[2] || "";
          const defaultImport = match[3] || "";
          const defaultFrom = match[4] || "";
          const sideEffect = match[5] || "";
          const importPath = namedFrom || defaultFrom || sideEffect;
          if (!importPath) continue;

          const isExternal = !importPath.startsWith(".");
          let importType: ImportGraphEdge["importType"] = "side-effect";
          let specifiers: string[] = [];

          if (namedSpecifiers) {
            importType = "named";
            specifiers = namedSpecifiers.split(",").map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
          } else if (defaultImport) {
            importType = "default";
            specifiers = [defaultImport];
          }

          if (isExternal) {
            const depName = importPath.startsWith("@")
              ? importPath.split("/").slice(0, 2).join("/")
              : importPath.split("/")[0];
            externalDeps.add(depName);
          } else {
            const resolved = path.resolve(path.dirname(fullPath), importPath);
            const candidates = [
              resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}.js`, `${resolved}.jsx`,
              path.join(resolved, "index.ts"), path.join(resolved, "index.tsx"),
              path.join(resolved, "index.js"), path.join(resolved, "index.jsx"),
            ];
            const targetFile = candidates.find(c => fs.existsSync(c));
            if (targetFile) {
              const targetId = path.relative(repositoryPath, targetFile).replaceAll("\\", "/");
              fileImports.push({ source: fileId, target: targetId, importType, specifiers });
              importCounts.set(targetId, (importCounts.get(targetId) || 0) + 1);
            }
          }
        }

        edges.push(...fileImports);
        nodeMap.set(fileId, {
          id: fileId,
          file: fileId,
          imports: fileImports.length,
          importedBy: 0,
          isExternal: false,
        });
      } catch { /* skip */ }
    }
  };

  walk(repositoryPath);

  for (const edge of edges) {
    const target = nodeMap.get(edge.target);
    if (target) target.importedBy++;
  }

  for (const [id, count] of importCounts) {
    const node = nodeMap.get(id);
    if (node) node.importedBy = count;
  }

  for (const dep of externalDeps) {
    nodeMap.set(dep, { id: dep, file: dep, imports: 0, importedBy: 0, isExternal: true });
  }

  // Detect clusters based on directory structure
  const dirMap = new Map<string, string[]>();
  for (const node of nodeMap.values()) {
    if (node.isExternal) continue;
    const dir = path.dirname(node.file);
    const topDir = dir.split("/")[0] || dir;
    if (!dirMap.has(topDir)) dirMap.set(topDir, []);
    dirMap.get(topDir)!.push(node.file);
  }

  const clusters = Array.from(dirMap.entries())
    .filter(([_, files]) => files.length > 1)
    .map(([name, files]) => ({ name, files }));

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
    clusters,
    externalDependencies: Array.from(externalDeps).sort(),
  };
};

// ─── Call Graph ─────────────────────────────────────────────────────

export const getCallGraph = (repositoryPath: string): CallGraphResult => {
  const allFunctions: CallGraphFunction[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { walk(fullPath); continue; }
        if (!stat.isFile()) continue;
        const ext = path.extname(entry).toLowerCase();
        if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) continue;

        const content = fs.readFileSync(fullPath, "utf8");
        const functions = detectFunctions(content, path.relative(repositoryPath, fullPath).replaceAll("\\", "/"));
        allFunctions.push(...functions);
      } catch { /* skip */ }
    }
  };

  walk(repositoryPath);

  // Build function name -> index map
  const nameToFunc = new Map<string, CallGraphFunction[]>();
  for (const func of allFunctions) {
    if (!nameToFunc.has(func.name)) nameToFunc.set(func.name, []);
    nameToFunc.get(func.name)!.push(func);
  }

  // Build edges
  const edges: { source: string; target: string; file: string }[] = [];
  for (const func of allFunctions) {
    for (const called of func.calls) {
      if (nameToFunc.has(called)) {
        for (const target of nameToFunc.get(called)!) {
          if (target.file !== func.file || target.name !== func.name) {
            edges.push({ source: `${func.file}::${func.name}`, target: `${target.file}::${target.name}`, file: func.file });
          }
        }
      }
    }
  }

  // Build calledBy
  for (const edge of edges) {
    const targetFunc = allFunctions.find(f => `${f.file}::${f.name}` === edge.target);
    if (targetFunc) {
      const sourceFunc = allFunctions.find(f => `${f.file}::${f.name}` === edge.source);
      if (sourceFunc && !targetFunc.calledBy.includes(sourceFunc.name)) {
        targetFunc.calledBy.push(sourceFunc.name);
      }
    }
  }

  // Find orphan functions
  const connectedFuncs = new Set(edges.flatMap(e => [e.source, e.target]));
  const orphanFunctions = allFunctions
    .filter(f => !connectedFuncs.has(`${f.file}::${f.name}`) && !f.name.startsWith("_"))
    .map(f => `${f.file}::${f.name}`);

  // Find highly connected functions
  const connectionCount = new Map<string, number>();
  for (const edge of edges) {
    connectionCount.set(edge.source, (connectionCount.get(edge.source) || 0) + 1);
    connectionCount.set(edge.target, (connectionCount.get(edge.target) || 0) + 1);
  }
  const highlyConnected = Array.from(connectionCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, connections]) => ({ name, connections }));

  return {
    functions: allFunctions,
    edges,
    orphanFunctions,
    highlyConnected,
  };
};

// ─── Architecture Diagram ───────────────────────────────────────────

export const getArchitectureDiagram = (repositoryPath: string): ArchitectureResult => {
  const moduleMap = new Map<string, ArchitectureModule>();

  const classifyFile = (relativePath: string): ArchitectureModule["type"] => {
    const lower = relativePath.toLowerCase();
    for (const [_, { pattern, type }] of Object.entries(MODULE_PATTERNS)) {
      if (pattern.test(lower)) return type;
    }
    return "other";
  };

  const assignModule = (relativePath: string, type: ArchitectureModule["type"], lineCount: number) => {
    // Group by top-level directory + type
    const parts = relativePath.split("/");
    const topDir = parts[0] || "root";
    const moduleId = `${topDir}/${type}`;

    if (!moduleMap.has(moduleId)) {
      moduleMap.set(moduleId, {
        id: moduleId,
        name: `${topDir} ${type}`,
        type,
        files: [],
        dependencies: [],
        lineCount: 0,
      });
    }
    const mod = moduleMap.get(moduleId)!;
    mod.files.push(relativePath);
    mod.lineCount += lineCount;
  };

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      if (shouldIgnoreDir(entry)) continue;
      const fullPath = path.join(dir, entry);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) { walk(fullPath); continue; }
        if (!stat.isFile()) continue;

        const relativePath = path.relative(repositoryPath, fullPath).replaceAll("\\", "/");
        const type = classifyFile(relativePath);

        let lineCount = 0;
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          lineCount = content.split("\n").length;
        } catch { /* skip */ }

        assignModule(relativePath, type, lineCount);
      } catch { /* skip */ }
    }
  };

  walk(repositoryPath);

  // Determine dependencies between modules
  for (const [_, mod] of moduleMap) {
    const deps = new Set<string>();
    for (const file of mod.files) {
      const fullPath = path.join(repositoryPath, file);
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const importRegex = /from\s+["']([^"']+)["']/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          if (!importPath.startsWith(".")) continue;
          const resolved = path.resolve(path.dirname(fullPath), importPath);
          const targetRelative = path.relative(repositoryPath, resolved).replaceAll("\\", "/");
          for (const [otherId, otherMod] of moduleMap) {
            if (otherMod.files.some(f => targetRelative.startsWith(f) || f.startsWith(targetRelative))) {
              if (otherId !== mod.id) deps.add(otherId);
            }
          }
        }
      } catch { /* skip */ }
    }
    mod.dependencies = Array.from(deps);
  }

  const modules = Array.from(moduleMap.values());

  // Define layers based on module types
  const layerOrder: ArchitectureModule["type"][] = ["page", "component", "hook", "context", "controller", "route", "service", "model", "util", "config", "test", "other"];
  const layers = layerOrder
    .filter(type => modules.some(m => m.type === type))
    .map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
      modules: modules.filter(m => m.type === type).map(m => m.id),
    }));

  // Generate suggestions
  const suggestions: string[] = [];
  const largeModules = modules.filter(m => m.files.length > 10);
  if (largeModules.length > 0) {
    suggestions.push(`Consider splitting large modules: ${largeModules.map(m => `${m.name} (${m.files.length} files)`).join(", ")}`);
  }
  const cyclicDeps = modules.filter(m => m.dependencies.some(d => {
    const other = moduleMap.get(d);
    return other?.dependencies.includes(m.id);
  }));
  if (cyclicDeps.length > 0) {
    suggestions.push(`Potential circular module dependencies detected between: ${cyclicDeps.map(m => m.name).join(", ")}`);
  }
  const isolatedModules = modules.filter(m => m.dependencies.length === 0 && m.files.length > 0 && m.type !== "util" && m.type !== "config" && m.type !== "test");
  if (isolatedModules.length > 0) {
    suggestions.push(`Isolated modules (no dependencies detected): ${isolatedModules.map(m => m.name).join(", ")}`);
  }

  return { modules, layers, suggestions };
};
