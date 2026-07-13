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
    plan.task === "test"
      ? 8
      : 6;

  return semanticSearch(
    plan.question,
    limit,
    plan.repositoryId,
    plan.filePath
  );
};
