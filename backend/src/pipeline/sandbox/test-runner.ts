import path from "node:path";
import fs from "node:fs";
import type { FailureRecord, StackInfo } from "../types.js";
import { runInContainer, type ExecResult } from "./docker.js";
import { fileExistsInRepo, normalizeRelPath, readRepoFile } from "./repo.js";
import { imageForStack } from "./stack-detect.js";

export interface TestRunResult {
  failures: FailureRecord[];
  stdout: string;
  stderr: string;
  exitCode: number;
  testCount: number;
}

const STACK_FILE_RE = /(?:\bat\s+[^(\n]*\()?([^()\s,]+\.(?:tsx?|jsx?|py|go|js|ts)):(\d+)(?::(\d+))?/g;

const PYTHON_FILE_RE = /File\s+"([^"]+\.py)",\s*line\s+(\d+)/g;

export const extractStackFiles = (
  stackTrace: string,
  repoDir: string,
  limit = 5
): string[] => {
  const candidates = new Map<string, number>();

  const addCandidate = (rawPath: string, line: number) => {
    let rel = normalizeRelPath(rawPath.trim());
    rel = rel.split("\\").join("/");
    if (rel.startsWith("/workspace/")) rel = rel.slice("/workspace/".length);
    if (!rel || rel.startsWith("/") || /^[A-Za-z]:/.test(rel)) return;
    if (
      rel.includes("node_modules") ||
      rel.includes(".git/") ||
      rel.includes("node:internal") ||
      rel.includes("<anonymous>") ||
      rel.includes("webpack") ||
      rel.includes("dist/") ||
      rel.includes("build/")
    ) {
      return;
    }
    if (!fileExistsInRepo(repoDir, rel)) return;
    const score = line > 0 ? 1000 + line : 500;
    if (!candidates.has(rel) || candidates.get(rel)! < score) {
      candidates.set(rel, score);
    }
  };

  const clean = (s: string) => s.replace(/[()]/g, "").trim();

  STACK_FILE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = STACK_FILE_RE.exec(stackTrace)) !== null) {
    const rawPath = clean(m[1] ?? "");
    const line = Number(m[2] ?? 0);
    const colonIdx = rawPath.lastIndexOf(":");
    const candidate = colonIdx > -1 ? rawPath.slice(0, colonIdx) : rawPath;
    addCandidate(candidate, line);
  }

  PYTHON_FILE_RE.lastIndex = 0;
  while ((m = PYTHON_FILE_RE.exec(stackTrace)) !== null) {
    addCandidate(clean(m[1]), Number(m[2] ?? 0));
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([rel]) => rel);
};

const stripAnsi = (s: string): string =>
  s.replace(/\u001b\[[0-9;]*m/g, "");

const readOutputFile = (repoDir: string): string | null => {
  try {
    return readRepoFile(repoDir, "test-output.json") ?? null;
  } catch {
    return null;
  }
};

const parseNodeJson = (
  json: any,
  repoDir: string
): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  for (const suite of json.testResults ?? []) {
    const suiteName = suite.name ?? suite.file ?? "";
    for (const assertion of suite.assertionResults ?? []) {
      if (assertion.status !== "failed" && assertion.status !== "failed-with-error") {
        continue;
      }
      const messages = assertion.failureMessages ?? [];
      const combined = messages.join("\n\n");
      const match = combined.match(/^([A-Za-z0-9_]+Error):\s*([\s\S]*?)(?=\s+at\s|$)/);
      const stackTrace = combined;
      const implicatedFiles = extractStackFiles(stackTrace, repoDir);
      failures.push({
        testName: assertion.fullName ?? assertion.title,
        testFile: normalizeRelPath(suiteName).split(":").pop() ?? suiteName,
        errorType: match?.[1] ?? "TestFailure",
        errorMessage: match?.[2]?.trim() ?? combined.slice(0, 500),
        stackTrace,
        implicatedFiles,
      });
    }
  }
  return failures;
};

const parseMochaJson = (json: any, repoDir: string): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  for (const test of json.tests ?? []) {
    if (!test.err || Object.keys(test.err).length === 0) continue;
    const err = test.err;
    const stackTrace = `${err.message ?? ""}\n${err.stack ?? ""}`.trim();
    const match = stackTrace.match(/^([A-Za-z0-9_]+Error):\s*([\s\S]*?)(?=\s+at\s|$)/);
    failures.push({
      testName: test.fullTitle ?? test.title,
      testFile: normalizeRelPath(test.file ?? "").split(":").pop(),
      errorType: match?.[1] ?? err.name ?? "TestFailure",
      errorMessage: match?.[2]?.trim() ?? err.message ?? "",
      stackTrace,
      implicatedFiles: extractStackFiles(stackTrace, repoDir),
    });
  }
  return failures;
};

const parsePytestJson = (json: any, repoDir: string): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  for (const test of json.tests ?? []) {
    const outcome = test.outcome ?? test.call?.outcome ?? "passed";
    if (outcome !== "failed" && outcome !== "error") continue;
    const traceback = test.call?.crash?.traceback ?? test.longrepr ?? test.call?.traceback ?? "";
    const nodeid = test.nodeid ?? test.name ?? "";
    const [testFile, ...rest] = nodeid.split("::");
    const testName = rest.join("::");
    const match = `${traceback}`.match(/^(\w+Error):\s*([\s\S]*)$/);
    failures.push({
      testName: testName || undefined,
      testFile: testFile || undefined,
      errorType: match?.[1] ?? "TestFailure",
      errorMessage: match?.[2]?.trim() ?? traceback.slice(0, 500),
      stackTrace: `${traceback}`,
      implicatedFiles: extractStackFiles(`${traceback}`, repoDir),
    });
  }
  return failures;
};

const parseGoJson = (stdout: string, repoDir: string): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  const current: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    let entry: any;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const test = entry.Test ?? "";
    if (!test) continue;
    if (entry.Action === "fail") {
      const stack = current[test] ?? "";
      const m = stack.match(/(\w+Error):\s*([\s\S]*?)(?=\n\s*\t|$)/);
      const fileMatch = stack.match(/([^:\s]+\.go):(\d+):/);
      failures.push({
        testName: test,
        testFile: fileMatch?.[1],
        errorType: m?.[1] ?? "TestFailure",
        errorMessage: m?.[2]?.trim() ?? stack.slice(0, 500),
        stackTrace: stack.trim(),
        implicatedFiles: extractStackFiles(stack, repoDir),
      });
      delete current[test];
    } else if (entry.Action === "output") {
      current[test] = (current[test] ?? "") + (entry.Output ?? "");
    }
  }
  return failures;
};

const parseRegexFallback = (
  stack: StackInfo,
  stdout: string,
  repoDir: string
): FailureRecord[] => {
  const failures: FailureRecord[] = [];
  const clean = stripAnsi(stdout);

  if (stack.kind === "python") {
    const re = /(FAILED|ERROR)\s+([^\s]+)::([^\s]+)(?:\s*-\s*(.*))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(clean)) !== null) {
      const nodeid = m[2] ?? "";
      const [testFile, ...rest] = nodeid.split("::");
      const testName = rest.join("::");
      const msg = m[4] ?? "";
      const errorType = msg.split(":")[0] || "TestFailure";
      const errorMessage = msg;
      const snippetStart = Math.max(0, clean.lastIndexOf("_ test " + testName, m.index));
      const snippet = clean.slice(snippetStart, m.index + 500);
      failures.push({
        testName: testName || undefined,
        testFile: testFile || undefined,
        errorType,
        errorMessage,
        stackTrace: snippet || clean.slice(Math.max(0, m.index - 1500), m.index + 500),
        implicatedFiles: extractStackFiles(snippet || clean, repoDir),
      });
    }
    return failures;
  }

  const failureLineRe = /(?:✕|×|FAIL|failing)[^\n]*(?:\n\s*at[^\n]*)*/g;
  let m: RegExpExecArray | null;
  while ((m = failureLineRe.exec(clean)) !== null) {
    const block = m[0];
    const nameMatch = block.match(/(?:✕|×|FAIL)\s+([^\n]+)/);
    const stack = clean.slice(m.index, m.index + 2000);
    const errMatch = stack.match(/(\w+Error):\s*([^\n]+)/);
    failures.push({
      testName: nameMatch?.[1]?.trim(),
      errorType: errMatch?.[1] ?? "TestFailure",
      errorMessage: errMatch?.[2]?.trim() ?? block.trim().slice(0, 300),
      stackTrace: stack,
      implicatedFiles: extractStackFiles(stack, repoDir),
    });
  }
  return failures;
};

const buildTestCommand = (
  stack: StackInfo,
  targetFiles: string[]
): string => {
  const files = targetFiles
    .map((f) => `"${f}"`)
    .join(" ");
  switch (stack.kind) {
    case "node": {
      if (stack.testCommand.includes("vitest")) {
        return `npx --yes vitest run --reporter=json --outputFile=/workspace/test-output.json ${files}`;
      }
      if (stack.testCommand.includes("jest")) {
        return `npx --yes jest --json --outputFile=/workspace/test-output.json ${files}`;
      }
      if (stack.testCommand.includes("mocha")) {
        return `npx --yes mocha --reporter json --reporter-option output=/workspace/test-output.json ${files}`;
      }
      return `npm test -- --runInBand ${files}`;
    }
    case "python":
      return `python -m pytest -rA --tb=long ${files}`;
    case "go":
      return `go test ./... -json 2>/dev/null`;
    default:
      return "echo 'no test runner detected' && exit 0";
  }
};

export const runTests = async (
  repoDir: string,
  stack: StackInfo,
  targetFiles: string[] = []
): Promise<TestRunResult> => {
  const command = buildTestCommand(stack, targetFiles);
  const { stdout, stderr, exitCode } = await runInContainer({
    image: imageForStack(stack.kind),
    hostPath: repoDir,
    command,
    network: "bridge",
    timeoutMs: 180_000,
  });

  const json = readOutputFile(repoDir);
  let failures: FailureRecord[] = [];
  let parsedJson: any = null;

  if (json) {
    try {
      parsedJson = JSON.parse(json);
      if (stack.kind === "node") {
        if (Array.isArray(parsedJson.tests)) {
          failures = parseMochaJson(parsedJson, repoDir);
        } else {
          failures = parseNodeJson(parsedJson, repoDir);
        }
      } else if (stack.kind === "python") {
        failures = parsePytestJson(parsedJson, repoDir);
      }
    } catch {
      failures = [];
    }
  }

  if (failures.length === 0 && stack.kind === "go") {
    failures = parseGoJson(stdout, repoDir);
  }

  if (failures.length === 0) {
    failures = parseRegexFallback(stack, stdout, repoDir);
  }

  const testCount =
    parsedJson && stack.kind !== "go"
      ? Number(parsedJson.numTotalTests ?? parsedJson.stats?.tests ?? 0)
      : 0;

  return {
    failures,
    stdout,
    stderr,
    exitCode,
    testCount,
  };
};

/**
 * Installs the project's dependencies into the mounted repo dir so tests can
 * actually run. Skipped when deps are already present (cached across attempts).
 */
export const ensureDependencies = async (
  repoDir: string,
  stack: StackInfo
): Promise<void> => {
  const image = imageForStack(stack.kind);
  switch (stack.kind) {
    case "node": {
      const nodeModules = path.join(repoDir, "node_modules");
      if (fs.existsSync(nodeModules)) return;
      await runInContainer({
        image,
        hostPath: repoDir,
        command: "npm install --no-audit --no-fund --prefer-offline",
        network: "bridge",
        timeoutMs: 300_000,
        memoryMb: 1024,
      });
      break;
    }
    case "python": {
      const marker = path.join(repoDir, ".repoverify.deps");
      if (fs.existsSync(marker)) return;
      const files = ["requirements.txt", "requirements-dev.txt", "pyproject.toml"];
      const present = files.filter((f) => fs.existsSync(path.join(repoDir, f)));
      const cmd = present.some((f) => f === "pyproject.toml")
        ? "pip install -e . -q 2>/dev/null || pip install -r requirements.txt -q 2>/dev/null || true"
        : present.length > 0
          ? "pip install -r requirements.txt -q 2>/dev/null || true"
          : "true";
      await runInContainer({
        image,
        hostPath: repoDir,
        command: cmd,
        network: "bridge",
        timeoutMs: 300_000,
        memoryMb: 1024,
      });
      fs.writeFileSync(marker, "done");
      break;
    }
    case "go": {
      await runInContainer({
        image,
        hostPath: repoDir,
        command: "go mod download 2>/dev/null || true",
        network: "bridge",
        timeoutMs: 300_000,
        memoryMb: 1024,
      });
      break;
    }
    default:
      break;
  }
};

