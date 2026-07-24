import { buildContext } from "../rag/context-builder.js";
import { getTool } from "./agent-tools.js";
import { AgentMemory } from "./agent-memory.js";

export interface ReasoningResult {
  context: string;
  totalChunks: number;
  chainOfThought: string[];
  patterns: string[];
  dependencies: string[];
  complexity: { score: number; level: string };
  keyFiles: string[];
}

function extractChainOfThought(chunks: any[]): string[] {
  const steps: string[] = [];

  const files = [...new Set(chunks.map((c: any) => c.filePath))];
  steps.push(`Identified ${files.length} relevant files across ${chunks.length} code chunks`);

  const highRelevance = chunks.filter((c: any) => c.distance < 0.3);
  const medRelevance = chunks.filter((c: any) => c.distance >= 0.3 && c.distance < 0.5);
  const lowRelevance = chunks.filter((c: any) => c.distance >= 0.5);

  if (highRelevance.length > 0) {
    steps.push(`${highRelevance.length} highly relevant chunks (distance < 0.3) — strong matches`);
  }
  if (medRelevance.length > 0) {
    steps.push(`${medRelevance.length} moderately relevant chunks (0.3 <= distance < 0.5)`);
  }
  if (lowRelevance.length > 0) {
    steps.push(`${lowRelevance.length} loosely relevant chunks (distance >= 0.5) — context fill`);
  }

  const lineRanges = chunks.map((c: any) => ({ file: c.filePath, start: c.startLine, end: c.endLine }));
  const fileLineMap = new Map<string, { start: number; end: number }[]>();
  for (const lr of lineRanges) {
    const existing = fileLineMap.get(lr.file) ?? [];
    existing.push({ start: lr.start, end: lr.end });
    fileLineMap.set(lr.file, existing);
  }

  for (const [fp, ranges] of fileLineMap) {
    if (ranges.length > 2) {
      steps.push(`${fp} has ${ranges.length} overlapping chunks — likely a critical file`);
    }
  }

  return steps;
}

function detectPatterns(chunks: any[]): string[] {
  const patterns: string[] = [];
  const allContent = chunks.map((c: any) => c.content).join("\n");

  const patternChecks: Array<{ pattern: RegExp; name: string }> = [
    { pattern: /\bexport\s+(default\s+)?(class|function|const|interface|type)\b/g, name: "Module exports" },
    { pattern: /\bimport\s+.*from\s+['"][^'"]+['"]/g, name: "ES Module imports" },
    { pattern: /\basync\b.*\bawait\b/g, name: "Async/Await pattern" },
    { pattern: /\btry\s*\{[\s\S]*?\}\s*catch\b/g, name: "Error handling" },
    { pattern: /\bnew\s+(Map|Set|Array|Promise)\b/g, name: "Built-in constructors" },
    { pattern: /\b(React|useState|useEffect|Component)\b/g, name: "React patterns" },
    { pattern: /\b(Router|router\.(get|post|put|delete|patch))\b/g, name: "Express routing" },
    { pattern: /\bprisma\b|\bfindMany\b|\bfindFirst\b|\bcreate\b|\bupdate\b|\bdelete\b/gi, name: "Prisma ORM" },
    { pattern: /\bdescribe\s*\(/g, name: "Test suites (describe)" },
    { pattern: /\b(it|test)\s*\(/g, name: "Test cases (it/test)" },
  ];

  for (const check of patternChecks) {
    const matches = allContent.match(check.pattern);
    if (matches && matches.length > 0) {
      patterns.push(`${check.name} (${matches.length} occurrences)`);
    }
  }

  return patterns;
}

function extractDependencies(chunks: any[]): string[] {
  const deps: string[] = [];
  const importPattern = /from\s+['"]([^'"]+)['"]/g;

  for (const chunk of chunks) {
    let match;
    while ((match = importPattern.exec(chunk.content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith(".") && !dep.startsWith("/")) {
        deps.push(dep);
      }
    }
  }

  return [...new Set(deps)].sort();
}

function analyzeComplexity(chunks: any[]): { score: number; level: string } {
  if (chunks.length === 0) return { score: 0, level: "none" };

  let score = 0;
  const allContent = chunks.map((c: any) => c.content).join("\n");

  score += Math.min(chunks.length * 2, 20);

  const functions = allContent.match(/\bfunction\b/g) ?? [];
  score += Math.min(functions.length, 15);

  const classes = allContent.match(/\bclass\b/g) ?? [];
  score += classes.length * 3;

  const conditions = allContent.match(/\b(if|else|switch|case|for|while)\b/g) ?? [];
  score += Math.min(conditions.length, 20);

  const asyncOps = allContent.match(/\b(async|await|Promise|\.then)\b/g) ?? [];
  score += Math.min(asyncOps.length, 15);

  const maxScore = 100;
  const normalizedScore = Math.min(score, maxScore);

  let level: string;
  if (normalizedScore < 20) level = "low";
  else if (normalizedScore < 50) level = "moderate";
  else if (normalizedScore < 75) level = "high";
  else level = "very_high";

  return { score: normalizedScore, level };
}

function identifyKeyFiles(chunks: any[]): string[] {
  const fileImportance = new Map<string, number>();

  for (const chunk of chunks) {
    const current = fileImportance.get(chunk.filePath) ?? 0;
    const relevanceBonus = Math.max(0, (1 - chunk.distance) * 10);
    fileImportance.set(chunk.filePath, current + relevanceBonus);
  }

  return [...fileImportance.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([fp]) => fp);
}

export const reasonerAgent = async (
  chunks: any[],
  memory?: AgentMemory
): Promise<ReasoningResult> => {
  const context = buildContext(chunks);

  const chainOfThought = extractChainOfThought(chunks);
  const patterns = detectPatterns(chunks);
  const dependencies = extractDependencies(chunks);
  const complexity = analyzeComplexity(chunks);
  const keyFiles = identifyKeyFiles(chunks);

  const result: ReasoningResult = {
    context,
    totalChunks: chunks.length,
    chainOfThought,
    patterns,
    dependencies,
    complexity,
    keyFiles,
  };

  if (memory) {
    memory.recordExecution("reasoner");
    memory.setShared("chainOfThought", chainOfThought);
    memory.setShared("detectedPatterns", patterns);
    memory.setShared("dependencies", dependencies);
    memory.setShared("complexity", complexity);
    memory.setShared("keyFiles", keyFiles);

    for (const pattern of patterns.slice(0, 3)) {
      memory.addInsight({
        agent: "reasoner",
        type: "pattern",
        content: `Detected: ${pattern}`,
        severity: "info",
      });
    }

    if (complexity.level === "high" || complexity.level === "very_high") {
      memory.addInsight({
        agent: "reasoner",
        type: "warning",
        content: `Code complexity is ${complexity.level} (score: ${complexity.score}/100) — may need careful analysis`,
        severity: complexity.level === "very_high" ? "high" : "medium",
      });
    }

    memory.setMetrics("reasoner", {
      executionTimeMs: 0,
      tokensProcessed: context.length,
      confidence: chunks.length > 0 ? Math.max(0, 1 - chunks.reduce((s: number, c: any) => s + c.distance, 0) / chunks.length) : 0,
      coverageScore: keyFiles.length,
    });
  }

  return result;
};
