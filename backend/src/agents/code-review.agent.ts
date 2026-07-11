import { executeAgent } from "./agent-executor.js";

import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export interface CodeReviewResult {
  summary: string;
}

export const codeReviewAgent = async (
  plan: PlanResult,
  reasoning: ReasoningResult
): Promise<CodeReviewResult> => {
  const summary = await executeAgent(
    "review",
    reasoning.context,
    plan.question
  );

  return {
    summary,
  };
};