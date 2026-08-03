import type { InsightModule, InsightSummary } from "../types.js";
import { generatePlainText } from "./llm.util.js";

const SYSTEM_PROMPT =
  "You are a senior software engineer writing a concise plain-language overview of a codebase for a developer joining the team. " +
  "Base every sentence strictly on the structured facts provided. Do not invent technologies, features, or frameworks that are not listed. " +
  "Return only the overview text: 3 to 5 sentences, no markdown, no headings, no preamble.";

const buildFallback = (
  summary: InsightSummary,
  modules: InsightModule[]
): string => {
  const parts = [
    `${summary.name} is a ${summary.primaryLanguage.toLowerCase()}-based project`,
  ];
  if (summary.frontendFramework) parts.push(`with a ${summary.frontendFramework} frontend`);
  if (summary.backendFramework) parts.push(`backed by ${summary.backendFramework}`);
  if (summary.database) parts.push(`and a ${summary.database} data store`);
  const header = parts.join(", ") + ".";
  const moduleText =
    modules.length > 0
      ? ` The codebase is organized into ${modules.length} module${modules.length === 1 ? "" : "s"} (${modules
          .slice(0, 8)
          .map((m) => m.name)
          .join(", ")}).`
      : "";
  const stats = ` It contains ${summary.totalFiles} indexed files across ${summary.totalFolders} folders.`;
  return `${header}${moduleText}${stats}`;
};

export const generateOverviewText = async (
  summary: InsightSummary,
  modules: InsightModule[]
): Promise<string> => {
  const fallback = buildFallback(summary, modules);
  const facts = {
    name: summary.name,
    primaryLanguage: summary.primaryLanguage,
    frontendFramework: summary.frontendFramework,
    backendFramework: summary.backendFramework,
    database: summary.database,
    vectorDb: summary.vectorDb,
    aiFramework: summary.aiFramework,
    totalFiles: summary.totalFiles,
    totalFolders: summary.totalFolders,
    modules: modules.slice(0, 15).map((m) => m.name),
  };
  const userPrompt = `Write a concise 3-5 sentence plain-language overview of this project. Ground every claim in these facts only.\n\nFacts (JSON):\n${JSON.stringify(facts, null, 2)}`;
  return generatePlainText(SYSTEM_PROMPT, userPrompt, fallback);
};
