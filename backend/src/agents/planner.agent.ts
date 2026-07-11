export type PlannerTask =
  | "answer"
  | "review"
  | "fix"
  | "commit"
  | "architecture"
  | "documentation"
  | "pullRequest"
  | "explain"
  | "refactor"
  | "test"
  | "security";

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
    lower.includes("pull request") ||
    /\bpr\b/.test(lower) ||
    lower.includes("merge request") ||
    lower.includes("github pr")
  ) {
    task = "pullRequest";
  }

  else if (
    lower.includes("commit") ||
    lower.includes("git commit")
  ) {
    task = "commit";
  }

  else if (
    lower.includes("fix") ||
    lower.includes("improve") ||
    lower.includes("refactor") ||
    lower.includes("optimize") ||
    lower.includes("rewrite")
  ) {
    task = "fix";
  }

  else if (
    lower.includes("security") ||
    lower.includes("vulnerability") ||
    lower.includes("scan") ||
    lower.includes("owasp") ||
    lower.includes("audit")
  ) {
    task = "security";
  }

  else if (
    lower.includes("review") ||
    lower.includes("bug") ||
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
    lower.includes("unit test") ||
    lower.includes("generate tests") ||
    lower.includes("jest") ||
    lower.includes("vitest") ||
    /\btests?\b/.test(lower)
  ) {
    task = "test";
  }

  return {
    question,
    task,
    needsRepositorySearch: true,
    repositoryId,
    filePath,
  };
};
