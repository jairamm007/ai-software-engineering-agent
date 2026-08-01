import fs from "node:fs";
import { cloneRepo } from "./sandbox/repo.js";
import { detectStack } from "./sandbox/stack-detect.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import { runDebugStage } from "./services/debug.service.js";
import { runCodeGenStage } from "./services/codegen.service.js";
import { runSecurityStage } from "./services/security.service.js";
import { runPerformanceStage } from "./services/performance.service.js";
import { normalizeRelPath } from "./sandbox/repo.js";
import type { RunInput } from "./types.js";
import {
  createDebugRun,
  getDebugRun,
  updateDebugRun,
} from "./repository.js";

const resolveRepoUrl = async (input: RunInput): Promise<string> => {
  if (input.repoUrl) return input.repoUrl;
  if (input.repositoryId) {
    const repo = await getRepositoryById(input.repositoryId, input.userId);
    if (repo?.githubUrl) return repo.githubUrl;
  }
  throw new Error("Either repoUrl or repositoryId is required.");
};

export const runPipeline = async (input: RunInput) => {
  const existingRun = input.runId ? await getDebugRun(input.runId) : null;
  if (input.runId && !existingRun) {
    throw new Error("Run not found");
  }

  const repoUrl = existingRun?.repoUrl ?? (await resolveRepoUrl(input));

  const run =
    existingRun ??
    (await createDebugRun({
      userId: input.userId,
      repositoryId: input.repositoryId ?? null,
      repoName: repoUrl.replace(/\.git$/, "").split("/").pop() ?? null,
      repoUrl,
      branch: input.branch ?? null,
    }));

  const repoName = run.repoName ?? repoUrl.replace(/\.git$/, "").split("/").pop();

  let preferredModel: string | undefined;
  try {
    const prefs = await getPreferences(input.userId);
    preferredModel = prefs.defaultModel ?? undefined;
  } catch {
    // use default model
  }

  let repoDir: string | null = null;
  const summaryParts: string[] = [];

  try {
    console.log(`🔧 Cloning ${repoUrl} for run ${run.id}`);
    repoDir = await cloneRepo(repoUrl, run.id, input.branch ?? run.branch ?? undefined);

    const stack = detectStack(repoDir);

    const debugResult = await runDebugStage(
      run.id,
      repoDir,
      stack,
      preferredModel
    );

    if (debugResult.allPassed) {
      await updateDebugRun(run.id, {
        status: "done",
        stage: "debug",
        summary: "All tests passed — no fixes required.",
      });
      return getDebugRun(run.id);
    }

    const targetFiles = Array.from(
      new Set(
        debugResult.failures
          .map((f) => {
            let p = normalizeRelPath(f.testFile ?? "");
            if (p.startsWith("/workspace/")) p = p.slice("/workspace/".length);
            return p;
          })
          .filter(Boolean)
      )
    );

    const codegenResult = await runCodeGenStage({
      runId: run.id,
      repoDir,
      stack,
      failures: debugResult.failures,
      diagnoses: debugResult.diagnoses,
      preferredModel,
    });

    if (!codegenResult.resolved) {
      const message = "Maximum fix attempts reached — patch escalated for human review.";
      summaryParts.push(message);
      await updateDebugRun(run.id, {
        status: "rejected",
        stage: "codegen",
        summary: message,
      });
      return getDebugRun(run.id);
    }

    const withPatches = await getDebugRun(run.id);
    const appliedPatch = withPatches?.patches.find((p) => p.status === "applied");
    const diffText = appliedPatch?.diffText ?? "";

    if (diffText.trim()) {
      const securityResult = await runSecurityStage({
        runId: run.id,
        repoDir,
        stack,
        diffText,
      });

      if (securityResult.blocked) {
        summaryParts.push(securityResult.summary);
        await updateDebugRun(run.id, {
          status: "blocked",
          stage: "security",
          summary: securityResult.summary,
        });
        return getDebugRun(run.id);
      }
      summaryParts.push(securityResult.summary);

      const perfResult = await runPerformanceStage({
        runId: run.id,
        repoDir,
        stack,
        diffText,
        targetFiles,
      });

      const flaggedMetrics = perfResult.comparisons.filter((c) => c.flagged);
      if (flaggedMetrics.length > 0) {
        summaryParts.push(
          `Performance flagged: ${flaggedMetrics
            .map((c) => `${c.metric} +${c.pctChange?.toFixed(1) ?? "?"}%`)
            .join(", ")} (informational, not rejected).`
        );
      } else {
        summaryParts.push("Performance check passed — no regressions above thresholds.");
      }
    } else {
      summaryParts.push("Patch applied but produced no diff — security/performance skipped.");
    }

    const summary = summaryParts.join(" ");
    await updateDebugRun(run.id, {
      status: "done",
      stage: "performance",
      summary: summary || "Pipeline completed.",
    });

    return getDebugRun(run.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Pipeline failed:", error);
    await updateDebugRun(run.id, {
      status: "failed",
      summary: `Pipeline failed: ${message.slice(0, 1000)}`,
    });
    return getDebugRun(run.id);
  } finally {
    if (repoDir && process.env.REPOVERIFY_KEEP_REPO !== "1") {
      fs.rmSync(repoDir, { recursive: true, force: true });
    }
  }
};
