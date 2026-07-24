import { generateText } from "../ai/providers/llm.service.js";

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
  reasoning: string;
  subtasks: string[];
  priority: "low" | "medium" | "high" | "critical";
  estimatedComplexity: "simple" | "moderate" | "complex";
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

const regexPlan = (question: string): { task: PlannerTask; confidence: number; reasoning: string } => {
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

  let bestTask: PlannerTask = "answer";
  let bestScore = 0;
  for (const [task, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestTask = task;
    }
  }

  const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1) : 0.5;

  if (bestScore === 0) {
    bestTask = "answer";
  }

  const matchedTasks = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([task, score]) => `${task}(${score})`)
    .join(", ");

  return {
    task: bestTask,
    confidence,
    reasoning: `Regex analysis: matched tasks [${matchedTasks}]. Selected: ${bestTask} with confidence ${(confidence * 100).toFixed(0)}%`,
  };
};

const LLM_PLAN_PROMPT = `You are a task planner for a software engineering AI assistant. Analyze the user's question and determine:
1. The primary task type (one of: answer, review, fix, commit, architecture, documentation, pullRequest, test, security, explain, refactor)
2. Whether repository code search is needed
3. Key subtasks to accomplish
4. Priority level (low, medium, high, critical)
5. Complexity estimate (simple, moderate, complex)

Respond in EXACTLY this JSON format:
{
  "task": "<task_type>",
  "needsRepositorySearch": <true|false>,
  "reasoning": "<brief reasoning>",
  "subtasks": ["<subtask1>", "<subtask2>"],
  "priority": "<low|medium|high|critical>",
  "complexity": "<simple|moderate|complex>",
  "confidence": <0.0-1.0>
}

Valid task types: answer, review, fix, commit, architecture, documentation, pullRequest, test, security, explain, refactor`;

const llmPlan = async (question: string): Promise<{
  task: PlannerTask;
  confidence: number;
  needsRepositorySearch: boolean;
  reasoning: string;
  subtasks: string[];
  priority: PlanResult["priority"];
  estimatedComplexity: PlanResult["estimatedComplexity"];
} | null> => {
  try {
    const response = await generateText(
      LLM_PLAN_PROMPT,
      `Analyze this question and provide a task plan:\n\n${question}`
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    const validTasks: PlannerTask[] = [
      "answer", "review", "fix", "commit", "architecture",
      "documentation", "pullRequest", "test", "security", "explain", "refactor"
    ];

    if (!validTasks.includes(parsed.task)) return null;

    return {
      task: parsed.task,
      confidence: typeof parsed.confidence === "number" ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.7,
      needsRepositorySearch: parsed.needsRepositorySearch !== false,
      reasoning: parsed.reasoning || "LLM-based task planning",
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks.slice(0, 5) : [],
      priority: ["low", "medium", "high", "critical"].includes(parsed.priority) ? parsed.priority : "medium",
      estimatedComplexity: ["simple", "moderate", "complex"].includes(parsed.complexity) ? parsed.complexity : "moderate",
    };
  } catch {
    return null;
  }
};

export const plannerAgent = async (
  input: {
    question: string;
    repositoryId?: string;
    filePath?: string;
    useLLM?: boolean;
  }
): Promise<PlanResult> => {
  const { question, repositoryId, filePath, useLLM = false } = input;

  const regexResult = regexPlan(question);

  let finalTask = regexResult.task;
  let finalConfidence = regexResult.confidence;
  let reasoning = regexResult.reasoning;
  let needsRepositorySearch = true;
  let subtasks: string[] = [];
  let priority: PlanResult["priority"] = "medium";
  let estimatedComplexity: PlanResult["estimatedComplexity"] = "moderate";

  if (useLLM || finalConfidence < 0.5) {
    const llmResult = await llmPlan(question);
    if (llmResult) {
      if (llmResult.confidence > finalConfidence) {
        finalTask = llmResult.task;
        finalConfidence = llmResult.confidence;
        reasoning = `LLM override: ${llmResult.reasoning} (regex had: ${regexResult.task} at ${(regexResult.confidence * 100).toFixed(0)}%)`;
      } else {
        reasoning += ` | LLM suggests ${llmResult.task} at ${(llmResult.confidence * 100).toFixed(0)}% but regex confidence is higher`;
      }
      needsRepositorySearch = llmResult.needsRepositorySearch;
      subtasks = llmResult.subtasks;
      priority = llmResult.priority;
      estimatedComplexity = llmResult.estimatedComplexity;
    }
  }

  if (repositoryId || filePath) {
    needsRepositorySearch = true;
  }

  return {
    question,
    task: finalTask,
    needsRepositorySearch,
    repositoryId,
    filePath,
    confidence: finalConfidence,
    reasoning,
    subtasks,
    priority,
    estimatedComplexity,
  };
};
