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
  confidence: number;
}

interface TaskRule {
  task: PlannerTask;
  keywords: RegExp[];
  weight: number;
}

const TASK_RULES: TaskRule[] = [
  {
    task: "pullRequest",
    keywords: [/\bpr\b/i, /pull\s*request/i, /merge\s*request/i, /github\s*pr/i, /create\s*pr/i, /open\s*pr/i, /submit\s*pr/i, /pr\s*description/i, /pr\s*summary/i],
    weight: 10,
  },
  {
    task: "commit",
    keywords: [/commit/i, /git\s*commit/i, /commit\s*message/i, /commit\s*msg/i, /conventional\s*commit/i, /changelog/i],
    weight: 10,
  },
  {
    task: "security",
    keywords: [/secur/i, /vulnerab/i, /vulnerabilit/i, /scan/i, /owasp/i, /audit/i, /xss/i, /injection/i, /exploit/i, /cve/i, /sanitiz/i, /csrf/i, /auth.*bypass/i, /privilege/i, /secret.*expos/i, /hardcod.*secret/i, /sql.*inject/i],
    weight: 10,
  },
  {
    task: "review",
    keywords: [/\breview\b/i, /\bbug\b/i, /performance/i, /code\s*quality/i, /smell/i, /anti.?pattern/i, /code\s*smell/i, /issue/i, /problem/i, /wrong/i, /broken/i, /error/i, /failing/i, /crash/i],
    weight: 9,
  },
  {
    task: "test",
    keywords: [/unit\s*test/i, /generat.*test/i, /\bjest\b/i, /\bvitest\b/i, /test\s*case/i, /test\s*suite/i, /\btests?\b/i, /testing/i, /coverage/i, /\bmock/i, /\bstub\b/i, /\bspy\b/i, /e2e/i, /integration\s*test/i, /end.to.end/i],
    weight: 10,
  },
  {
    task: "architecture",
    keywords: [/architect/i, /structure/i, /folder/i, /\bflow\b/i, /design\s*pattern/i, /diagram/i, /dependen/i, /module/i, /component\s*graph/i, /data\s*flow/i, /system\s*design/i, /high.level/i, /overview/i, /layout/i],
    weight: 8,
  },
  {
    task: "documentation",
    keywords: [/document/i, /documentation/i, /\breadme\b/i, /jsdoc/i, /api\s*doc/i, /docstring/i, /comment/i, /generate\s*doc/i, /write\s*doc/i, /explain\s*code/i, /help.*understand/i],
    weight: 9,
  },
  {
    task: "fix",
    keywords: [/\bfix\b/i, /\bimprove\b/i, /\brefactor\b/i, /\boptimize\b/i, /\brewrite\b/i, /\bsuggest/i, /\bcleanup\b/i, /\bclean\s*up\b/i, /make\s*better/i, /enhance/i, /upgrade/i, /moderniz/i, /simplif/i, /reduce\s*complexity/i],
    weight: 8,
  },
  {
    task: "explain",
    keywords: [/\bexplain\b/i, /\bunderstand\b/i, /what\s*does/i, /how\s*does/i, /what\s*is/i, /\bdescribe\b/i, /tell\s*me\s*about/i, /walk.*through/i, /break\s*down/i, /clarif/i, /what.*purpose/i, /how.*work/i],
    weight: 7,
  },
];

export const plannerAgent = async (
  input: {
    question: string;
    repositoryId?: string;
    filePath?: string;
  }
): Promise<PlanResult> => {
  const { question, repositoryId, filePath } = input;

  // Score each task type
  const scores: Map<PlannerTask, number> = new Map();

  for (const rule of TASK_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (keyword.test(question)) {
        score += rule.weight;
      }
    }
    if (score > 0) {
      scores.set(rule.task, score);
    }
  }

  // Find the highest scoring task
  let bestTask: PlannerTask = "answer";
  let bestScore = 0;
  for (const [task, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestTask = task;
    }
  }

  // Calculate confidence (0-1)
  const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1) : 0.5;

  // If no strong match, default to answer/explain
  if (bestScore === 0) {
    bestTask = "answer";
  }

  return {
    question,
    task: bestTask,
    needsRepositorySearch: true,
    repositoryId,
    filePath,
    confidence,
  };
};
