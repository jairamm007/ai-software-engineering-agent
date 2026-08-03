import fs from "fs";
import path from "path";
import type { InsightModule, RepositoryFileLite } from "../types.js";
import { CODE_EXTENSIONS, IGNORED_DIRS, readRepoFile } from "../fs.util.js";

export interface ModulesInput {
  localPath: string | null;
  files: RepositoryFileLite[];
}

export const detectModuleCandidates = (files: RepositoryFileLite[]): string[] => {
  const root = new Map<string, { hasCode: boolean }>();
  for (const f of files) {
    const seg = f.path.split("/")[0];
    if (!seg) continue;
    const entry = root.get(seg) ?? { hasCode: false };
    if (CODE_EXTENSIONS.includes(f.extension)) entry.hasCode = true;
    root.set(seg, entry);
  }
  return [...root.entries()]
    .filter(([, entry]) => entry.hasCode)
    .map(([name]) => name)
    .filter((n) => !IGNORED_DIRS.has(n) && !n.startsWith("."));
};

const RESPONSIBILITY_MAP: Record<string, string> = {
  auth: "Authentication and authorization flows",
  authentication: "Authentication and authorization flows",
  user: "User account and profile management",
  users: "User account and profile management",
  account: "User account and profile management",
  api: "HTTP API endpoints and request handling",
  routes: "Route definitions",
  router: "Route definitions",
  controllers: "HTTP request handling and orchestration",
  services: "Business logic and service orchestration",
  service: "Business logic and service orchestration",
  models: "Data models and domain entities",
  model: "Data models and domain entities",
  entities: "Data models and domain entities",
  repository: "Data access and persistence logic",
  repositories: "Data access and persistence logic",
  components: "Reusable UI components",
  component: "Reusable UI components",
  ui: "Reusable UI components",
  pages: "Page-level UI and routing views",
  page: "Page-level UI and routing views",
  views: "Page-level UI and routing views",
  view: "Page-level UI and routing views",
  utils: "Shared utility and helper functions",
  util: "Shared utility and helper functions",
  lib: "Shared libraries and helpers",
  helpers: "Shared utility and helper functions",
  types: "Shared type definitions and interfaces",
  interfaces: "Shared type definitions and interfaces",
  middleware: "HTTP middleware and request processing",
  config: "Application configuration and environment setup",
  configuration: "Application configuration and environment setup",
  constants: "Constant values and enumerations",
  hooks: "React hooks and custom stateful logic",
  store: "State management",
  stores: "State management",
  context: "React context providers",
  tests: "Automated tests and test helpers",
  test: "Automated tests and test helpers",
  __tests__: "Automated tests and test helpers",
  scripts: "Development, build and utility scripts",
  docs: "Project documentation",
  documentation: "Project documentation",
  email: "Email sending and templates",
  mailer: "Email sending and templates",
  notifications: "User notifications",
  notification: "User notifications",
  chat: "Chat functionality",
  socket: "WebSocket and realtime handling",
  websockets: "WebSocket and realtime handling",
  cron: "Scheduled jobs and background tasks",
  jobs: "Scheduled jobs and background tasks",
  workers: "Background workers",
  migrations: "Database migrations",
  seed: "Database seeding",
  seeds: "Database seeding",
  templates: "Templates and layout snippets",
  public: "Static assets and entry files",
  assets: "Static assets",
  static: "Static assets",
  infra: "Infrastructure and deployment configuration",
  infrastructure: "Infrastructure and deployment configuration",
  ai: "AI and LLM integration",
  agents: "AI agent definitions",
  rag: "Retrieval-augmented generation",
  search: "Search functionality",
  integration: "Third-party integrations",
  integrations: "Third-party integrations",
  pipeline: "Pipeline and workflow orchestration",
  client: "API client and network layer",
  providers: "Providers and external service adapters",
  db: "Database access layer",
  database: "Database access layer",
  graphql: "GraphQL schema and resolvers",
  features: "Feature-scoped application logic",
  modules: "Feature-scoped application logic",
  core: "Core shared application logic",
  shared: "Shared cross-cutting code",
  common: "Shared cross-cutting code",
};

const humanizeName = (name: string): string =>
  name
    .split(/[-_.]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const inferResponsibilities = (name: string): string[] => {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(RESPONSIBILITY_MAP)) {
    if (lower.includes(key)) return [value];
  }
  return [`Core functionality for the ${humanizeName(name).toLowerCase()} area`];
};

const detectModuleDependencies = (
  modulePath: string,
  localPath: string | null,
  candidates: string[]
): string[] => {
  if (!localPath) return [];
  const dir = path.join(localPath, modulePath);
  const deps = new Set<string>();
  const walk = (d: string) => {
    let entries: string[];
    try {
      entries = fs.readdirSync(d);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry) || entry.startsWith(".")) continue;
      const full = path.join(d, entry);
      let isDir = false;
      try {
        isDir = fs.statSync(full).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        walk(full);
        continue;
      }
      if (!CODE_EXTENSIONS.includes(path.extname(entry))) continue;
      const content = readRepoFile(localPath, path.relative(localPath, full).replaceAll("\\", "/")) ?? "";
      const importRegex = /from\s+["'](\.[^"']+)["']/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1].replace(/\.(ts|tsx|js|jsx)$/, "");
        const clean = importPath.replace(/^\.\.?\/+/, "");
        const target = clean.split("/")[0];
        if (target && target !== modulePath && candidates.includes(target)) {
          deps.add(target);
        }
      }
    }
  };
  walk(dir);
  return [...deps].sort();
};

export const detectModules = (input: ModulesInput): InsightModule[] => {
  const candidates = detectModuleCandidates(input.files);
  const modules: InsightModule[] = [];

  for (const candidate of candidates) {
    const prefix = `${candidate}/`;
    const files = input.files.filter((f) => f.path.startsWith(prefix));
    let lineCount = 0;
    if (input.localPath) {
      lineCount = countLinesInDir(input.localPath, candidate);
    }
    modules.push({
      name: humanizeName(candidate),
      path: candidate,
      fileCount: files.length,
      lineCount,
      responsibilities: inferResponsibilities(candidate),
      dependencies: detectModuleDependencies(candidate, input.localPath, candidates),
    });
  }

  return modules.sort((a, b) => b.fileCount - a.fileCount);
};

const countLinesInDir = (localPath: string, modulePath: string): number => {
  let total = 0;
  const walk = (d: string) => {
    let entries: string[];
    try {
      entries = fs.readdirSync(d);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry) || entry.startsWith(".")) continue;
      const full = path.join(d, entry);
      let isDir = false;
      try {
        isDir = fs.statSync(full).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        walk(full);
        continue;
      }
      if (!CODE_EXTENSIONS.includes(path.extname(entry))) continue;
      try {
        total += fs.readFileSync(full, "utf8").split("\n").length;
      } catch {
        /* skip */
      }
    }
  };
  walk(path.join(localPath, modulePath));
  return total;
};
