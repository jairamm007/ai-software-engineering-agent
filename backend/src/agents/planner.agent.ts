export interface PlanResult {
  question: string;
  task:
    | "explain"
    | "bug"
    | "review"
    | "documentation"
    | "general";

  needsRepositorySearch: boolean;
}

export const plannerAgent = async (
  question: string
): Promise<PlanResult> => {
  const q = question.toLowerCase();

  let task: PlanResult["task"] = "general";

  if (
    q.includes("review") ||
    q.includes("code review") ||
    q.includes("quality")
  ) {
    task = "review";
  } else if (
    q.includes("bug") ||
    q.includes("error")
  ) {
    task = "bug";
  } else if (
    q.includes("documentation") ||
    q.includes("readme")
  ) {
    task = "documentation";
  } else if (
    q.includes("explain") ||
    q.includes("what") ||
    q.includes("how")
  ) {
    task = "explain";
  }

  return {
    question,
    task,
    needsRepositorySearch: true,
  };
};