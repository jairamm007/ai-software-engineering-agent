import { semanticSearch, multiQuerySearch } from "../services/search.service.js";
import { PlanResult } from "./planner.agent.js";
import { getTool } from "./agent-tools.js";
import { AgentMemory } from "./agent-memory.js";

export interface RetrievalResult {
  chunks: any[];
  totalRetrieved: number;
  queriesUsed: string[];
  filesTouched: number;
  averageRelevance: number;
}

function getOptimalLimit(plan: PlanResult): number {
  const limits: Record<string, number> = {
    review: 25,
    security: 25,
    test: 20,
    architecture: 22,
    documentation: 18,
    fix: 15,
    pullRequest: 15,
    commit: 12,
    answer: 12,
    explain: 12,
    refactor: 15,
  };
  return limits[plan.task] ?? 15;
}

async function iterativeSearch(
  question: string,
  initialLimit: number,
  repositoryId?: string,
  filePath?: string
): Promise<{ chunks: any[]; queriesUsed: string[] }> {
  const queriesUsed: string[] = [question];

  const chunks = await multiQuerySearch(
    question,
    initialLimit,
    repositoryId,
    filePath
  );

  if (chunks.length >= 5) {
    return { chunks, queriesUsed };
  }

  const expandTool = getTool("expand_query");
  if (expandTool) {
    const expanded = await expandTool.execute({ query: question }, {});
    if (expanded.success && expanded.data) {
      const { expandedTerms } = expanded.data as { expandedTerms: string[] };
      for (const term of expandedTerms.slice(0, 2)) {
        queriesUsed.push(term);
        const moreChunks = await semanticSearch(
          term,
          Math.ceil(initialLimit / 2),
          repositoryId,
          filePath
        );
        chunks.push(...moreChunks);
      }
    }
  }

  const seen = new Set<string>();
  const unique = chunks.filter((c) => {
    const key = `${c.filePath}:${c.startLine}-${c.endLine}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => a.distance - b.distance);
  return { chunks: unique.slice(0, initialLimit * 2), queriesUsed };
}

function filterByTask(chunks: any[], task: string): any[] {
  const taskFilePatterns: Record<string, RegExp[]> = {
    test: [/.test\./i, /.spec\./i, /__tests__/, /test/],
    security: [/.env/i, /auth/i, /middleware/i, /config/i, /secur/i],
    architecture: [/index\./i, /app\./i, /main\./i, /server\./i, /router/i, /types?\./i],
    documentation: [/readme/i, /doc/i, /api/i, /types?\./i],
    review: [], // Keep all for review
  };

  const patterns = taskFilePatterns[task];
  if (!patterns || patterns.length === 0) return chunks;

  const matching = chunks.filter((c) =>
    patterns.some((p) => p.test(c.filePath))
  );

  return matching.length > 0 ? matching : chunks;
}

function calculateRelevance(chunks: any[]): number {
  if (chunks.length === 0) return 0;
  const totalDistance = chunks.reduce((sum, c) => sum + c.distance, 0);
  const avgDistance = totalDistance / chunks.length;
  return Math.max(0, 1 - avgDistance);
}

export const retrieverAgent = async (
  plan: PlanResult,
  memory?: AgentMemory
): Promise<RetrievalResult> => {
  if (!plan.needsRepositorySearch) {
    return {
      chunks: [],
      totalRetrieved: 0,
      queriesUsed: [],
      filesTouched: 0,
      averageRelevance: 0,
    };
  }

  const limit = getOptimalLimit(plan);

  const { chunks, queriesUsed } = await iterativeSearch(
    plan.question,
    limit,
    plan.repositoryId,
    plan.filePath
  );

  const filteredChunks = filterByTask(chunks, plan.task);

  const limitChunks = filteredChunks.slice(0, limit);

  const filesTouched = new Set(limitChunks.map((c: any) => c.filePath)).size;
  const averageRelevance = calculateRelevance(limitChunks);

  const memoryResult = limitChunks;

  if (memory) {
    memory.recordExecution("retriever");
    memory.setShared("retrievalQueries", queriesUsed);
    memory.setShared("retrievalFilesCount", filesTouched);

    for (const chunk of limitChunks.slice(0, 3)) {
      memory.addInsight({
        agent: "retriever",
        type: "finding",
        content: `Retrieved relevant code from ${chunk.filePath}:${chunk.startLine}-${chunk.endLine} (distance: ${chunk.distance.toFixed(3)})`,
        severity: chunk.distance < 0.3 ? "info" : "low",
        fileRef: chunk.filePath,
      });
    }

    memory.setMetrics("retriever", {
      executionTimeMs: 0,
      tokensProcessed: limitChunks.reduce((sum: number, c: any) => sum + (c.content?.length ?? 0), 0),
      confidence: averageRelevance,
      coverageScore: filesTouched,
    });
  }

  return {
    chunks: memoryResult,
    totalRetrieved: memoryResult.length,
    queriesUsed,
    filesTouched,
    averageRelevance,
  };
};
