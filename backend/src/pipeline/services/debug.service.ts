import type { ContextBlock, DiagnosisRecord, FailureRecord, StackInfo } from "../types.js";
import { buildContextBlocks } from "../sandbox/ast-context.js";
import { ensureDependencies, runTests } from "../sandbox/test-runner.js";
import { normalizeRelPath } from "../sandbox/repo.js";
import { callLlm, parseJsonFromLlm } from "../llm.js";
import {
  createDebugFailures,
  createDiagnosis,
  getDebugRun,
  updateDebugRun,
} from "../repository.js";

const DIAGNOSIS_SYSTEM = `You are a senior software debugging engineer working on a strict agentic pipeline.

Your job: analyze ONE failing test and its AST-scoped code context, then produce a structured root-cause diagnosis.

RULES:
- Use ONLY the code context provided. Never reference files that are not shown.
- Identify the root cause file and line where the fix should go (0-indexed irrelevant — use the line numbers shown in the context headers).
- If you cannot determine a single root cause, set rootCauseFile to null and lower confidence.
- Do not propose fixes here; only diagnose.
- Respond with a single JSON object, no markdown fences, exactly this shape:
{"reasoning":"<step-by-step reasoning>","rootCauseFile":"<repo-relative path|null>","rootCauseLine":<number|null>,"confidence":<0..1>}`;

export interface DebugStageResult {
  allPassed: boolean;
  failures: FailureRecord[];
  diagnoses: DiagnosisRecord[];
  testRunOutput?: string;
}

const formatFailure = (failure: FailureRecord): string =>
  [
    `### Failing test: ${failure.testName ?? "(unknown)"}`,
    `Test file: ${failure.testFile ?? "(unknown)"}`,
    failure.errorType ? `Error type: ${failure.errorType}` : null,
    failure.errorMessage ? `Error message: ${failure.errorMessage.slice(0, 2000)}` : null,
    "Stack trace (first 3000 chars):",
    (failure.stackTrace ?? "(none)").slice(0, 3000),
  ]
    .filter(Boolean)
    .join("\n");

const formatContext = (block: ContextBlock): string =>
  `### ${block.file}:${block.startLine}-${block.endLine}\n${block.content}`;

const diagnose = async (
  failure: FailureRecord,
  blocks: ContextBlock[],
  preferredModel?: string
): Promise<DiagnosisRecord> => {
  const userPrompt = [
    "Analyze this failing test:",
    formatFailure(failure),
    "",
    "Scoped code context for the implicated files:",
    blocks.map(formatContext).join("\n\n---\n\n"),
  ].join("\n");

  const raw = await callLlm("diagnosis", DIAGNOSIS_SYSTEM, userPrompt, preferredModel);
  const parsed = parseJsonFromLlm<Partial<DiagnosisRecord>>(raw);

  return {
    reasoning: parsed?.reasoning ?? raw.slice(0, 1500),
    rootCauseFile: parsed?.rootCauseFile ?? failure.implicatedFiles?.[0] ?? null,
    rootCauseLine: parsed?.rootCauseLine ?? null,
    confidence:
      typeof parsed?.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5,
    modelUsed: preferredModel ?? "default",
  };
};

export const runDebugStage = async (
  runId: string,
  repoDir: string,
  stack: StackInfo,
  preferredModel?: string
): Promise<DebugStageResult> => {
  await updateDebugRun(runId, { status: "running", stage: "debug" });

  await ensureDependencies(repoDir, stack);
  const testRun = await runTests(repoDir, stack);

  if (testRun.failures.length === 0) {
    await updateDebugRun(runId, {
      status: "done",
      stage: "debug",
      summary: "All tests passed — no fixes required.",
    });
    return {
      allPassed: true,
      failures: [],
      diagnoses: [],
      testRunOutput: testRun.stdout.slice(0, 4000),
    };
  }

  const uniqueFailures = testRun.failures.reduce<FailureRecord[]>((acc, f) => {
    const key = `${f.testFile ?? ""}:${f.testName ?? ""}:${f.errorType ?? ""}`;
    if (!acc.some((x) => `${x.testFile ?? ""}:${x.testName ?? ""}:${x.errorType ?? ""}` === key)) {
      acc.push(f);
    }
    return acc;
  }, []);

  const diagnoses: DiagnosisRecord[] = [];

  for (const failure of uniqueFailures) {
    const implicatedFiles = (failure.implicatedFiles ?? []).map(normalizeRelPath);
    const blocks = buildContextBlocks(
      repoDir,
      failure.stackTrace ?? "",
      implicatedFiles.length > 0 ? implicatedFiles : [failure.testFile ?? ""]
    );

    const diagnosis = await diagnose(failure, blocks, preferredModel);
    diagnoses.push(diagnosis);
  }

  await createDebugFailures(
    runId,
    uniqueFailures.map((f) => ({
      testName: f.testName,
      testFile: f.testFile,
      errorType: f.errorType,
      errorMessage: f.errorMessage,
      stackTrace: f.stackTrace,
      implicatedFiles: (f.implicatedFiles ?? []).map(normalizeRelPath),
    }))
  );

  const savedFailures = await getDebugRun(runId);
  const failureRows = savedFailures?.failures ?? [];

  for (let i = 0; i < diagnoses.length; i++) {
    await createDiagnosis({
      debugRunId: runId,
      failureId: failureRows[i]?.id ?? null,
      reasoning: diagnoses[i].reasoning,
      rootCauseFile: diagnoses[i].rootCauseFile,
      rootCauseLine: diagnoses[i].rootCauseLine,
      confidence: diagnoses[i].confidence,
      modelUsed: diagnoses[i].modelUsed,
    });
  }

  await updateDebugRun(runId, {
    stage: "codegen",
    stackDetected: stack.kind,
    failureCount: uniqueFailures.length,
  });

  return {
    allPassed: false,
    failures: uniqueFailures,
    diagnoses,
    testRunOutput: testRun.stdout.slice(0, 4000),
  };
};
