import { semanticSearch } from "../services/search.service.js";
import { PlanResult } from "./planner.agent.js";

export const retrieverAgent = async (
  plan: PlanResult
) => {
  if (!plan.needsRepositorySearch) {
    return [];
  }

  return semanticSearch(
    plan.question,
    5,
    plan.repositoryId,
    plan.filePath
  );
};