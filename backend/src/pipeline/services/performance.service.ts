import type { PerfMeasurement, StackInfo } from "../types.js";
import { runInContainer } from "../sandbox/docker.js";
import { applyPatch, getChangedLineRanges } from "../sandbox/diff.js";
import {
  fileExistsInRepo,
  normalizeRelPath,
  readRepoFile,
  restoreFiles,
} from "../sandbox/repo.js";
import { imageForStack } from "../sandbox/stack-detect.js";
import {
  createPerfBaseline,
  createPerfComparison,
  updateDebugRun,
} from "../repository.js";

const TIME_THRESHOLD_PCT = 15;
const MEMORY_THRESHOLD_PCT = 20;

const buildBenchCommand = (stack: StackInfo, targetFiles: string[]): string => {
  const files = targetFiles.map((f) => `"${f}"`).join(" ");
  switch (stack.kind) {
    case "node": {
      if (stack.testCommand.includes("vitest")) {
        return `npx --yes vitest run --reporter=dot ${files}`;
      }
      if (stack.testCommand.includes("jest")) {
        return `npx --yes jest ${files} --silent`;
      }
      return `npm test -- --runInBand ${files}`;
    }
    case "python":
      return `python -m pytest -q ${files}`;
    case "go":
      return `go test ${files} -count=1 2>/dev/null`;
    default:
      return "true";
  }
};

const measureWithTimeVerbose = async (
  repoDir: string,
  stack: StackInfo,
  targetFiles: string[]
): Promise<PerfMeasurement | null> => {
  const testCmd = buildBenchCommand(stack, targetFiles);
  const command =
    `(apt-get update -qq >/dev/null 2>&1; apt-get install -y -qq time >/dev/null 2>&1 || true); ` +
    `(/usr/bin/time -v sh -c '${testCmd}' ) 2>/workspace/timing.txt; rc=$?; cat /workspace/timing.txt; exit $rc`;

  const result = await runInContainer({
    image: imageForStack(stack.kind),
    hostPath: repoDir,
    command,
    network: "bridge",
    timeoutMs: 240_000,
  });

  const out = result.stdout;
  const elapsed =
    out.match(/Elapsed \(wall clock\) time \(h:mm:ss or m:ss\):\s+(\d+):(\d+)\.(\d+)/) ??
    out.match(/Elapsed \(wall clock\) time \(h:mm:ss or m:ss\):\s+(\d+):(\d+):(\d+)\.(\d+)/);
  const maxRss = out.match(/Maximum resident set size \(kbytes\):\s+(\d+)/);

  if (!elapsed) return null;

  const timeMs =
    elapsed.length === 4
      ? (Number(elapsed[1]) * 60 + Number(elapsed[2])) * 1000 + Number(elapsed[3])
      : (Number(elapsed[1]) * 3600 + Number(elapsed[2]) * 60 + Number(elapsed[3])) * 1000 + Number(elapsed[4]);

  return {
    timeMs,
    memoryMb: maxRss ? Math.round(Number(maxRss[1]) / 1024) : undefined,
    command: testCmd,
  };
};

const runHeuristicScan = (
  repoDir: string,
  files: string[]
): Array<{ file: string; line: number; kind: string; description: string }> => {
  const heuristics: Array<{ file: string; line: number; kind: string; description: string }> = [];

  for (const relPath of files) {
    const norm = normalizeRelPath(relPath);
    if (!fileExistsInRepo(repoDir, norm)) continue;
    const lines = readRepoFile(repoDir, norm, 200_000)?.split("\n") ?? [];

    for (let i = 0; i < lines.length; i++) {
      const content = lines[i].trim();
      if (!content) continue;
      const indent = (lines[i].match(/^\s*/) ?? [""])[0].length;

      if (/^(for|while)\b/.test(content)) {
        const bodyEnd = (() => {
          for (let j = i + 1; j < Math.min(lines.length, i + 60); j++) {
            if (!lines[j].trim()) continue;
            if ((lines[j].match(/^\s*/) ?? [""])[0].length <= indent) return j;
          }
          return Math.min(lines.length, i + 60);
        })();
        const body = lines.slice(i + 1, bodyEnd).join("\n");
        const lineNumber = i + 1;

        if (/^\s*(for|while)\b/.test(body) || body.includes("for ") || body.includes("while ")) {
          heuristics.push({
            file: norm,
            line: lineNumber,
            kind: "nested_loop",
            description: `Nested loop detected (potential O(n^2)+ complexity) at line ${lineNumber}`,
          });
        }

        if (/(\w+\.)?(findMany|findAll|findFirst|query|raw|execute|select)\s*\(/.test(body)) {
          heuristics.push({
            file: norm,
            line: lineNumber,
            kind: "n_plus_1_query",
            description: `ORM query inside loop body at line ${lineNumber}`,
          });
        }
      }

      if (/(\w+\.)?(readFileSync|writeFileSync|execSync|spawnSync|readdirSync|readFile\()/.test(content)) {
        const asyncFound = lines
          .slice(0, i + 1)
          .reverse()
          .slice(0, 40)
          .find(
            (l) =>
              l.trim().includes("async") &&
              ((l.match(/^\s*/) ?? [""])[0].length < indent)
          );
        if (asyncFound) {
          heuristics.push({
            file: norm,
            line: i + 1,
            kind: "sync_io_in_async",
            description: `Synchronous I/O inside an async function at line ${i + 1}`,
          });
        }
      }
    }
  }

  return heuristics;
};

export interface PerformanceStageResult {
  before?: PerfMeasurement;
  after?: PerfMeasurement;
  comparisons: Array<{
    metric: string;
    before?: number;
    after?: number;
    pctChange?: number;
    flagged: boolean;
  }>;
  heuristics: Array<{ file: string; line: number; kind: string; description: string }>;
}

export const runPerformanceStage = async (input: {
  runId: string;
  repoDir: string;
  stack: StackInfo;
  diffText: string;
  targetFiles: string[];
}): Promise<PerformanceStageResult> => {
  const { runId, repoDir, stack, diffText, targetFiles } = input;
  await updateDebugRun(runId, { stage: "performance" });

  let before: PerfMeasurement | null = null;
  let after: PerfMeasurement | null = null;
  let changedFiles: string[] = [];

  try {
    changedFiles = Object.keys(getChangedLineRanges(diffText));
    if (changedFiles.length > 0) {
      await restoreFiles(repoDir, changedFiles);
    }
    before = await measureWithTimeVerbose(repoDir, stack, targetFiles);
    if (before?.timeMs !== undefined) {
      await createPerfBaseline({
        debugRunId: runId,
        stage: "pre",
        timeMs: before.timeMs ?? null,
        memoryMb: before.memoryMb ?? null,
        command: before.command ?? null,
      });
    }

    if (changedFiles.length > 0 && diffText.trim()) {
      await applyPatch(repoDir, diffText);
    }
    after = await measureWithTimeVerbose(repoDir, stack, targetFiles);
    if (after?.timeMs !== undefined) {
      await createPerfBaseline({
        debugRunId: runId,
        stage: "post",
        timeMs: after.timeMs ?? null,
        memoryMb: after.memoryMb ?? null,
        command: after.command ?? null,
      });
    }
  } catch (error) {
    console.error("⚠️ Perf measurement failed, falling back to heuristics:", error);
    before = null;
    after = null;
  }

  const heuristicFiles = Array.from(
    new Set([
      ...Object.keys(getChangedLineRanges(diffText)),
      ...targetFiles.map(normalizeRelPath),
    ])
  );

  if (!before || !after || before.timeMs === undefined || after.timeMs === undefined) {
    const heuristics = runHeuristicScan(repoDir, heuristicFiles);
    if (heuristics.length > 0) {
      await createPerfBaseline({
        debugRunId: runId,
        stage: "pre",
        heuristic: heuristics.map((h) => ({ ...h, heuristicOnly: true })),
      });
    }
    return { comparisons: [], heuristics };
  }

  const comparisons: PerformanceStageResult["comparisons"] = [];

  const buildComparison = (
    metric: string,
    beforeValue: number | undefined,
    afterValue: number | undefined,
    thresholdPct: number
  ) => {
    if (beforeValue === undefined || afterValue === undefined || beforeValue === 0) return;
    const pctChange = ((afterValue - beforeValue) / beforeValue) * 100;
    const flagged = pctChange > thresholdPct;
    comparisons.push({ metric, before: beforeValue, after: afterValue, pctChange, flagged });
    createPerfComparison({
      debugRunId: runId,
      metric,
      beforeValue,
      afterValue,
      pctChange,
      flagged,
    }).catch(() => undefined);
  };

  buildComparison("time_ms", before.timeMs, after.timeMs, TIME_THRESHOLD_PCT);
  if (before.memoryMb !== undefined && after.memoryMb !== undefined) {
    buildComparison("memory_mb", before.memoryMb, after.memoryMb, MEMORY_THRESHOLD_PCT);
  }

  const heuristics = runHeuristicScan(repoDir, heuristicFiles);
  if (heuristics.length > 0) {
    await createPerfBaseline({
      debugRunId: runId,
      stage: "pre",
      heuristic: heuristics.map((h) => ({ ...h, heuristicOnly: true })),
    });
  }

  return { before, after, comparisons, heuristics };
};
