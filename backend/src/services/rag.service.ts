import { agentGraph } from "../agents/graph.state.js";

export interface AskRepositoryInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
}

interface CacheEntry {
  result: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes (was 5)
const CACHE_MAX_SIZE = 200; // 200 entries (was 100)

const getCacheKey = (input: AskRepositoryInput) =>
  `${input.question.toLowerCase().trim()}::${input.repositoryId ?? ""}::${input.filePath ?? ""}`;

const getCached = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.result;
};

const setCache = (key: string, result: any) => {
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { result, timestamp: Date.now() });
};

const buildSource = (chunks: any[]) => {
  const firstChunk = chunks?.[0];
  if (!firstChunk) return null;
  return {
    filePath: firstChunk.filePath,
    startLine: firstChunk.startLine,
    endLine: firstChunk.endLine,
    confidence: Math.round((1 - firstChunk.distance) * 100),
  };
};

const RESULT_FIELDS = [
  "answer",
  "reviewResult",
  "fixResult",
  "commitResult",
  "architecture",
  "documentation",
  "pullRequest",
  "testResult",
  "securityResult",
] as const;

const TYPE_MAP: Record<string, string> = {
  answer: "answer",
  reviewResult: "review",
  fixResult: "fix",
  commitResult: "commit",
  architecture: "architecture",
  documentation: "documentation",
  pullRequest: "pullRequest",
  testResult: "test",
  securityResult: "security",
};

export const askRepository = async ({
  question,
  repositoryId,
  filePath,
}: AskRepositoryInput) => {
  const cacheKey = getCacheKey({ question, repositoryId, filePath });
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit for: ${question.slice(0, 50)}...`);
    return cached;
  }

  const startTime = Date.now();

  const result = await agentGraph.invoke({
    question,
    repositoryId,
    filePath,
  });

  const elapsed = Date.now() - startTime;
  console.log(`⏱️ Graph completed in ${elapsed}ms`);

  for (const field of RESULT_FIELDS) {
    if (result[field]) {
      const response = {
        type: TYPE_MAP[field],
        answer: result[field],
        source: buildSource(result.chunks),
      };
      setCache(cacheKey, response);
      return response;
    }
  }

  return {
    type: "unknown",
    answer: "No response generated.",
  };
};
