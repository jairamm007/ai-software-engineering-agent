import { generateText } from "../ai/providers/llm.service.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import {
  createPerformanceScan,
  updatePerformanceScan,
  getPerformanceScanById,
  createPerformanceIssues,
  createPerformanceReport,
} from "../repository/performance.repository.js";
import type { CreatePerformanceScanInput, CreatePerformanceIssueInput } from "../repository/performance.repository.js";

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

function calculateCyclomaticComplexity(code: string): number {
  const decisionPoints = [
    /\bif\b/g, /\belse if\b/g, /\bfor\b/g, /\bwhile\b/g,
    /\bcase\s+/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g,
    /\?.*:/g,
  ];
  let score = 1;
  for (const pattern of decisionPoints) {
    const matches = code.match(pattern);
    if (matches) score += matches.length;
  }
  return score;
}

function analyzeComplexity(code: string, filePath: string): CreatePerformanceIssueInput[] {
  const issues: CreatePerformanceIssueInput[] = [];
  const lines = code.split("\n");
  const totalLines = lines.length;

  if (totalLines > 200) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "large_file",
      severity: totalLines > 500 ? "critical" : totalLines > 300 ? "high" : "medium",
      title: `Large file: ${totalLines} lines`,
      description: `This file has ${totalLines} lines, which makes it difficult to maintain and understand.`,
      recommendation: "Split this file into smaller, focused modules or components. Aim for files under 200 lines.",
      snippet: `${filePath}: ${totalLines} lines total`,
      lineStart: 1,
      lineEnd: totalLines,
    });
  }

  const complexity = calculateCyclomaticComplexity(code);
  if (complexity > 20) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "complexity",
      severity: complexity > 50 ? "critical" : complexity > 30 ? "high" : "medium",
      title: `High cyclomatic complexity: ${complexity}`,
      description: `This file has a cyclomatic complexity of ${complexity}. Functions with high complexity are hard to test and maintain.`,
      recommendation: "Break complex functions into smaller helper functions. Reduce nested conditionals and loops.",
      snippet: `Complexity score: ${complexity}`,
    });
  }

  const nestedLoops = code.match(/for\s*\(.*\)\s*\{[^}]*for\s*\(/g);
  if (nestedLoops) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "complexity",
      severity: "high",
      title: `Deep nested loops detected`,
      description: `Found ${nestedLoops.length} instance(s) of nested loops. Deeply nested loops can lead to O(n²) or worse performance.`,
      recommendation: "Consider breaking nested loops into separate functions, using early returns, or optimizing with data structures like hash maps.",
    });
  }

  const longFunctions = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]{200,}/g);
  if (longFunctions) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "complexity",
      severity: "medium",
      title: `Long functions detected`,
      description: `Found ${longFunctions.length} function(s) that are overly long. Long functions violate the Single Responsibility Principle.`,
      recommendation: "Extract each distinct responsibility into its own well-named function.",
    });
  }

  const largeClasses = code.match(/class\s+\w+[\s\S]{500,}/g);
  if (largeClasses) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "complexity",
      severity: "medium",
      title: `Large classes detected`,
      description: "Found classes that are too large. Large classes tend to accumulate multiple responsibilities.",
      recommendation: "Apply the Single Responsibility Principle — split large classes into smaller focused classes.",
    });
  }

  const excessiveConditionals = (code.match(/\bif\b/g) || []).length;
  if (excessiveConditionals > 30) {
    issues.push({
      scanId: "",
      filePath,
      issueType: "complexity",
      severity: "medium",
      title: `Excessive conditionals: ${excessiveConditionals} if-statements`,
      description: `This file contains ${excessiveConditionals} conditional statements, indicating complex branching logic.`,
      recommendation: "Replace complex conditionals with polymorphism, strategy pattern, or lookup tables.",
    });
  }

  return issues;
}

function findDuplicates(
  files: { path: string; content: string }[]
): CreatePerformanceIssueInput[] {
  const issues: CreatePerformanceIssueInput[] = [];
  const functionMap = new Map<string, { path: string; name: string }[]>();

  for (const file of files) {
    const funcRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:[=\(]|\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
    let match;
    while ((match = funcRegex.exec(file.content)) !== null) {
      const name = match[1];
      if (!functionMap.has(name)) functionMap.set(name, []);
      functionMap.get(name)!.push({ path: file.path, name });
    }
  }

  for (const [name, locations] of functionMap) {
    if (locations.length > 1 && !name.startsWith("_")) {
      issues.push({
        scanId: "",
        filePath: locations.map((l) => l.path).join(", "),
        issueType: "duplicate",
        severity: locations.length > 3 ? "high" : "medium",
        title: `Duplicate ${name} across ${locations.length} files`,
        description: `The identifier "${name}" appears in ${locations.length} locations. These may contain duplicated logic.`,
        recommendation: `Extract "${name}" into a shared utility module and import it where needed.`,
      });
    }
  }

  return issues;
}

function detectLargeFiles(
  files: { path: string; content: string }[]
): CreatePerformanceIssueInput[] {
  const issues: CreatePerformanceIssueInput[] = [];
  for (const file of files) {
    const lines = file.content.split("\n").length;
    if (lines > 200) {
      issues.push({
        scanId: "",
        filePath: file.path,
        issueType: "large_file",
        severity: lines > 500 ? "critical" : lines > 300 ? "high" : "medium",
        title: `Large file: ${lines} lines`,
        description: `${file.path} has ${lines} lines. Large files are harder to navigate, understand, and maintain.`,
        recommendation: "Split into smaller files. Aim for a maximum of 200 lines per file.",
        lineStart: 1,
        lineEnd: lines,
      });
    }
  }
  return issues;
}

export const runPerformanceAnalysis = async (input: CreatePerformanceScanInput) => {
  const scan = await createPerformanceScan(input);
  const model = await getModel(input.userId);
  const repoContext = await loadRepoContext(input.repositoryId);

  const allIssues: CreatePerformanceIssueInput[] = [];
  const files: { path: string; content: string }[] = [];
  const repo = input.repositoryId ? await getRepositoryById(input.repositoryId, input.userId).catch(() => null) : null;

  let filesAnalyzed = 0;

  if (repo?.files) {
    for (const file of repo.files) {
      const fileContent = file.chunks?.map((c) => c.content).join("\n") || "";
      if (!fileContent.trim()) continue;
      filesAnalyzed++;
      files.push({ path: file.path, content: fileContent });
      allIssues.push(...analyzeComplexity(fileContent, file.path));
    }
  }

  allIssues.push(...findDuplicates(files));
  allIssues.push(...detectLargeFiles(files));

  const systemPrompt = `You are an expert software engineer reviewing code for performance and quality improvements.

Analyze the provided code and return a JSON array of performance issues found.

CHECK FOR:
1. Unnecessary loops - can they be replaced with map/filter/reduce or eliminated?
2. Database query optimization - N+1 queries, missing indexes
3. Repeated API calls - unnecessary network requests
4. Missing pagination - large data sets loaded at once
5. Lazy loading opportunities - components/modules loaded eagerly
6. Cache opportunities - repeated computations
7. Memory leaks - event listeners not cleaned up, closures holding references
8. Inefficient data structures - using arrays where maps/sets would be better
9. Bundle size concerns - large imports, tree-shaking opportunities

OUTPUT FORMAT (JSON array):
[
  {
    "filePath": "path/to/file",
    "issueType": "ai_suggestion",
    "severity": "critical | high | medium | low",
    "title": "Short title",
    "description": "Detailed description of the performance issue",
    "recommendation": "How to fix it",
    "snippet": "The relevant code snippet"
  }
]

Return ONLY the JSON array. If no issues found, return [].`;

  const userContent = repoContext
    ? `Repository Code:\n${repoContext}`
    : "No repository context available. Provide general performance recommendations.";

  let aiIssues: CreatePerformanceIssueInput[] = [];
  try {
    const result = await generateText(systemPrompt, userContent, model);
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      aiIssues = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // AI analysis failed, still return locally detected issues
  }

  const scanIssues = [...allIssues, ...aiIssues.map((i) => ({ ...i, scanId: scan.id }))];

  if (scanIssues.length > 0) {
    await createPerformanceIssues(scanIssues.map((i) => ({ ...i, scanId: scan.id })));
  }

  const complexityIssues = scanIssues.filter((i) => i.issueType === "complexity").length;
  const duplicateIssues = scanIssues.filter((i) => i.issueType === "duplicate").length;
  const largeFileIssues = scanIssues.filter((i) => i.issueType === "large_file").length;
  const totalIssues = scanIssues.length;

  const maxComplexity = files.reduce((max, f) => Math.max(max, calculateCyclomaticComplexity(f.content)), 0);
  const avgComplexity = files.reduce((sum, f) => sum + calculateCyclomaticComplexity(f.content), 0) / Math.max(files.length, 1);
  const complexityScore = Math.max(0, Math.min(100, 100 - avgComplexity * 2));

  const largeFilePenalty = largeFileIssues * 5;
  const duplicatePenalty = duplicateIssues * 3;
  const aiIssuePenalty = scanIssues.filter((i) => i.issueType === "ai_suggestion").length;
  const penalty = largeFilePenalty + duplicatePenalty + aiIssuePenalty;

  const performanceScore = Math.max(0, Math.min(100, Math.round(complexityScore - penalty)));
  const maintainabilityScore = Math.max(0, Math.min(100, Math.round(complexityScore - largeFilePenalty)));
  const readabilityScore = Math.max(0, Math.min(100, Math.round(complexityScore - totalIssues * 1.5)));
  const overallHealth = Math.round((performanceScore + maintainabilityScore + readabilityScore) / 3);

  const summary = [
    `Performance analysis completed: ${filesAnalyzed} file(s) analyzed, ${totalIssues} issue(s) found.`,
    `Performance: ${performanceScore}/100`,
    `Maintainability: ${maintainabilityScore}/100`,
    `Readability: ${readabilityScore}/100`,
    `Overall Health: ${overallHealth}/100`,
    `Max Complexity: ${maxComplexity}`,
  ].filter(Boolean).join(" | ");

  await updatePerformanceScan(scan.id, {
    performanceScore,
    maintainabilityScore,
    readabilityScore,
    overallHealth,
    filesAnalyzed,
    summary,
    status: "completed",
    updatedAt: new Date(),
  });

  return {
    ...scan,
    performanceScore,
    maintainabilityScore,
    readabilityScore,
    overallHealth,
    filesAnalyzed,
    summary,
    status: "completed",
    issues: scanIssues,
    complexityIssues,
    duplicateIssues,
    largeFileIssues,
    totalIssues,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    maxComplexity,
  };
};

export const generateReport = async (scanId: string, userId: string, format: string) => {
  const scan = await getPerformanceScanById(scanId, userId);
  if (!scan) throw new Error("Scan not found");

  const issues = scan.issues as Array<{ issueType: string; severity: string; filePath?: string; title: string; description?: string; recommendation?: string }>;
  const complexity = issues.filter((i) => i.issueType === "complexity").length;
  const duplicate = issues.filter((i) => i.issueType === "duplicate").length;
  const largeFiles = issues.filter((i) => i.issueType === "large_file").length;
  const aiSuggestions = issues.filter((i) => i.issueType === "ai_suggestion").length;

  const critical = issues.filter((i) => i.severity === "critical").length;
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;

  const header = [
    `# Performance Analysis Report`,
    ``,
    `**Scan ID:** ${scan.id}`,
    `**Date:** ${new Date(scan.createdAt).toISOString()}`,
    `**Files Analyzed:** ${scan.filesAnalyzed}`,
    ``,
    `## Health Scores`,
    ``,
    `| Metric | Score |`,
    `|--------|-------|`,
    `| Performance | ${scan.performanceScore}/100 |`,
    `| Maintainability | ${scan.maintainabilityScore}/100 |`,
    `| Readability | ${scan.readabilityScore}/100 |`,
    `| **Overall Health** | **${scan.overallHealth}/100** |`,
    ``,
    `## Issue Summary`,
    ``,
    `| Type | Count |`,
    `|------|-------|`,
    `| Complexity Issues | ${complexity} |`,
    `| Duplicate Code | ${duplicate} |`,
    `| Large Files | ${largeFiles} |`,
    `| AI Suggestions | ${aiSuggestions} |`,
    `| **Total** | **${scan.issues.length}** |`,
    ``,
    `| Severity | Count |`,
    `|----------|-------|`,
    `| Critical | ${critical} |`,
    `| High | ${high} |`,
    `| Medium | ${medium} |`,
    `| Low | ${low} |`,
    ``,
    `## Issues Found`,
    ``,
  ].join("\n");

  const issuesContent = issues
    .map(
      (issue, i) =>
        `### ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}` +
        `\n\n- **File:** ${issue.filePath || "N/A"}` +
        `\n- **Type:** ${issue.issueType}` +
        `\n- **Description:** ${issue.description || "N/A"}` +
        `\n- **Recommendation:** ${issue.recommendation || "N/A"}`
    )
    .join("\n\n---\n\n");

  const fullContent = header + issuesContent;

  const report = await createPerformanceReport(scanId, fullContent, format);
  return report;
};
