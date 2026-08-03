import type { Recommendation } from "../types.js";
import type { SecurityFinding } from "../../../pipeline/types.js";
import { generateJsonObject } from "./llm.util.js";
import {
  buildRecommendationsFromSources,
  type CodeReviewHealthSource,
  type DocHealthSource,
  type PerfHealthSource,
  type SecurityHealthSource,
} from "./health.generator.js";

export interface RecommendationsInput {
  security: SecurityHealthSource | null;
  perf: PerfHealthSource | null;
  codeReview: CodeReviewHealthSource | null;
  docHealth: DocHealthSource | null;
}

const SYSTEM_PROMPT =
  "You are a pragmatic software engineering advisor. Given a list of detected findings, " +
  "rewrite each one as a clear, specific, actionable recommendation. " +
  "Return a JSON array only, with no preamble. Each item: {\"category\": \"security\" | \"performance\" | \"code_quality\" | \"documentation\" | \"general\", \"severity\": \"high\" | \"medium\" | \"low\", \"text\": string, \"detail\": string}. " +
  "Do not invent new findings, and do not exceed the number of findings provided.";

export const generateRecommendations = async (
  input: RecommendationsInput
): Promise<Recommendation[]> => {
  const deterministic = buildRecommendationsFromSources(input);

  const findingsForLLM = deterministic.map((r) => ({
    category: r.category,
    severity: r.severity,
    text: r.text,
    detail: r.detail ?? "",
  }));

  const userPrompt = `Rewrite these findings as actionable recommendations. Ground every recommendation in the findings provided; do not add anything new.\n\nFindings (JSON):\n${JSON.stringify(findingsForLLM, null, 2)}`;

  const parsed = await generateJsonObject<Recommendation[]>(
    SYSTEM_PROMPT,
    userPrompt,
    deterministic
  );

  if (!Array.isArray(parsed) || parsed.length === 0) return deterministic;

  const valid = parsed
    .filter(
      (r) =>
        r &&
        typeof r.text === "string" &&
        r.text.trim().length > 0 &&
        ["security", "performance", "code_quality", "documentation", "general"].includes(r.category) &&
        ["high", "medium", "low"].includes(r.severity)
    )
    .map((r) => ({
      category: r.category as Recommendation["category"],
      severity: r.severity as Recommendation["severity"],
      text: r.text.trim(),
      detail: typeof r.detail === "string" ? r.detail : undefined,
    }));

  return valid.length > 0 ? valid.slice(0, 15) : deterministic;
};
