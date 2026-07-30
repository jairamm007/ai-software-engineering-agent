import { generateText } from "../ai/providers/llm.service.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import {
  createSecurityScan,
  updateSecurityScan,
  createSecurityIssues,
  createSecurityReport,
} from "../repository/security.repository.js";
import type { CreateSecurityScanInput, CreateSecurityIssueInput } from "../repository/security.repository.js";

const MAX_CONTEXT_CHARS = 60_000;

async function loadRepoContext(repositoryId?: string): Promise<string> {
  if (!repositoryId) return "";
  try {
    const repo = await getRepositoryById(repositoryId, "");
    if (!repo?.files?.length) return "";

    let totalChars = 0;
    const chunks: string[] = [];
    for (const file of repo.files) {
      for (const chunk of file.chunks ?? []) {
        const text = `[${file.path}:L${chunk.startLine}-${chunk.endLine}]\n${chunk.content}`;
        if (totalChars + text.length > MAX_CONTEXT_CHARS) break;
        totalChars += text.length;
        chunks.push(text);
      }
      if (totalChars >= MAX_CONTEXT_CHARS) break;
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
  } catch { return undefined; }
}

const SECRET_PATTERNS: { name: string; regex: RegExp; severity: string }[] = [
  { name: "OpenAI API Key", regex: /sk-[A-Za-z0-9]{32,}/g, severity: "critical" },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", regex: /(?i)aws[_ ]?secret[_ ]?access[_ ]?key['"]?\s*[:=]\s*['"][A-Za-z0-9\/+=]{40}['"]/g, severity: "critical" },
  { name: "JWT Secret", regex: /(?i)jwt[_ ]?secret['"]?\s*[:=]\s*['"][^'"]{16,}['"]/g, severity: "high" },
  { name: "Database URL", regex: /(?:postgres|mysql|mongodb|redis):\/\/[^@\s]+:[^@\s]+@/g, severity: "critical" },
  { name: "Private Key", regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: "critical" },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/g, severity: "high" },
  { name: "Slack Token", regex: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g, severity: "high" },
  { name: "GitHub Token", regex: /gh[ps]_[0-9A-Za-z]{36,}/g, severity: "critical" },
  { name: "Hardcoded Password", regex: /(?i)password\s*[:=]\s*['"][^'"]{4,}['"]/g, severity: "high" },
  { name: "NPM Token", regex: /npm_[A-Za-z0-9]{36,}/g, severity: "high" },
  { name: "Stripe API Key", regex: /sk_live_[0-9A-Za-z]{24,}/g, severity: "critical" },
  { name: "Heroku API Key", regex: /(?i)heroku[_ ]?api[_ ]?key['"]?\s*[:=]\s*['"][A-Za-z0-9\-]{36}['"]/g, severity: "high" },
];

function scanForSecrets(code: string, filePath: string): CreateSecurityIssueInput[] {
  const issues: CreateSecurityIssueInput[] = [];
  for (const pattern of SECRET_PATTERNS) {
    const matches = code.matchAll(pattern.regex);
    for (const match of matches) {
      const lineNum = code.substring(0, match.index).split("\n").length;
      issues.push({
        scanId: "",
        filePath,
        issueType: "secret",
        severity: pattern.severity,
        title: `${pattern.name} Found`,
        description: `A ${pattern.name} was detected in ${filePath} at approximately line ${lineNum}.`,
        recommendation: `Remove this secret from the code. Use environment variables or a secret management service instead. Never commit secrets to version control.`,
        snippet: code.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
      });
    }
  }
  return issues;
}

function scanDependencies(code: string, filePath: string): CreateSecurityIssueInput[] {
  const issues: CreateSecurityIssueInput[] = [];
  if (!filePath.endsWith("package.json") && !filePath.endsWith("requirements.txt") && !filePath.endsWith("Cargo.toml") && !filePath.endsWith("go.mod")) return issues;

  if (filePath.endsWith("package.json")) {
    const deps = [
      { name: "express", versions: ["4.17.1", "4.17.0", "4.16.0"], severity: "medium" },
      { name: "lodash", versions: ["4.17.20", "4.17.19"], severity: "medium" },
      { name: "axios", versions: ["0.21.0", "0.21.1"], severity: "medium" },
    ];

    for (const dep of deps) {
      const depRegex = new RegExp(`"${dep.name}"\\s*:\\s*"([^"]+)"`);
      const match = code.match(depRegex);
      if (match && dep.versions.includes(match[1])) {
        issues.push({
          scanId: "",
          filePath,
          issueType: "dependency",
          severity: dep.severity,
          title: `Known Vulnerability: ${dep.name} ${match[1]}`,
          description: `${dep.name} version ${match[1]} has known security vulnerabilities.`,
          recommendation: `Upgrade ${dep.name} to the latest version.`,
          snippet: match[0],
        });
      }
    }
  }
  return issues;
}

export const runSecurityScan = async (input: CreateSecurityScanInput) => {
  const scan = await createSecurityScan(input);
  const model = await getModel(input.userId);
  const repoContext = await loadRepoContext(input.repositoryId);

  const allIssues: CreateSecurityIssueInput[] = [];
  const repo = input.repositoryId ? await getRepositoryById(input.repositoryId, input.userId).catch(() => null) : null;

  if (repo?.files) {
    for (const file of repo.files) {
      const fileContent = file.chunks?.map((c) => c.content).join("\n") || "";
      allIssues.push(...scanForSecrets(fileContent, file.path));
      allIssues.push(...scanDependencies(fileContent, file.path));
    }
  }

  const systemPrompt = `You are an expert security engineer. Review the provided code for security vulnerabilities.

CHECK FOR THESE ISSUES and return them as a JSON array:
1. SQL Injection - raw SQL queries with string concatenation
2. NoSQL Injection - unsafe MongoDB queries
3. Cross-Site Scripting (XSS) - unescaped user output in HTML
4. Missing Input Validation - request body/params used without validation
5. Weak Authentication - insecure auth patterns
6. Weak Password Handling - plain text passwords, weak hashing
7. Insecure File Uploads - no file type/size validation
8. Insecure Direct Object References - IDOR patterns

OUTPUT FORMAT (JSON array):
[
  {
    "filePath": "path/to/file",
    "issueType": "sql_injection | xss | input_validation | auth | file_upload | other",
    "severity": "critical | high | medium | low",
    "title": "Short issue title",
    "description": "Detailed description of the vulnerability",
    "recommendation": "How to fix it",
    "snippet": "The relevant code snippet"
  }
]

Return ONLY the JSON array, no other text. If no issues found, return [].`;

  const userContent = repoContext
    ? `Repository Code:\n${repoContext}`
    : "No repository context available. Provide general security recommendations.";

  let aiIssues: CreateSecurityIssueInput[] = [];
  try {
    const result = await generateText(systemPrompt, userContent, model);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      aiIssues = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // AI analysis failed, still return secret/dep issues found locally
  }

  const scanIssues = [...allIssues, ...aiIssues.map((i) => ({ ...i, scanId: scan.id }))];

  if (scanIssues.length > 0) {
    await createSecurityIssues(scanIssues.map((i) => ({ ...i, scanId: scan.id })));
  }

  const criticalCount = scanIssues.filter((i) => i.severity === "critical").length;
  const highCount = scanIssues.filter((i) => i.severity === "high").length;
  const mediumCount = scanIssues.filter((i) => i.severity === "medium").length;
  const lowCount = scanIssues.filter((i) => i.severity === "low").length;

  const deduction = criticalCount * 25 + highCount * 10 + mediumCount * 5 + lowCount * 2;
  const securityScore = Math.max(0, Math.min(100, 100 - deduction));

  const summary = [
    `Security scan completed with ${scanIssues.length} issue(s) found.`,
    criticalCount > 0 ? `Critical: ${criticalCount}` : "",
    highCount > 0 ? `High: ${highCount}` : "",
    mediumCount > 0 ? `Medium: ${mediumCount}` : "",
    lowCount > 0 ? `Low: ${lowCount}` : "",
    `Security Score: ${securityScore}/100`,
  ].filter(Boolean).join(" | ");

  await updateSecurityScan(scan.id, {
    securityScore,
    summary,
    status: "completed",
    updatedAt: new Date(),
  });

  return {
    ...scan,
    securityScore,
    summary,
    status: "completed",
    issues: scanIssues,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };
};

export const generateReport = async (scanId: string, userId: string, format: string) => {
  const scan = await getSecurityScanById(scanId, userId);
  if (!scan) throw new Error("Scan not found");

  const critical = scan.issues.filter((i) => i.severity === "critical").length;
  const high = scan.issues.filter((i) => i.severity === "high").length;
  const medium = scan.issues.filter((i) => i.severity === "medium").length;
  const low = scan.issues.filter((i) => i.severity === "low").length;

  const content = [
    `# Security Scan Report`,
    ``,
    `**Scan ID:** ${scan.id}`,
    `**Date:** ${new Date(scan.createdAt).toISOString()}`,
    `**Security Score:** ${scan.securityScore}/100`,
    ``,
    `## Summary`,
    ``,
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Critical | ${critical} |`,
    `| High     | ${high} |`,
    `| Medium   | ${medium} |`,
    `| Low      | ${low} |`,
    `| **Total** | **${scan.issues.length}** |`,
    ``,
    `## Issues Found`,
    ``,
  ].join("\n");

  const issuesContent = scan.issues
    .map(
      (issue, i) =>
        `### ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}` +
        `\n\n- **File:** ${issue.filePath || "N/A"}` +
        `\n- **Type:** ${issue.issueType}` +
        `\n- **Description:** ${issue.description || "N/A"}` +
        `\n- **Recommendation:** ${issue.recommendation || "N/A"}` +
        `\n- **Status:** ${issue.status}`
    )
    .join("\n\n---\n\n");

  const fullContent = content + issuesContent;

  const report = await createSecurityReport(scanId, fullContent, format);
  return report;
};
