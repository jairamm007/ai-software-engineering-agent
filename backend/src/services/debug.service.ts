import { generateText } from "../ai/providers/llm.service.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import {
  createDebugSession,
  updateDebugSession,
  getDebugSessionById,
} from "../repository/debug.repository.js";
import type { CreateDebugSessionInput } from "../repository/debug.repository.js";

const MAX_CONTEXT_CHARS = 40_000;

async function loadRepoContext(repositoryId?: string, filePath?: string): Promise<string> {
  if (!repositoryId) return "";
  try {
    const repo = await getRepositoryById(repositoryId, "");
    if (!repo?.files?.length) return "";

    let totalChars = 0;
    const chunks: string[] = [];

    if (filePath) {
      const file = repo.files.find((f) => f.path === filePath);
      if (file) {
        for (const chunk of file.chunks ?? []) {
          const text = `[${file.path}:L${chunk.startLine}-${chunk.endLine}]\n${chunk.content}`;
          if (totalChars + text.length > MAX_CONTEXT_CHARS) break;
          totalChars += text.length;
          chunks.push(text);
        }
      }
    }

    if (chunks.length === 0) {
      for (const file of repo.files) {
        for (const chunk of file.chunks ?? []) {
          const text = `[${file.path}:L${chunk.startLine}-${chunk.endLine}]\n${chunk.content}`;
          if (totalChars + text.length > MAX_CONTEXT_CHARS) break;
          totalChars += text.length;
          chunks.push(text);
        }
        if (totalChars >= MAX_CONTEXT_CHARS) break;
      }
    }

    return chunks.length > 0 ? chunks.join("\n\n---\n\n") : "";
  } catch {
    return "";
  }
}

async function getModel(userId: string): Promise<string | undefined> {
  try {
    const prefs = await getPreferences(userId);
    return prefs.defaultModel;
  } catch {
    return undefined;
  }
}

export const analyzeError = async (
  input: CreateDebugSessionInput & { errorMessage: string; inputCode?: string }
) => {
  const session = await createDebugSession(input);
  const model = await getModel(input.userId);
  const repoContext = await loadRepoContext(input.repositoryId, input.filePath);

  const systemPrompt = `You are an expert debugging assistant. Analyze the given error and code to help the developer.

OUTPUT FORMAT (JSON):
{
  "explanation": "Clear explanation of what the error means",
  "possibleCauses": ["cause1", "cause2", ...],
  "fileLocation": "Likely file and line where the error originates",
  "suggestedFix": "Step-by-step fix instructions with code if applicable",
  "fixedCode": "The corrected code block if applicable"
}

RULES:
- Be precise and actionable
- Reference the actual code when possible
- Suggest specific fixes, not generic advice
- If the error is unclear, say so and suggest debugging steps`;

  const userContent = [
    repoContext ? `Repository Context:\n${repoContext}` : "",
    input.errorMessage ? `Error Message:\n${input.errorMessage}` : "",
    input.inputCode ? `Code:\n${input.inputCode}` : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const result = await generateText(systemPrompt, userContent, model);

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { explanation: result, possibleCauses: [], suggestedFix: "" };
  }

  const explanation = (parsed.explanation as string) || result;
  const suggestedFix = (parsed.suggestedFix as string) || "";
  const fixedCode = (parsed.fixedCode as string) || "";

  await updateDebugSession(session.id, {
    explanation,
    suggestedFix,
    fixedCode,
    status: "open",
    updatedAt: new Date(),
  });

  return { ...session, explanation, suggestedFix, fixedCode, parsedData: parsed };
};

export const analyzeStacktrace = async (
  input: CreateDebugSessionInput & { stackTrace: string }
) => {
  const session = await createDebugSession({
    ...input,
    sessionType: "stack_trace",
    errorMessage: input.stackTrace,
  });
  const model = await getModel(input.userId);

  const systemPrompt = `You are an expert debugging assistant. Analyze the given stack trace to find the root cause.

OUTPUT FORMAT (JSON):
{
  "whereErrorStarted": "The originating file and function where the error began",
  "rootCauseFile": "The file that actually caused the error",
  "rootCause": "Clear explanation of what caused the error",
  "recommendedFix": "Step-by-step fix with code if applicable",
  "fixedCode": "The corrected code block"
}

RULES:
- Trace through the stack to find the REAL root cause, not just the top frame
- Identify null/undefined references, type mismatches, async issues
- Be specific with file names and line numbers`;

  const userContent = `Stack Trace:\n${input.stackTrace}`;
  const result = await generateText(systemPrompt, userContent, model);

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { rootCause: result, recommendedFix: "" };
  }

  const explanation = [
    `**Where it started:** ${parsed.whereErrorStarted || "Unknown"}`,
    `**Root cause file:** ${parsed.rootCauseFile || "Unknown"}`,
    `**Root cause:** ${parsed.rootCause || "Could not determine"}`,
  ].join("\n\n");
  const suggestedFix = (parsed.recommendedFix as string) || "";
  const fixedCode = (parsed.fixedCode as string) || "";

  await updateDebugSession(session.id, {
    explanation,
    suggestedFix,
    fixedCode,
    status: "open",
    updatedAt: new Date(),
  });

  return { ...session, explanation, suggestedFix, fixedCode, parsedData: parsed };
};

export const detectBugs = async (
  input: CreateDebugSessionInput & { inputCode: string }
) => {
  const session = await createDebugSession({
    ...input,
    sessionType: "bug_detection",
  });
  const model = await getModel(input.userId);
  const repoContext = await loadRepoContext(input.repositoryId, input.filePath);

  const systemPrompt = `You are a senior code reviewer. Analyze the provided code for potential bugs and issues.

CHECK FOR:
1. Null/undefined reference risks
2. Missing return statements
3. Incorrect async/await usage
4. Unused variables
5. Incorrect conditions (off-by-one, wrong operator)
6. Memory leaks
7. Race conditions
8. Type errors

OUTPUT FORMAT (JSON):
{
  "issues": [
    {
      "type": "null_ref | missing_return | async_issue | unused_var | condition | memory_leak | race_condition | type_error",
      "severity": "critical | warning | info",
      "line": <line_number>,
      "description": "What the issue is",
      "suggestion": "How to fix it",
      "fixedCode": "The corrected code snippet"
    }
  ],
  "summary": "Overall assessment of code quality"
}`;

  const userContent = [
    repoContext ? `Repository Context:\n${repoContext}` : "",
    `Code:\n${input.inputCode}`,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const result = await generateText(systemPrompt, userContent, model);

  let parsed: { issues?: Array<Record<string, unknown>>; summary?: string } = {};
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { issues: [], summary: result };
  }

  const explanation = parsed.summary || "Bug analysis completed.";
  const issues = (parsed.issues || []) as Array<Record<string, unknown>>;

  await updateDebugSession(session.id, {
    explanation,
    suggestedFix: issues.map((i, idx) => `${idx + 1}. [${i.severity}] ${i.description}\n   Suggestion: ${i.suggestion}`).join("\n\n"),
    status: "open",
    updatedAt: new Date(),
  });

  return { ...session, explanation, issues, parsedData: parsed };
};

export const suggestFix = async (
  sessionId: string,
  input: { errorMessage?: string; inputCode?: string; context?: string }
) => {
  const session = await getDebugSessionById(sessionId, "");
  if (!session) throw new Error("Session not found");

  const model = await getModel(session.userId);

  const systemPrompt = `You are an expert debugging assistant. Provide a specific, actionable fix for the described problem.

OUTPUT FORMAT (JSON):
{
  "problem": "Description of the problem",
  "rootCause": "What causes it",
  "suggestedFix": "Step-by-step fix instructions",
  "fixedCode": "The complete corrected code block"
}

RULES:
- Only suggest fixes for the described problem
- Provide complete, working code
- Explain WHY the fix works`;

  const userContent = [
    input.errorMessage || session.errorMessage ? `Error: ${input.errorMessage || session.errorMessage}` : "",
    input.inputCode || session.inputCode ? `Code:\n${input.inputCode || session.inputCode}` : "",
    input.context ? `Additional Context:\n${input.context}` : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const result = await generateText(systemPrompt, userContent, model);

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { suggestedFix: result };
  }

  const suggestedFix = (parsed.suggestedFix as string) || result;
  const fixedCode = (parsed.fixedCode as string) || "";

  await updateDebugSession(session.id, {
    suggestedFix,
    fixedCode,
    status: "open",
    updatedAt: new Date(),
  });

  return { session, suggestedFix, fixedCode, parsedData: parsed };
};

export const analyzeLogs = async (
  input: CreateDebugSessionInput & { logContent: string }
) => {
  const session = await createDebugSession({
    ...input,
    sessionType: "log_analysis",
    errorMessage: input.logContent,
  });
  const model = await getModel(input.userId);
  const repoContext = await loadRepoContext(input.repositoryId, input.filePath);

  const systemPrompt = `You are an expert system administrator and debugging assistant. Analyze the provided application logs.

OUTPUT FORMAT (JSON):
{
  "whatHappened": "Clear summary of what the logs indicate",
  "whyItHappened": "Root cause explanation",
  "possibleSolutions": ["solution1", "solution2", ...],
  "severity": "critical | warning | info",
  "recommendedAction": "The single most important action to take"
}

RULES:
- Focus on errors, warnings, and unusual patterns
- Correlate timestamps and log entries
- Be specific about which log entries indicate problems`;

  const userContent = [
    repoContext ? `Repository Context:\n${repoContext}` : "",
    `Log Content:\n${input.logContent}`,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const result = await generateText(systemPrompt, userContent, model);

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { whatHappened: result, possibleSolutions: [] };
  }

  const explanation = [
    `**What happened:** ${parsed.whatHappened || "Could not analyze"}`,
    `**Why it happened:** ${parsed.whyItHappened || "Could not determine"}`,
    parsed.recommendedAction ? `**Recommended action:** ${parsed.recommendedAction}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const suggestedFix = ((parsed.possibleSolutions as string[]) || []).join("\n");

  await updateDebugSession(session.id, {
    explanation,
    suggestedFix,
    status: "open",
    updatedAt: new Date(),
  });

  return { ...session, explanation, suggestedFix, parsedData: parsed };
};
