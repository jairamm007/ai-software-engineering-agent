import path from "node:path";
import fs from "node:fs";
import type { SecurityFinding, StackInfo } from "../types.js";
import { ensureImage, runInContainer } from "../sandbox/docker.js";
import {
  getChangedLineRanges,
  fileIsInRange,
} from "../sandbox/diff.js";
import { readRepoFile } from "../sandbox/repo.js";
import { upsertSecurityScan } from "../repository.js";

const SCANNER_IMAGE = "repoverify-scanner:latest";
const MANIFEST_FILES = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "requirements.txt",
  "requirements-dev.txt",
  "pyproject.toml",
  "poetry.lock",
  "go.mod",
  "go.sum",
  "Gemfile",
  "Cargo.toml",
];

const severityScore = (s: string): number => {
  const sev = s.toLowerCase();
  if (sev.includes("critical")) return 9.5;
  if (sev.includes("high")) return 7.5;
  if (sev.includes("medium")) return 4.5;
  if (sev.includes("low")) return 1;
  return 1;
};

const normalizeScannerPath = (p: string): string => {
  let rel = String(p ?? "").split("\\").join("/");
  rel = rel.replace(/^\.\//, "");
  if (rel.startsWith("/workspace/")) rel = rel.slice("/workspace/".length);
  if (rel.startsWith("./")) rel = rel.slice(2);
  return rel;
};

const filterToChangedLines = (
  findings: SecurityFinding[],
  ranges: Record<string, Array<{ start: number; end: number }>>
): SecurityFinding[] =>
  findings.filter((f) => {
    if (!f.file || f.line === undefined) return true;
    return fileIsInRange(normalizeScannerPath(f.file), f.line, ranges);
  });

const runBandit = async (
  repoDir: string,
  changedFiles: string[]
): Promise<SecurityFinding[]> => {
  if (changedFiles.length === 0) return [];
  const result = await runInContainer({
    image: SCANNER_IMAGE,
    hostPath: repoDir,
    command: `python -m bandit -f json -q ${changedFiles.join(" ")} 2>/dev/null || true`,
    network: "none",
    timeoutMs: 120_000,
  });
  try {
    const parsed = JSON.parse(result.stdout);
    const findings: SecurityFinding[] = [];
    for (const fileResult of parsed.results ?? []) {
      const filePath = normalizeScannerPath(fileResult.filename);
      for (const issue of fileResult.issues ?? []) {
        findings.push({
          tool: "bandit",
          severity: (issue.issue_severity ?? "low").toLowerCase(),
          rule: issue.test_id,
          file: filePath,
          line: issue.line_number,
          message: issue.issue_text ?? issue.issue_cwe?.name,
          source: `${filePath}:${issue.line_number ?? ""}`,
        });
      }
    }
    return findings;
  } catch {
    return [];
  }
};

const runSemgrep = async (
  repoDir: string,
  changedFiles: string[]
): Promise<SecurityFinding[]> => {
  if (changedFiles.length === 0) return [];
  const result = await runInContainer({
    image: SCANNER_IMAGE,
    hostPath: repoDir,
    command: `semgrep scan --json -q --config auto ${changedFiles.join(" ")} 2>/dev/null || true`,
    network: "bridge",
    timeoutMs: 180_000,
  });
  try {
    const parsed = JSON.parse(result.stdout);
    const findings: SecurityFinding[] = [];
    for (const finding of parsed.results ?? []) {
      const sev = (finding.extra?.severity ?? "info").toLowerCase();
      findings.push({
        tool: "semgrep",
        severity: sev === "error" ? "high" : sev === "warning" ? "medium" : "low",
        rule: finding.check_id,
        file: normalizeScannerPath(finding.path),
        line: finding.start?.line,
        message: finding.extra?.message,
        source: finding.extra?.metadata?.cwe?.[0] ?? finding.check_id,
      });
    }
    return findings;
  } catch {
    return [];
  }
};

const runGitleaks = async (
  repoDir: string,
  changedFiles: string[]
): Promise<SecurityFinding[]> => {
  if (changedFiles.length === 0) return [];
  const result = await runInContainer({
    image: SCANNER_IMAGE,
    hostPath: repoDir,
    command:
      "gitleaks dir /workspace --report-format json --report-path /tmp/gitleaks-report.json --no-banner 2>/dev/null; cat /tmp/gitleaks-report.json 2>/dev/null",
    network: "none",
    timeoutMs: 120_000,
  });
  try {
    const parsed = JSON.parse(result.stdout);
    const changed = new Set(changedFiles);
    const findings: SecurityFinding[] = [];
    for (const leak of parsed) {
      if (!leak.File) continue;
      const file = normalizeScannerPath(leak.File);
      if (!changed.has(file)) continue;
      findings.push({
        tool: "gitleaks",
        severity: "high",
        rule: leak.RuleID,
        file,
        line: leak.StartLine,
        message: leak.Description,
        source: leak.Secret?.slice(0, 60) ?? leak.Match?.slice(0, 60),
      });
    }
    return findings;
  } catch {
    return [];
  }
};

const parseDependencies = (
  repoDir: string,
  changedFiles: string[]
): Array<{ name: string; version?: string; ecosystem: string; file: string }> => {
  const deps: Array<{ name: string; version?: string; ecosystem: string; file: string }> = [];
  const changed = new Set(changedFiles);

  if (changed.has("package.json")) {
    const content = readRepoFile(repoDir, "package.json", 200_000);
    if (content) {
      try {
        const pkg = JSON.parse(content);
        const merged = {
          ...(pkg.dependencies ?? {}),
          ...(pkg.devDependencies ?? {}),
        };
        for (const [name, version] of Object.entries(merged)) {
          const clean = String(version).replace(/^(?:[\^~><=]*\s*|v)/, "");
          if (/^\d+\.\d+/.test(clean)) {
            deps.push({ name, version: clean, ecosystem: "npm", file: "package.json" });
          }
        }
      } catch {
        // skip malformed
      }
    }
  }

  for (const file of ["requirements.txt", "requirements-dev.txt"]) {
    if (!changed.has(file)) continue;
    const content = readRepoFile(repoDir, file, 100_000);
    for (const line of content?.split("\n") ?? []) {
      const m = line.trim().match(/^([A-Za-z0-9_.-]+)\s*==\s*([A-Za-z0-9_.-]+)/);
      if (m) {
        deps.push({ name: m[1], version: m[2], ecosystem: "PyPI", file });
      }
    }
  }

  if (changed.has("go.mod")) {
    const content = readRepoFile(repoDir, "go.mod", 100_000);
    for (const line of content?.split("\n") ?? []) {
      const m = line.trim().match(/^([A-Za-z0-9_.\-/]+)\s+(v\d+\.\d+\.\d+)/);
      if (m) {
        deps.push({ name: m[1], version: m[2], ecosystem: "Go", file: "go.mod" });
      }
    }
  }

  return deps;
};

const queryOsv = async (
  name: string,
  version: string,
  ecosystem: string
): Promise<SecurityFinding[]> => {
  try {
    const response = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: { name, ecosystem },
        version,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as any;
    const findings: SecurityFinding[] = [];
    for (const vuln of data.vulns ?? []) {
      let severity = "low";
      for (const affected of vuln.affected ?? []) {
        for (const sev of affected.severity ?? []) {
          const score = Number(sev.score);
          if (!Number.isNaN(score)) {
            severity = score >= 9 ? "critical" : score >= 7 ? "high" : score >= 4 ? "medium" : "low";
          }
        }
      }
      findings.push({
        tool: "osv",
        severity,
        rule: vuln.id,
        file: "manifest",
        message: `${name}@${version}: ${vuln.summary ?? vuln.id}`,
        source: vuln.id,
      });
    }
    return findings;
  } catch {
    return [];
  }
};

export const runSecurityStage = async (input: {
  runId: string;
  repoDir: string;
  stack: StackInfo;
  diffText: string;
}): Promise<{ findings: SecurityFinding[]; blocked: boolean; summary: string }> => {
  const { runId, repoDir, diffText } = input;

  if (!diffText.trim()) {
    await upsertSecurityScan({
      debugRunId: runId,
      summary: "No patch to scan — skipped.",
      findings: [],
      blocked: false,
      status: "done",
    });
    return { findings: [], blocked: false, summary: "No patch to scan — skipped." };
  }

  const changedFiles = Object.keys(getChangedLineRanges(diffText));
  const ranges = getChangedLineRanges(diffText);

  let allFindings: SecurityFinding[] = [];

  const imageReady = await ensureImage(SCANNER_IMAGE, path.join(import.meta.dirname, "sandbox", "scanner-image")).catch(() => false);

  if (imageReady) {
    const results = await Promise.allSettled([
      runBandit(repoDir, changedFiles),
      runSemgrep(repoDir, changedFiles),
      runGitleaks(repoDir, changedFiles),
    ]);
    for (const r of results) {
      if (r.status === "fulfilled") allFindings.push(...r.value);
    }
  } else {
    console.log("⚠️ Scanner image unavailable — running OSV dependency check only.");
  }

  const osvDeps = parseDependencies(repoDir, changedFiles);
  if (osvDeps.length > 0) {
    const osvResults = await Promise.allSettled(
      osvDeps.map((d) => queryOsv(d.name, d.version ?? "0", d.ecosystem))
    );
    for (const r of osvResults) {
      if (r.status === "fulfilled") allFindings.push(...r.value);
    }
  }

  const lineScoped = filterToChangedLines(
    allFindings.filter((f) => f.tool !== "osv"),
    ranges
  );
  const osvFindings = allFindings.filter((f) => f.tool === "osv");
  const finalFindings = [...lineScoped, ...osvFindings];

  const blocked = finalFindings.some(
    (f) => severityScore(f.severity) >= 7.5
  );
  const highCount = finalFindings.filter(
    (f) => severityScore(f.severity) >= 7.5
  ).length;
  const warningCount = finalFindings.filter(
    (f) => severityScore(f.severity) < 7.5
  ).length;

  const summary = blocked
    ? `Security gate BLOCKED: ${highCount} HIGH/CRITICAL finding(s), ${warningCount} warning(s).`
    : `Security gate passed: ${highCount} informational finding(s), ${warningCount} warning(s).`;

  await upsertSecurityScan({
    debugRunId: runId,
    summary,
    findings: finalFindings,
    blocked,
    status: "done",
  });

  return { findings: finalFindings, blocked, summary };
};

export const manifestFiles = MANIFEST_FILES;
