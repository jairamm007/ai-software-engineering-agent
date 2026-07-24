import { vi } from "vitest";
import type { PlanResult, PlannerTask } from "../../agents/planner.agent.js";
import type { ReasoningResult } from "../../agents/retriever.agent.js";
import type { RetrievedChunk } from "../../vector/vector.repository.js";

export function createMockPlanResult(overrides?: Partial<PlanResult>): PlanResult {
  return {
    question: "Test question",
    task: "answer",
    needsRepositorySearch: true,
    repositoryId: "repo-123",
    filePath: undefined,
    confidence: 0.85,
    reasoning: "Regex analysis matched task: answer with 85% confidence",
    subtasks: ["Analyze code", "Provide answer"],
    priority: "medium",
    estimatedComplexity: "moderate",
    ...overrides,
  };
}

export function createMockRetrievedChunk(overrides?: Partial<RetrievedChunk>): RetrievedChunk {
  return {
    id: "chunk-1",
    content: 'export function testFunction() {\n  return "hello";\n}',
    filePath: "src/test.ts",
    startLine: 1,
    endLine: 3,
    distance: 0.25,
    repositoryId: "repo-123",
    codeChunkId: "cc-1",
    ...overrides,
  };
}

export function createMockReasoningResult(overrides?: Partial<ReasoningResult>): ReasoningResult {
  return {
    context: "Files (1 files, 1 chunks):\n  - src/test.ts (L1-3)\n\n---\n\n[★ src/test.ts:L1-3]\nexport function testFunction() {\n  return \"hello\";\n}",
    totalChunks: 1,
    chainOfThought: ["Identified 1 relevant files across 1 code chunks"],
    patterns: ["Module exports (1 occurrences)"],
    dependencies: [],
    complexity: { score: 10, level: "low" },
    keyFiles: ["src/test.ts"],
    ...overrides,
  };
}

export function createMockChunks(count: number = 3): RetrievedChunk[] {
  const files = [
    "src/index.ts",
    "src/services/agent.service.ts",
    "src/agents/planner.agent.ts",
    "src/utils/helpers.ts",
    "src/types/index.ts",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `chunk-${i}`,
    content: `// Chunk ${i} content\nexport const value${i} = ${i};\nfunction helper${i}() { return ${i}; }`,
    filePath: files[i % files.length],
    startLine: i * 10 + 1,
    endLine: i * 10 + 10,
    distance: 0.1 + (i * 0.1),
    repositoryId: "repo-123",
    codeChunkId: `cc-${i}`,
  }));
}

export function createMockMemory(sessionId: string = "test-session") {
  const { AgentMemory } = require("../../agents/agent-memory.js");
  return AgentMemory.create(sessionId, "Test question");
}

export function mockGenerateText(returnValue: string = "Mock agent response") {
  vi.mock("../../ai/providers/llm.service.js", () => ({
    generateText: vi.fn().mockResolvedValue(returnValue),
    generateTextStream: vi.fn().mockImplementation(async function* () {
      yield returnValue;
    }),
  }));
}

export function mockSearchServices(chunks?: RetrievedChunk[]) {
  const defaultChunks = chunks ?? createMockChunks(3);
  vi.mock("../../services/search.service.js", () => ({
    semanticSearch: vi.fn().mockResolvedValue(defaultChunks),
    multiQuerySearch: vi.fn().mockResolvedValue(defaultChunks),
  }));
}

export function mockEmbeddingService() {
  vi.mock("../../embeddings/embedding.service.js", () => ({
    generateEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
  }));
}

export function mockVectorRepository(chunks?: RetrievedChunk[]) {
  const defaultChunks = chunks ?? createMockChunks(3);
  vi.mock("../../vector/vector.repository.js", () => ({
    searchNearestChunks: vi.fn().mockResolvedValue(defaultChunks),
    insertChunkEmbedding: vi.fn().mockResolvedValue(undefined),
    insertBulkEmbeddings: vi.fn().mockResolvedValue(undefined),
  }));
}

export function mockContextBuilder() {
  vi.mock("../../rag/context-builder.js", () => ({
    buildContext: vi.fn().mockImplementation((chunks: any[]) => {
      if (!chunks || chunks.length === 0) {
        return "No relevant repository context found.";
      }
      return chunks
        .map((c: any) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`)
        .join("\n\n---\n\n");
    }),
  }));
}

export function expectValidPlanResult(result: any) {
  expect(result).toBeDefined();
  expect(result.question).toBeTypeOf("string");
  expect(result.task).toBeTypeOf("string");
  expect(result.confidence).toBeGreaterThanOrEqual(0);
  expect(result.confidence).toBeLessThanOrEqual(1);
  expect(result.needsRepositorySearch).toBeTypeOf("boolean");
}

export function expectValidReasoningResult(result: any) {
  expect(result).toBeDefined();
  expect(result.context).toBeTypeOf("string");
  expect(result.totalChunks).toBeTypeOf("number");
  expect(result.chainOfThought).toBeInstanceOf(Array);
  expect(result.patterns).toBeInstanceOf(Array);
  expect(result.dependencies).toBeInstanceOf(Array);
  expect(result.complexity).toBeDefined();
  expect(result.complexity.score).toBeGreaterThanOrEqual(0);
  expect(result.keyFiles).toBeInstanceOf(Array);
}

export const SAMPLE_CODE = {
  simpleFunction: `export function add(a: number, b: number): number {
  return a + b;
}`,
  complexClass: `export class AgentService {
  private agents: Map<string, Agent>;
  private cache: LRUCache;

  constructor(config: AgentConfig) {
    this.agents = new Map();
    this.cache = new LRUCache({ max: 100 });
  }

  async execute(agentId: string, input: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error("Agent not found");

    const cached = this.cache.get(input);
    if (cached) return cached;

    const result = await agent.run(input);
    this.cache.set(input, result);
    return result;
  }

  register(id: string, agent: Agent): void {
    this.agents.set(id, agent);
  }
}`,
  reactComponent: `import { useState, useEffect } from "react";

export function AgentPanel({ agentId }: { agentId: string }) {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (agentId) {
      fetchAgentStatus(agentId).then(setStatus);
    }
  }, [agentId]);

  return (
    <div className="agent-panel">
      <h2>{status}</h2>
      {result && <pre>{JSON.stringify(result)}</pre>}
    </div>
  );
}`,
  expressRoute: `import { Router, Request, Response } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.get("/agents", requireAuth, async (req: Request, res: Response) => {
  try {
    const agents = await getAgentDefinitions();
    res.json({ data: agents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

router.post("/execute", requireAuth, async (req: Request, res: Response) => {
  const { agentType, context, question } = req.body;
  if (!agentType || !question) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const result = await executeAgent(agentType, context, question);
  res.json({ data: { agentType, output: result } });
});

export default router;`,
  vulnerableCode: `export function queryUser(userId: string) {
  const sql = "SELECT * FROM users WHERE id = " + userId;
  return db.query(sql);
}

export function renderHtml(userInput: string) {
  document.getElementById("output").innerHTML = userInput;
}

const password = "admin123";
const apiKey = "sk-live-abc123def456";

export function runCommand(cmd: string) {
  eval(cmd);
}`,
};
