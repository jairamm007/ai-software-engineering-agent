import { semanticSearch, multiQuerySearch } from "../services/search.service.js";
import { PlanResult } from "./planner.agent.js";

export const retrieverAgent = async (
  plan: PlanResult
) => {
  if (!plan.needsRepositorySearch) {
    return [];
  }

  const limit =
    plan.task === "review" ||
    plan.task === "security" ||
    plan.task === "test" ||
    plan.task === "architecture"
      ? 20
      : plan.task === "documentation"
        ? 15
        : 12;

  const chunks = await multiQuerySearch(
    plan.question,
    limit,
    plan.repositoryId,
    plan.filePath
  );

  if (chunks.length < 5 && plan.repositoryId) {
    const moreChunks = await semanticSearch(
      plan.question,
      limit,
      plan.repositoryId,
      plan.filePath
    );

    const seen = new Set(
      chunks.map((c) => `${c.filePath}:${c.startLine}-${c.endLine}`)
    );
    for (const mc of moreChunks) {
      const key = `${mc.filePath}:${mc.startLine}-${mc.endLine}`;
      if (!seen.has(key)) {
        chunks.push(mc);
        seen.add(key);
      }
    }
    chunks.sort((a, b) => a.distance - b.distance);
  }

  return chunks.slice(0, limit);
};
