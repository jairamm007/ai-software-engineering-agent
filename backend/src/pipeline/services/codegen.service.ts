import type {
  ContextBlock,
  DiagnosisRecord,
  FailureRecord,
  PatchRecord,
  StackInfo,
} from "../types.js";
import { buildContextBlocks } from "../sandbox/ast-context.js";
import { applyPatch, repairDiff, validatePatch } from "../sandbox/diff.js";
import { resetRepo, restoreFiles, normalizeRelPath } from "../sandbox/repo.js";
import { ensureDependencies, runTests } from "../sandbox/test-runner.js";
import { callLlm } from "../llm.js";
import {
  createPatch,
  updateDebugRun,
  updatePatch,
} from "../repository.js";

const MAX_ATTEMPTS = 3;

const PATCH_SYSTEM = `You are an expert software engineer working on an agentic test-repair pipeline.

A failing test has been diagnosed. Generate a UNIFIED DIFF that fixes the root cause so the failing test passes.

STRICT RULES:
- You may ONLY modify files listed in the allow-list. Touching any other file is a hard failure.
- Touch at most 2 files total.
- Use standard unified diff format: "diff --git a/<path> b/<path>", "--- a/<path>", "+++ b/<path>", and "@@ -old,count +new,count @@" hunk headers.
- Hunk line numbers must match the CURRENT file content exactly.
- Include at least 3 unchanged context lines around every change.
- Only include changes strictly needed to fix the diagnosed root cause.
- Do NOT add or delete files.
- Output ONLY the diff inside a single \`\`\`diff ... \`\`\` code block. No explanations before or after.`;

const toRelTarget = (file: string): string => {
  let p = normalizeRelPath(file ?? "");
  if (p.startsWith("/workspace/")) p = p.slice("/workspace/".length);
  if (p.startsWith("./")) p = p.slice(2);
  return p;
};

const formatFailure = (failure: FailureRecord): string =>
  [
    `### Failing test: ${failure.testName ?? "(unknown)"}`,
    `Test file: ${failure.testFile ?? "(unknown)"}`,
    failure.errorType ? `Error type: ${failure.errorType}` : null,
    failure.errorMessage ? `Error message: ${failure.errorMessage.slice(0, 1500)}` : null,
    "Stack trace (first 2500 chars):",
    (failure.stackTrace ?? "(none)").slice(0, 2500),
  ]
    .filter(Boolean)
    .join("\n");

const formatContext = (block: ContextBlock): string =>
  `### ${block.file}:${block.startLine}-${block.endLine}\n${block.content}`;

const extractDiffFromResponse = (raw: string): string => {
  const fenceMatch = raw.match(/```diff\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const anyFence = raw.match(/```\s*([\s\S]*?)```/);
  if (anyFence) return anyFence[1].trim();
  return raw.trim();
};

const buildPatchPrompt = (
  failures: FailureRecord[],
  diagnoses: DiagnosisRecord[],
  repoDir: string,
  attemptNumber: number
): { userPrompt: string; allowList: string[] } => {
  const deduped = Array.from(
    new Set(
      failures.flatMap((f) => [
        ...(f.implicatedFiles ?? []).map(normalizeRelPath),
        toRelTarget(f.testFile ?? ""),
      ])
    )
  ).filter(Boolean);

  const parts: string[] = [
    `Attempt ${attemptNumber} of ${MAX_ATTEMPTS}.`,
    "",
    "Failing tests and diagnoses:",
  ];

  failures.forEach((failure, i) => {
    parts.push(formatFailure(failure));
    const diagnosis = diagnoses[i];
    if (diagnosis) {
      parts.push(
        [
          `Diagnosis (confidence ${diagnosis.confidence.toFixed(2)}):`,
          diagnosis.reasoning,
          diagnosis.rootCauseFile
            ? `Root cause: ${diagnosis.rootCauseFile}${diagnosis.rootCauseLine ? `:${diagnosis.rootCauseLine}` : ""}`
            : "Root cause: not localized",
        ].join("\n")
      );
    }
    const blocks = buildContextBlocks(
      repoDir,
      failure.stackTrace ?? "",
      (failure.implicatedFiles ?? []).map(normalizeRelPath)
    );
    if (blocks.length > 0) {
      parts.push("Scoped code context:", ...blocks.map(formatContext));
    }
    parts.push("---");
  });

  parts.push(`ALLOW-LIST (files you may modify, repo-relative): ${deduped.join(", ") || "(none — you may not modify anything)"}`);

  return { userPrompt: parts.join("\n"), allowList: deduped };
};

export interface CodeGenStageResult {
  resolved: boolean;
  appliedPatchId?: string;
  patches: PatchRecord[];
}

export const runCodeGenStage = async (input: {
  runId: string;
  repoDir: string;
  stack: StackInfo;
  failures: FailureRecord[];
  diagnoses: DiagnosisRecord[];
  preferredModel?: string;
}): Promise<CodeGenStageResult> => {
  const { runId, repoDir, stack, failures, diagnoses, preferredModel } = input;
  const patches: PatchRecord[] = [];
  let resolved = false;
  let appliedPatchId: string | undefined;

  const targetFiles = Array.from(
    new Set(failures.map((f) => toRelTarget(f.testFile ?? "")).filter(Boolean))
  );

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await updateDebugRun(runId, {
      stage: "codegen",
      currentAttempt: attempt,
    });

    let patchRecord: Awaited<ReturnType<typeof createPatch>> | null = null;

    try {
      const { userPrompt, allowList } = buildPatchPrompt(
        failures,
        diagnoses,
        repoDir,
        attempt
      );

      const raw = await callLlm(
        `patch-attempt-${attempt}`,
        PATCH_SYSTEM,
        userPrompt,
        preferredModel
      );
      const diffText = repairDiff(extractDiffFromResponse(raw));

      const validation = validatePatch(diffText, allowList);
      if (!validation.ok) {
        patchRecord = await createPatch({
          debugRunId: runId,
          attemptNumber: attempt,
          diffText,
          filesTouched: validation.files,
          status: "rejected",
          testResult: "not_run",
          testOutput: validation.errors.join("; "),
        });
        patches.push({
          diffText,
          filesTouched: validation.files,
          attemptNumber: attempt,
          status: "rejected",
          testResult: "not_run",
          testOutput: validation.errors.join("; "),
        });
        continue;
      }

      await resetRepo(repoDir);
      const applied = await applyPatch(repoDir, diffText);
      if (!applied.ok) {
        patchRecord = await createPatch({
          debugRunId: runId,
          attemptNumber: attempt,
          diffText,
          filesTouched: validation.files,
          status: "rejected",
          testResult: "not_run",
          testOutput: `git apply / patch failed: ${applied.stderr?.slice(0, 1000) ?? "unknown"}`,
        });
        patches.push({
          diffText,
          filesTouched: validation.files,
          attemptNumber: attempt,
          status: "rejected",
          testResult: "not_run",
          testOutput: applied.stderr?.slice(0, 1000),
        });
        continue;
      }

      patchRecord = await createPatch({
        debugRunId: runId,
        attemptNumber: attempt,
        diffText,
        filesTouched: validation.files,
        status: "proposed",
      });
      patches.push({
        diffText,
        filesTouched: validation.files,
        attemptNumber: attempt,
        status: "proposed",
      });

      await ensureDependencies(repoDir, stack);
      const narrowRun = await runTests(repoDir, stack, targetFiles);

      if (narrowRun.failures.length > 0) {
        await updatePatch(patchRecord.id, {
          status: "reverted",
          testResult: "fail",
          testOutput: narrowRun.stdout.slice(0, 2000),
        });
        patches[patches.length - 1].status = "reverted";
        patches[patches.length - 1].testResult = "fail";
        patches[patches.length - 1].testOutput = narrowRun.stdout.slice(0, 2000);
        await restoreFiles(repoDir, validation.files);
        continue;
      }

      const fullRun = await runTests(repoDir, stack);

      if (fullRun.failures.length === 0) {
        await updatePatch(patchRecord.id, {
          status: "applied",
          testResult: "pass",
          testOutput: fullRun.stdout.slice(0, 2000),
        });
        patches[patches.length - 1].status = "applied";
        patches[patches.length - 1].testResult = "pass";
        patches[patches.length - 1].testOutput = fullRun.stdout.slice(0, 2000);
        resolved = true;
        appliedPatchId = patchRecord.id;
        break;
      }

      await updatePatch(patchRecord.id, {
        status: "reverted",
        testResult: "fail",
        testOutput: fullRun.stdout.slice(0, 2000),
      });
      patches[patches.length - 1].status = "reverted";
      patches[patches.length - 1].testResult = "fail";
      patches[patches.length - 1].testOutput = fullRun.stdout.slice(0, 2000);
      await restoreFiles(repoDir, validation.files);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (patchRecord) {
        await updatePatch(patchRecord.id, {
          status: "rejected",
          testOutput: `attempt failed: ${message.slice(0, 1000)}`,
        });
      } else {
        await createPatch({
          debugRunId: runId,
          attemptNumber: attempt,
          diffText: "",
          filesTouched: [],
          status: "rejected",
          testResult: "not_run",
          testOutput: `LLM or apply step failed: ${message.slice(0, 1000)}`,
        });
      }
      await resetRepo(repoDir);
    }
  }

  await updateDebugRun(runId, {
    status: resolved ? "running" : "rejected",
    stage: resolved ? "security" : "codegen",
    summary: resolved
      ? "Patch applied and all tests pass."
      : "Maximum fix attempts reached — escalated for human review.",
  });

  return { resolved, appliedPatchId, patches };
};
