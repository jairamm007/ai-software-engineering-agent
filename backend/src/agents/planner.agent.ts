export type PlannerTask =
  | "answer"
  | "review"
  | "fix"
  | "architecture"
  | "documentation"
  | "explain"
  | "refactor"
  | "tests";

export interface PlanResult {
  question: string;
  task: PlannerTask;
  needsRepositorySearch: boolean;
  repositoryId?: string;
  filePath?: string;
}

export const plannerAgent = async (
  input: {
    question: string;
    repositoryId?: string;
    filePath?: string;
  }
): Promise<PlanResult> => {
  const { question, repositoryId, filePath } = input;

  const lower = question.toLowerCase();

  let task: PlannerTask = "answer";

  if (
    lower.includes("fix") ||
    lower.includes("improve") ||
    lower.includes("refactor") ||
    lower.includes("optimize") ||
    lower.includes("rewrite")
  ) {
    task = "fix";
  }

  else if (
    lower.includes("review") ||
    lower.includes("bug") ||
    lower.includes("security") ||
    lower.includes("performance")
  ) {
    task = "review";
  }

  else if (
    lower.includes("architecture") ||
    lower.includes("structure") ||
    lower.includes("folder") ||
    lower.includes("flow") ||
    lower.includes("design")
  ) {
    task = "architecture";
  }

  else if (
    lower.includes("document") ||
    lower.includes("documentation") ||
    lower.includes("readme")
  ) {
    task = "documentation";
  }

  else if (
    lower.includes("explain") ||
    lower.includes("understand")
  ) {
    task = "explain";
  }

  else if (
    lower.includes("test") ||
    lower.includes("unit test")
  ) {
    task = "tests";
  }

  return {
    question,
    task,
    needsRepositorySearch: true,
    repositoryId,
    filePath,
  };
};
