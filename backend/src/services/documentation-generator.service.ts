import fs from "fs";
import path from "path";

const IGNORED = new Set([
  "node_modules", ".git", "dist", "build", ".next", "coverage",
  "__pycache__", ".cache", ".vscode", ".idea", "vendor", "target",
]);

// ─── Types ───────────────────────────────────────────────────────────

export interface ReadmeSection {
  title: string;
  content: string;
  level: number;
}

export interface ReadmeResult {
  title: string;
  description: string;
  sections: ReadmeSection[];
  badges: string[];
  rawMarkdown: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  handler: string;
  auth: boolean;
  description: string;
  file: string;
  line: number;
}

export interface ApiDocGroup {
  group: string;
  prefix: string;
  endpoints: ApiEndpoint[];
}

export interface ApiDocsResult {
  groups: ApiDocGroup[];
  totalEndpoints: number;
  authEndpoints: number;
  publicEndpoints: number;
}

export interface FunctionDoc {
  name: string;
  file: string;
  line: number;
  endLine: number;
  params: { name: string; type: string; description: string; optional: boolean; default?: string }[];
  returnType: string;
  description: string;
  examples: string[];
  isExported: boolean;
  isAsync: boolean;
  complexity: number;
  tags: string[];
}

export interface ClassDoc {
  name: string;
  file: string;
  line: number;
  endLine: number;
  description: string;
  extends: string | null;
  implements: string[];
  methods: { name: string; params: string; returnType: string; description: string; line: number; isStatic: boolean; visibility: string }[];
  properties: { name: string; type: string; description: string; line: number; visibility: string }[];
  constructor: { params: string; description: string } | null;
  isExported: boolean;
  tags: string[];
}

export interface ArchModule {
  name: string;
  path: string;
  fileCount: number;
  lineCount: number;
  description: string;
  exports: string[];
}

export interface ArchDependency {
  from: string;
  to: string;
  weight: number;
}

export interface ArchitectureDocsResult {
  modules: ArchModule[];
  dependencies: ArchDependency[];
  layers: { name: string; modules: string[] }[];
  entryPoints: string[];
  summary: string;
}

export interface DocGeneratorResult {
  readme: ReadmeResult;
  apiDocs: ApiDocsResult;
  functionDocs: FunctionDoc[];
  classDocs: ClassDoc[];
  architecture: ArchitectureDocsResult;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function walkFiles(dir: string, exts: string[]): string[] {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d)) {
      if (IGNORED.has(entry) || entry.startsWith(".")) continue;
      const full = path.join(d, entry);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) { walk(full); continue; }
        if (stat.isFile() && exts.some(ext => entry.endsWith(ext))) files.push(full);
      } catch { /* skip */ }
    }
  };
  walk(dir);
  return files;
}

function readSafe(filePath: string): string {
  try { return fs.readFileSync(filePath, "utf8"); } catch { return ""; }
}

function extractJSDocAbove(lines: string[], targetLine: number): string {
  const docs: string[] = [];
  let i = targetLine - 2;
  while (i >= 0) {
    const line = lines[i].trim();
    if (line.startsWith("*") || line.startsWith("/**") || line.startsWith("*/")) {
      docs.unshift(line.replace(/^\/?\*\*?/, "").replace(/\*\/$/, "").replace(/^\s*\*\s?/, "").trim());
      i--;
    } else break;
  }
  return docs.join("\n").trim();
}

function extractParamType(param: string): { name: string; type: string; optional: boolean; default?: string } {
  const clean = param.trim();
  let optional = false;
  let def: string | undefined;
  let pName = clean;
  let pType = "any";

  if (clean.includes("=")) {
    const [left, right] = clean.split("=").map(s => s.trim());
    def = right;
    pName = left;
    optional = true;
  }
  if (pName.endsWith("?")) { pName = pName.slice(0, -1); optional = true; }
  if (pName.includes(":")) {
    const [n, t] = pName.split(":").map(s => s.trim());
    pName = n;
    pType = t;
  } else if (clean.includes(":")) {
    const [n, t] = clean.split(":").map(s => s.trim());
    pName = n;
    pType = t;
  }
  return { name: pName, type: pType, optional, default: def };
}

function countComplexity(content: string): number {
  let c = 1;
  for (const kw of [/\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g, /\?/g]) {
    const m = content.match(kw);
    if (m) c += m.length;
  }
  return c;
}

// ─── README Generation ───────────────────────────────────────────────

export const generateReadme = (repositoryPath: string): ReadmeResult => {
  const pkgPath = path.join(repositoryPath, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(readSafe(pkgPath)) : null;
  const name = pkg?.name || path.basename(repositoryPath);
  const description = pkg?.description || "";
  const version = pkg?.version || "1.0.0";
  const license = pkg?.license || "";

  // Detect tech stack
  const allDeps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const techStack: string[] = [];
  if (allDeps?.react) techStack.push("React");
  if (allDeps?.vue) techStack.push("Vue.js");
  if (allDeps?.svelte) techStack.push("Svelte");
  if (allDeps?.next) techStack.push("Next.js");
  if (allDeps?.express || allDeps?.["express"]) techStack.push("Express");
  if (allDeps?.fastify) techStack.push("Fastify");
  if (allDeps?.prisma || allDeps?.["@prisma/client"]) techStack.push("Prisma");
  if (allDeps?.typescript || allDeps?.["ts-node"]) techStack.push("TypeScript");
  if (allDeps?.tailwindcss || allDeps?.["@tailwindcss/vite"]) techStack.push("Tailwind CSS");
  if (allDeps?.vitest || allDeps?.jest) techStack.push(allDeps?.vitest ? "Vitest" : "Jest");
  if (allDeps?.["react-router-dom"]) techStack.push("React Router");
  if (allDeps?.["@tanstack/react-query"]) techStack.push("TanStack Query");
  if (allDeps?.zod) techStack.push("Zod");
  if (allDeps?.dotenv) techStack.push("dotenv");
  if (allDeps?.axios) techStack.push("Axios");

  // Detect project structure
  const topDirs = fs.readdirSync(repositoryPath).filter(e => {
    try { return fs.statSync(path.join(repositoryPath, e)).isDirectory() && !IGNORED.has(e) && !e.startsWith("."); } catch { return false; }
  });

  const hasDocker = fs.existsSync(path.join(repositoryPath, "Dockerfile")) || fs.existsSync(path.join(repositoryPath, "docker-compose.yml")) || fs.existsSync(path.join(repositoryPath, "docker-compose.yaml"));
  const hasCI = fs.existsSync(path.join(repositoryPath, ".github")) || fs.existsSync(path.join(repositoryPath, ".gitlab-ci.yml"));
  const hasTests = topDirs.some(d => d === "__tests__" || d === "test" || d === "tests" || d === "spec");

  // Count files by language
  const fileCounts: Record<string, number> = {};
  for (const file of walkFiles(repositoryPath, [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".rb", ".css", ".scss", ".html", ".json", ".yaml", ".yml", ".md"])) {
    const ext = path.extname(file);
    fileCounts[ext] = (fileCounts[ext] || 0) + 1;
  }

  const sections: ReadmeSection[] = [];
  const badges: string[] = [];

  if (version) badges.push(`![Version](https://img.shields.io/badge/version-${version}-blue)`);
  if (license) badges.push(`![License](https://img.shields.io/badge/license-${license}-green)`);
  if (techStack.length) badges.push(`![Stack](https://img.shields.io/badge/stack-${techStack[0].toLowerCase()}-purple)`);

  sections.push({ title: "About", content: description || `A ${techStack.join(" + ") || "software"} project.`, level: 2 });

  if (techStack.length) {
    sections.push({ title: "Tech Stack", content: techStack.map(t => `- **${t}**`).join("\n"), level: 2 });
  }

  // Structure
  const structureLines: string[] = ["```"];
  for (const dir of topDirs) {
    const subPath = path.join(repositoryPath, dir);
    structureLines.push(`${dir}/`);
    try {
      const entries = fs.readdirSync(subPath).slice(0, 8);
      entries.forEach((e, i) => {
        const prefix = i === entries.length - 1 ? "└── " : "├── ";
        structureLines.push(`  ${prefix}${e}`);
      });
      if (fs.readdirSync(subPath).length > 8) structureLines.push("  └── ...");
    } catch { /* skip */ }
  }
  structureLines.push("```");
  sections.push({ title: "Project Structure", content: structureLines.join("\n"), level: 2 });

  // Getting started
  const scripts = pkg?.scripts || {};
  const scriptLines: string[] = [];
  if (scripts.install) scriptLines.push(`\`\`\`bash\n${scripts.install}\n\`\`\``);
  if (scripts.dev) scriptLines.push(`\`\`\`bash\n${scripts.dev}\n\`\`\``);
  if (scripts.build) scriptLines.push(`\`\`\`bash\n${scripts.build}\n\`\`\``);
  if (scripts.test) scriptLines.push(`\`\`\`bash\n${scripts.test}\n\`\`\``);
  if (scriptLines.length) {
    sections.push({ title: "Getting Started", content: scriptLines.join("\n\n"), level: 2 });
  }

  // Scripts
  if (Object.keys(scripts).length) {
    sections.push({
      title: "Available Scripts",
      content: Object.entries(scripts).map(([k, v]) => `- \`${k}\`: \`${v}\``).join("\n"),
      level: 2,
    });
  }

  // Environment
  const envPath = path.join(repositoryPath, ".env.example");
  if (fs.existsSync(envPath)) {
    const envContent = readSafe(envPath);
    sections.push({ title: "Environment Variables", content: `\`\`\`env\n${envContent}\n\`\`\``, level: 2 });
  }

  // Docker
  if (hasDocker) {
    sections.push({ title: "Docker", content: "```bash\ndocker-compose up\n```", level: 2 });
  }

  // File stats
  if (Object.keys(fileCounts).length) {
    const extMap: Record<string, string> = { ".ts": "TypeScript", ".tsx": "TypeScript (React)", ".js": "JavaScript", ".jsx": "JavaScript (React)", ".py": "Python", ".go": "Go", ".rs": "Rust", ".java": "Java", ".css": "CSS", ".scss": "SCSS", ".html": "HTML", ".json": "JSON", ".yaml": "YAML", ".yml": "YAML", ".md": "Markdown" };
    sections.push({
      title: "File Statistics",
      content: Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).map(([ext, count]) => `- ${extMap[ext] || ext}: ${count} files`).join("\n"),
      level: 2,
    });
  }

  // Build raw markdown
  const lines: string[] = [];
  if (badges.length) { lines.push(badges.join(" ")); lines.push(""); }
  lines.push(`# ${name}`);
  if (description) lines.push(`\n${description}`);
  for (const section of sections) {
    lines.push("");
    lines.push(`${"#".repeat(section.level)} ${section.title}`);
    lines.push("");
    lines.push(section.content);
  }
  lines.push("");

  return { title: name, description, sections, badges, rawMarkdown: lines.join("\n") };
};

// ─── API Documentation ───────────────────────────────────────────────

export const generateApiDocs = (repositoryPath: string): ApiDocsResult => {
  const routeFiles = walkFiles(repositoryPath, [".ts", ".js"]);
  const allEndpoints: ApiEndpoint[] = [];

  for (const file of routeFiles) {
    const content = readSafe(file);
    const lines = content.split("\n");
    const relPath = path.relative(repositoryPath, file).replaceAll("\\", "/");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/router\.(get|post|put|delete|patch|all)\s*\(\s*["'`()]([^"'`]+)["'`)]/);
      if (!match) continue;

      const method = match[1].toUpperCase();
      const routePath = match[2];
      const hasAuth = line.includes("requireAuth") || lines.slice(Math.max(0, i - 3), i + 1).some(l => l.includes("requireAuth"));

      // Extract handler name
      const handlerMatch = line.match(/(?:,\s*(\w+Controller|\w+))/);
      const handler = handlerMatch?.[1] || "anonymous";

      // Extract JSDoc above
      const description = extractJSDocAbove(lines, i) || "";

      allEndpoints.push({ method, path: routePath, handler, auth: hasAuth, description, file: relPath, line: i + 1 });
    }
  }

  // Group by prefix
  const groupMap = new Map<string, ApiEndpoint[]>();
  for (const ep of allEndpoints) {
    const parts = ep.path.split("/").filter(Boolean);
    const prefix = parts.length > 1 ? `/${parts[0]}/${parts[1]}` : ep.path;
    if (!groupMap.has(prefix)) groupMap.set(prefix, []);
    groupMap.get(prefix)!.push(ep);
  }

  const groups: ApiDocGroup[] = Array.from(groupMap.entries()).map(([prefix, endpoints]) => ({
    group: prefix.replace(/^\//, "").replace(/\//g, " / ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    prefix,
    endpoints: endpoints.sort((a, b) => a.path.localeCompare(b.path)),
  })).sort((a, b) => a.prefix.localeCompare(b.prefix));

  return {
    groups,
    totalEndpoints: allEndpoints.length,
    authEndpoints: allEndpoints.filter(e => e.auth).length,
    publicEndpoints: allEndpoints.filter(e => !e.auth).length,
  };
};

// ─── Function Documentation ──────────────────────────────────────────

export const generateFunctionDocs = (repositoryPath: string): FunctionDoc[] => {
  const files = walkFiles(repositoryPath, [".ts", ".tsx", ".js", ".jsx"]);
  const functions: FunctionDoc[] = [];

  for (const file of files) {
    const content = readSafe(file);
    const lines = content.split("\n");
    const relPath = path.relative(repositoryPath, file).replaceAll("\\", "/");

    const patterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?/g,
      /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?=\s*(?:async\s*)?(?:<[^>]*>)?\s*\(([^)]*)\)(?:\s*:\s*([^\s{=>]+))?\s*=>/g,
      /(?:export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?=\s*(?:async\s*)?(?:<[^>]*>)?\s*(?:function)\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?/g,
    ];

    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        const paramsRaw = match[2] || "";
        const returnType = match[3] || "void";

        if (["if", "for", "while", "switch", "catch", "return", "import", "export", "const", "let", "var", "class", "type", "interface"].includes(name)) continue;

        const lineNum = content.substring(0, match.index).split("\n").length;
        const description = extractJSDocAbove(lines, lineNum);
        const isExported = content.includes(`export`) && (content.includes(`export default ${name}`) || content.includes(`export { ${name}`) || content.includes(`export const ${name}`) || content.includes(`export function ${name}`));
        const isAsync = match[0].includes("async");
        const params = paramsRaw.split(",").filter(p => p.trim()).map(p => extractParamType(p));
        const bodyStart = lineNum;
        let bodyEnd = bodyStart;
        let depth = 0;
        for (let j = lineNum - 1; j < lines.length; j++) {
          for (const ch of lines[j]) { if (ch === "{") depth++; if (ch === "}") depth--; }
          if (depth === 0 && j > lineNum - 1) { bodyEnd = j + 1; break; }
        }
        const body = lines.slice(lineNum - 1, bodyEnd).join("\n");
        const complexity = countComplexity(body);

        functions.push({
          name, file: relPath, line: lineNum, endLine: bodyEnd,
          params: params.map(p => ({ ...p, description: "" })),
          returnType: returnType.replace(/[;{}]$/, ""),
          description, examples: [], isExported, isAsync, complexity, tags: [],
        });
      }
    }
  }

  return functions.sort((a, b) => b.complexity - a.complexity);
};

// ─── Class Documentation ─────────────────────────────────────────────

export const generateClassDocs = (repositoryPath: string): ClassDoc[] => {
  const files = walkFiles(repositoryPath, [".ts", ".tsx", ".js", ".jsx"]);
  const classes: ClassDoc[] = [];

  for (const file of files) {
    const content = readSafe(file);
    const lines = content.split("\n");
    const relPath = path.relative(repositoryPath, file).replaceAll("\\", "/");

    const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^\s{]+(?:\s*,\s*[^\s{]+)*))?\s*\{/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const extendsClass = match[2] || null;
      const implementsList = match[3] ? match[3].split(",").map(s => s.trim()) : [];
      const lineNum = content.substring(0, match.index).split("\n").length;
      const description = extractJSDocAbove(lines, lineNum);

      // Find class body
      let depth = 0;
      let endLine = lineNum;
      const bodyStart = lineNum;
      for (let j = lineNum - 1; j < lines.length; j++) {
        for (const ch of lines[j]) { if (ch === "{") depth++; if (ch === "}") depth--; }
        if (depth === 0 && j > lineNum - 1) { endLine = j + 1; break; }
      }
      const bodyLines = lines.slice(lineNum - 1, endLine);

      // Extract methods
      const methodRegex = /(public|private|protected|static|async|get|set|\s)+\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^\s{]+))?\s*[{]/g;
      const methods: ClassDoc["methods"] = [];
      const methodBody = bodyLines.join("\n");
      let methodMatch;
      while ((methodMatch = methodRegex.exec(methodBody)) !== null) {
        const mLine = methodBody.substring(0, methodMatch.index).split("\n").length + lineNum - 1;
        const vis = methodMatch[1]?.trim() || "public";
        methods.push({
          name: methodMatch[2],
          params: methodMatch[3] || "",
          returnType: methodMatch[4] || "void",
          description: extractJSDocAbove(lines, mLine),
          line: mLine,
          isStatic: vis.includes("static"),
          visibility: vis.includes("private") ? "private" : vis.includes("protected") ? "protected" : "public",
        });
      }

      // Extract properties
      const propRegex = /(public|private|protected|static)?\s+(\w+)\s*(?::\s*([^\s;=]+))?\s*[;=]/g;
      const properties: ClassDoc["properties"] = [];
      let propMatch;
      while ((propMatch = propRegex.exec(methodBody)) !== null) {
        const pLine = methodBody.substring(0, propMatch.index).split("\n").length + lineNum - 1;
        const pName = propMatch[2];
        if (["constructor", "name", "length", "prototype"].includes(pName)) continue;
        properties.push({
          name: pName,
          type: propMatch[3] || "any",
          description: extractJSDocAbove(lines, pLine),
          line: pLine,
          visibility: propMatch[1]?.includes("private") ? "private" : propMatch[1]?.includes("protected") ? "protected" : "public",
        });
      }

      // Constructor
      const ctorRegex = /constructor\s*\(([^)]*)\)/;
      const ctorMatch = methodBody.match(ctorRegex);
      const constructor = ctorMatch ? { params: ctorMatch[1], description: "" } : null;

      classes.push({
        name, file: relPath, line: lineNum, endLine, description,
        extends: extendsClass, implements: implementsList,
        methods, properties, constructor, isExported: content.includes(`export class ${name}`), tags: [],
      });
    }
  }

  return classes;
};

// ─── Architecture Documentation ──────────────────────────────────────

export const generateArchitectureDocs = (repositoryPath: string): ArchitectureDocsResult => {
  const topDirs = fs.readdirSync(repositoryPath).filter(e => {
    try { return fs.statSync(path.join(repositoryPath, e)).isDirectory() && !IGNORED.has(e) && !e.startsWith("."); } catch { return false; }
  });

  const modules: ArchModule[] = [];
  const depMap = new Map<string, Map<string, number>>();
  const entryPoints: string[] = [];

  // Detect entry points
  const pkgPath = path.join(repositoryPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(readSafe(pkgPath));
    if (pkg.main) entryPoints.push(pkg.main);
    if (pkg.bin) entryPoints.push(typeof pkg.bin === "string" ? pkg.bin : Object.values(pkg.bin).flat().join(", "));
    if (pkg.scripts?.start) entryPoints.push("npm start");
    if (pkg.scripts?.dev) entryPoints.push("npm run dev");
  }
  const indexFiles = ["src/index.ts", "src/index.js", "src/main.ts", "src/main.js", "app.ts", "app.js", "index.ts", "index.js"];
  for (const f of indexFiles) {
    if (fs.existsSync(path.join(repositoryPath, f))) entryPoints.push(f);
  }

  for (const dir of topDirs) {
    const dirPath = path.join(repositoryPath, dir);
    const relDir = dir;
    let lineCount = 0;
    let fileCount = 0;
    const exports: string[] = [];

    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d)) {
        if (IGNORED.has(entry)) continue;
        const full = path.join(d, entry);
        try {
          const stat = fs.statSync(full);
          if (stat.isDirectory()) { walk(full); continue; }
          if (!stat.isFile()) continue;
          const ext = path.extname(entry);
          if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) continue;
          fileCount++;
          const content = readSafe(full);
          lineCount += content.split("\n").length;

          // Detect exports
          const expRegex = /export\s+(?:default\s+)?(?:function|class|const|interface|type)\s+(\w+)/g;
          let expMatch;
          while ((expMatch = expRegex.exec(content)) !== null) {
            exports.push(expMatch[1]);
          }

          // Track cross-module deps
          const importRegex = /from\s+["']\.\.?\/([^"']+)["']/g;
          let impMatch;
          while ((impMatch = importRegex.exec(content)) !== null) {
            const target = impMatch[1].split("/")[0];
            if (target && target !== relDir && topDirs.includes(target)) {
              if (!depMap.has(relDir)) depMap.set(relDir, new Map());
              const targets = depMap.get(relDir)!;
              targets.set(target, (targets.get(target) || 0) + 1);
            }
          }
        } catch { /* skip */ }
      }
    };
    walk(dirPath);

    modules.push({
      name: dir,
      path: relDir,
      fileCount,
      lineCount,
      description: `${fileCount} files, ${lineCount} lines`,
      exports: [...new Set(exports)].slice(0, 20),
    });
  }

  // Build dependencies
  const dependencies: ArchDependency[] = [];
  for (const [from, targets] of depMap) {
    for (const [to, weight] of targets) {
      dependencies.push({ from, to, weight });
    }
  }

  // Classify layers
  const typeMap: Record<string, string[]> = { Pages: [], Components: [], Services: [], Models: [], Utils: [], Config: [], Tests: [] };
  for (const mod of modules) {
    const lower = mod.name.toLowerCase();
    if (lower.includes("page") || lower.includes("view") || lower.includes("screen")) typeMap.Pages.push(mod.name);
    else if (lower.includes("component") || lower.includes("ui")) typeMap.Components.push(mod.name);
    else if (lower.includes("service") || lower.includes("util") || lower.includes("helper")) typeMap.Services.push(mod.name);
    else if (lower.includes("model") || lower.includes("type") || lower.includes("schema")) typeMap.Models.push(mod.name);
    else if (lower.includes("test") || lower.includes("spec")) typeMap.Tests.push(mod.name);
    else if (lower.includes("config") || lower.includes("env")) typeMap.Config.push(mod.name);
    else typeMap.Utils.push(mod.name);
  }
  const layers = Object.entries(typeMap)
    .filter(([_, mods]) => mods.length > 0)
    .map(([name, modules]) => ({ name, modules }));

  const summary = `This project has ${modules.length} top-level modules with ${modules.reduce((s, m) => s + m.fileCount, 0)} source files and ${modules.reduce((s, m) => s + m.lineCount, 0).toLocaleString()} total lines of code.`;

  return { modules, dependencies, layers, entryPoints: [...new Set(entryPoints)], summary };
};

// ─── Combined ────────────────────────────────────────────────────────

export const generateAllDocumentation = (repositoryPath: string): DocGeneratorResult => {
  return {
    readme: generateReadme(repositoryPath),
    apiDocs: generateApiDocs(repositoryPath),
    functionDocs: generateFunctionDocs(repositoryPath),
    classDocs: generateClassDocs(repositoryPath),
    architecture: generateArchitectureDocs(repositoryPath),
  };
};
