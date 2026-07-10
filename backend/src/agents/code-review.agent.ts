import { executeAgent } from "./agent-executor.js";

import { ReasoningResult } from "./reasoner.agent.js";

export interface CodeReviewResult {
  summary: string;
}

export const codeReviewAgent = async (
  reasoning: ReasoningResult
): Promise<CodeReviewResult> => {
  const summary = await executeAgent(
    "review",
    reasoning.context,
    "Review this repository"
  );

  return {
    summary,
  };
};