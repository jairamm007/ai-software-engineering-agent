import { RetrievedChunk } from "../vector/vector.repository.js";
import { PlanResult } from "./planner.agent.js";
import { ReasoningResult } from "./reasoner.agent.js";

export interface AgentInsight {
  agent: string;
  type: "finding" | "recommendation" | "warning" | "metric" | "pattern";
  content: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  fileRef?: string;
  timestamp: number;
}

export interface AgentMetrics {
  executionTimeMs: number;
  tokensProcessed: number;
  confidence: number;
  coverageScore: number;
}

export interface AgentMemoryState {
  sessionId: string;
  question: string;
  plan: PlanResult | null;
  chunks: RetrievedChunk[];
  reasoning: ReasoningResult | null;
  insights: AgentInsight[];
  metrics: Map<string, AgentMetrics>;
  sharedContext: Map<string, unknown>;
  createdFromAgent?: string;
  executionHistory: string[];
}

type MemoryListener = (state: AgentMemoryState) => void;

export class AgentMemory {
  private state: AgentMemoryState;
  private listeners: Set<MemoryListener>;
  private static instances = new Map<string, AgentMemory>();

  constructor(sessionId: string, question: string) {
    this.state = {
      sessionId,
      question,
      plan: null,
      chunks: [],
      reasoning: null,
      insights: [],
      metrics: new Map(),
      sharedContext: new Map(),
      executionHistory: [],
    };
    this.listeners = new Set();
    AgentMemory.instances.set(sessionId, this);
  }

  static getInstance(sessionId: string): AgentMemory | undefined {
    return AgentMemory.instances.get(sessionId);
  }

  static create(sessionId: string, question: string): AgentMemory {
    const existing = AgentMemory.instances.get(sessionId);
    if (existing) return existing;
    return new AgentMemory(sessionId, question);
  }

  static cleanup(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    for (const [id, mem] of AgentMemory.instances) {
      if (now - mem.state.insights[0]?.timestamp! > maxAge) {
        AgentMemory.instances.delete(id);
      }
    }
  }

  getState(): Readonly<AgentMemoryState> {
    return this.state;
  }

  setPlan(plan: PlanResult): void {
    this.state.plan = plan;
    this.notify();
  }

  setChunks(chunks: RetrievedChunk[]): void {
    this.state.chunks = chunks;
    this.notify();
  }

  setReasoning(reasoning: ReasoningResult): void {
    this.state.reasoning = reasoning;
    this.notify();
  }

  addInsight(insight: Omit<AgentInsight, "timestamp">): void {
    this.state.insights.push({ ...insight, timestamp: Date.now() });
    this.notify();
  }

  getInsights(agent?: string): AgentInsight[] {
    if (!agent) return [...this.state.insights];
    return this.state.insights.filter((i) => i.agent === agent);
  }

  getInsightsBySeverity(severity: AgentInsight["severity"]): AgentInsight[] {
    return this.state.insights.filter((i) => i.severity === severity);
  }

  setMetrics(agent: string, metrics: AgentMetrics): void {
    this.state.metrics.set(agent, metrics);
    this.notify();
  }

  getMetrics(agent: string): AgentMetrics | undefined {
    return this.state.metrics.get(agent);
  }

  getAllMetrics(): Map<string, AgentMetrics> {
    return new Map(this.state.metrics);
  }

  setShared<T>(key: string, value: T): void {
    this.state.sharedContext.set(key, value);
    this.notify();
  }

  getShared<T>(key: string): T | undefined {
    return this.state.sharedContext.get(key) as T | undefined;
  }

  recordExecution(agentName: string): void {
    this.state.executionHistory.push(agentName);
  }

  getExecutionOrder(): string[] {
    return [...this.state.executionHistory];
  }

  subscribe(listener: MemoryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  clear(): void {
    this.state.insights = [];
    this.state.metrics.clear();
    this.state.sharedContext.clear();
    this.state.executionHistory = [];
    this.notify();
  }

  destroy(): void {
    this.listeners.clear();
    AgentMemory.instances.delete(this.state.sessionId);
  }

  toContextString(): string {
    const lines: string[] = [];
    lines.push(`Session: ${this.state.sessionId}`);
    lines.push(`Question: ${this.state.question}`);

    if (this.state.plan) {
      lines.push(`Task: ${this.state.plan.task} (confidence: ${(this.state.plan.confidence * 100).toFixed(0)}%)`);
    }

    if (this.state.insights.length > 0) {
      lines.push(`\nInsights (${this.state.insights.length}):`);
      for (const insight of this.state.insights) {
        const icon = insight.type === "finding" ? "🔍" :
          insight.type === "recommendation" ? "💡" :
            insight.type === "warning" ? "⚠️" :
              insight.type === "metric" ? "📊" : "🔗";
        lines.push(`  ${icon} [${insight.severity}] ${insight.agent}: ${insight.content}`);
      }
    }

    if (this.state.metrics.size > 0) {
      lines.push(`\nMetrics:`);
      for (const [agent, m] of this.state.metrics) {
        lines.push(`  ${agent}: ${m.executionTimeMs}ms, confidence: ${(m.confidence * 100).toFixed(0)}%`);
      }
    }

    return lines.join("\n");
  }
}
