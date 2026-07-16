import { semanticSearch } from "../services/search.service.js";
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
      ? 25
      : plan.task === "documentation"
        ? 20
        : 15;

  // Primary search
  const chunks = await semanticSearch(
    plan.question,
    limit,
    plan.repositoryId,
    plan.filePath
  );

  // Iterative retrieval: if we got few results, try a broader search
  if (chunks.length < limit && plan.repositoryId) {
    const broaderQuery = plan.question
      .replace(/how|what|why|where|when|which|who/gi, "")
      .trim()
      .slice(0, 100);

    if (broaderQuery.length > 10) {
      const moreChunks = await semanticSearch(
        broaderQuery,
        Math.max(5, limit - chunks.length),
        plan.repositoryId,
        plan.filePath
      );

      // Merge, deduplicate, and sort
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
  }

  return chunks.slice(0, limit);
};
