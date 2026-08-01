import fs from "node:fs";
import path from "node:path";
import type { StackInfo, StackKind } from "../types.js";

export type { StackInfo, StackKind };

const fileExists = (dir: string, file: string) =>
  fs.existsSync(path.join(dir, file));

const readJson = (dir: string, file: string): any => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
  } catch {
    return null;
  }
};

const normalizeScripts = (pkg: any): Record<string, string> => {
  const scripts = pkg?.scripts ?? {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(scripts)) {
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
};

export const detectStack = (repoDir: string): StackInfo => {
  if (fileExists(repoDir, "package.json")) {
    const pkg = readJson(repoDir, "package.json");
    const scripts = normalizeScripts(pkg);
    const allDeps = {
      ...(pkg?.dependencies ?? {}),
      ...(pkg?.devDependencies ?? {}),
    };

    const hasVitest = Boolean(allDeps.vitest);
    const hasJest = Boolean(allDeps.jest) || Boolean(scripts.test?.includes("jest"));
    const hasMocha = Boolean(allDeps.mocha) || Boolean(scripts.test?.includes("mocha"));

    let testCommand = "npm test";
    if (hasVitest) {
      testCommand =
        "npx vitest run --reporter=json --outputFile=/workspace/test-output.json";
    } else if (hasJest) {
      testCommand =
        "npx jest --json --outputFile=/workspace/test-output.json";
    } else if (hasMocha) {
      testCommand = "npx mocha --reporter json --reporter-option output=/workspace/test-output.json";
    } else if (scripts.test) {
      testCommand = `npm test`;
    }

    let runCommand = scripts.test || "node .";
    if (hasVitest) runCommand = testCommand;
    else if (scripts.test) runCommand = `npm test`;

    return {
      kind: "node",
      packageManager: pkg?.packageManager ?? "npm",
      testCommand,
      testFiles: [],
      runCommand,
    };
  }

  if (fileExists(repoDir, "go.mod")) {
    return {
      kind: "go",
      packageManager: "go",
      testCommand: "go test ./... -json",
      testFiles: [],
      runCommand: "go test ./... -json",
    };
  }

  if (
    fileExists(repoDir, "pyproject.toml") ||
    fileExists(repoDir, "requirements.txt") ||
    fileExists(repoDir, "setup.py") ||
    fileExists(repoDir, "Pipfile")
  ) {
    let testCommand = "python -m pytest -rA --tb=short --json-report --json-report-file=/workspace/test-output.json";
    const pytestJsonAvailable = false;
    if (!pytestJsonAvailable) {
      testCommand = "python -m pytest -rA --tb=long";
    }
    return {
      kind: "python",
      packageManager: "pip",
      testCommand,
      testFiles: [],
      runCommand: "python -m pytest -rA --tb=long",
    };
  }

  return {
    kind: "unknown",
    packageManager: "",
    testCommand: "",
    testFiles: [],
    runCommand: "",
  };
};

export const imageForStack = (kind: StackKind): string => {
  switch (kind) {
    case "node":
      return "node:20-slim";
    case "python":
      return "python:3.12-slim";
    case "go":
      return "golang:1.22";
    default:
      return "node:20-slim";
  }
};
