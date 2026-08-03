import type {
  ArchitectureLayer,
  ArchitectureResult,
  InsightModule,
  TechStackItem,
} from "../types.js";
import { repoDirExists, repoFileExists, readRepoJson } from "../fs.util.js";
import { generatePlainText } from "./llm.util.js";

export interface ArchitectureInput {
  localPath: string | null;
  files: { path: string }[];
  modules: InsightModule[];
  techStack: TechStackItem[];
}

interface PackageJson {
  main?: string;
  bin?: string | Record<string, string>;
  scripts?: Record<string, string>;
}

const LAYER_ORDER = [
  "Presentation",
  "Application",
  "Domain",
  "Data & Infrastructure",
  "Utilities & Tests",
] as const;

const LAYER_KEYWORDS: Record<string, string[]> = {
  Presentation: ["page", "view", "screen", "component", "ui", "feature", "frontend"],
  Application: ["service", "controller", "agent", "hook", "store", "chat", "pipeline", "search", "integration", "provider", "client"],
  Domain: ["model", "type", "entit", "interface", "schema", "validat", "repository"],
  "Data & Infrastructure": ["db", "database", "migration", "prisma", "config", "middleware", "socket", "email", "cron", "job", "worker", "infra", "graphql"],
  "Utilities & Tests": ["util", "lib", "helper", "constant", "test", "script", "doc", "public", "asset", "template"],
};

const classifyLayers = (modules: InsightModule[]): ArchitectureLayer[] => {
  const layers: ArchitectureLayer[] = LAYER_ORDER.map((name) => ({ name, modules: [] }));

  for (const module of modules) {
    const lower = module.path.toLowerCase();
    let placed = false;
    for (const layerName of LAYER_ORDER) {
      if (LAYER_KEYWORDS[layerName].some((kw) => lower.includes(kw))) {
        layers.find((l) => l.name === layerName)?.modules.push(module.path);
        placed = true;
        break;
      }
    }
    if (!placed) {
      layers[layers.length - 1].modules.push(module.path);
    }
  }

  return layers.filter((l) => l.modules.length > 0);
};

const detectEntryPoints = (
  localPath: string | null,
  files: { path: string }[],
  techStack: TechStackItem[]
): string[] => {
  const entryPoints: string[] = [];

  const pkg = readRepoJson<PackageJson>(localPath, "package.json");
  if (pkg?.main) entryPoints.push(pkg.main);
  if (pkg?.bin) {
    if (typeof pkg.bin === "string") {
      entryPoints.push(pkg.bin);
    } else {
      entryPoints.push(...Object.values(pkg.bin));
    }
  }
  if (pkg?.scripts?.start) entryPoints.push("npm start");
  if (pkg?.scripts?.dev) entryPoints.push("npm run dev");

  const candidates = [
    "src/index.ts",
    "src/index.js",
    "src/main.ts",
    "src/main.js",
    "app.ts",
    "app.js",
    "index.ts",
    "index.js",
  ];
  for (const candidate of candidates) {
    if (repoFileExists(localPath, candidate)) {
      entryPoints.push(candidate);
    }
  }

  const hasNext = techStack.some((t) => t.name === "Next.js");
  if (hasNext && repoDirExists(localPath, "app")) entryPoints.push("app/ (Next.js App Router)");
  if (hasNext && repoDirExists(localPath, "pages")) entryPoints.push("pages/ (Next.js Pages Router)");

  if (entryPoints.length === 0) {
    const fallback = files.some((f) => f.path === "src/index.ts" || f.path === "src/main.ts");
    if (fallback) entryPoints.push("src/index.ts");
  }

  return [...new Set(entryPoints)].slice(0, 6);
};

const buildRequestFlow = (layers: ArchitectureLayer[], techStack: TechStackItem[]): string => {
  const byName = new Map(layers.map((l) => [l.name, l]));
  const presentation = byName.get("Presentation")?.modules.join(", ") ?? "frontend";
  const application = byName.get("Application")?.modules.join(", ") ?? "application layer";
  const domain = byName.get("Domain")?.modules.join(", ") ?? "domain models";
  const data = byName.get("Data & Infrastructure")?.modules.join(", ") ?? "data layer";
  return `HTTP request -> ${presentation} -> ${application} -> ${domain} -> ${data} -> response`;
};

const SYSTEM_PROMPT =
  "You are a software architect. Explain the architecture of this project in 3-5 plain sentences " +
  "using ONLY the deterministic facts provided (layers, entry points, tech stack). " +
  "Do not invent modules, databases, or frameworks. Return only the prose, no markdown.";

const buildFallbackProse = (
  layers: ArchitectureLayer[],
  entryPoints: string[],
  techStack: TechStackItem[]
): string => {
  const layerSummary =
    layers.length > 0
      ? layers.map((l) => `${l.name} (${l.modules.join(", ")})`).join("; ")
      : "no distinct layers were detected";
  const entry =
    entryPoints.length > 0
      ? ` Entry is via ${entryPoints.join(" or ")}.`
      : "";
  const stack =
    techStack.length > 0
      ? ` The stack includes ${techStack
          .map((t) => t.name)
          .slice(0, 8)
          .join(", ")}.`
      : "";
  return `The project is organized into the following layers: ${layerSummary}.${entry}${stack}`;
};

export const generateArchitecture = async (
  input: ArchitectureInput
): Promise<ArchitectureResult> => {
  const layers = classifyLayers(input.modules);
  const entryPoints = detectEntryPoints(
    input.localPath,
    input.files,
    input.techStack
  );
  const requestFlow = buildRequestFlow(layers, input.techStack);
  const fallback = buildFallbackProse(layers, entryPoints, input.techStack);

  const facts = {
    layers: layers.map((l) => ({ name: l.name, modules: l.modules })),
    entryPoints,
    techStack: input.techStack.map((t) => t.name),
  };
  const userPrompt = `Explain the architecture of this project. Ground every claim in these facts only.\n\nFacts (JSON):\n${JSON.stringify(facts, null, 2)}`;
  const prose = await generatePlainText(SYSTEM_PROMPT, userPrompt, fallback);

  return { layers, entryPoints, requestFlow, prose };
};
