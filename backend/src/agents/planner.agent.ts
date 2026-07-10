export type PlannerTask =
  | "answer"
  | "review"
  | "architecture";

export interface PlanResult {
  question: string;
  task: PlannerTask;
  needsRepositorySearch: boolean;
}

export const plannerAgent = async (
  question: string
): Promise<PlanResult> => {
  const lower = question.toLowerCase();

  let task: PlannerTask = "answer";

  if (
    lower.includes("review") ||
    lower.includes("bug") ||
    lower.includes("security")
  ) {
    task = "review";
  } else if (
    lower.includes("architecture") ||
    lower.includes("folder") ||
    lower.includes("structure") ||
    lower.includes("flow")
  ) {
    task = "architecture";
  }

  return {
    question,
    task,
    needsRepositorySearch: true,
  };
};