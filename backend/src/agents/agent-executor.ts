import { generateText } from "../ai/providers/llm.service.js";

import { AGENTS } from "./prompts.js";

import {
  AgentType,
} from "./agent.types.js";
import { AgentMemory } from "./agent-memory.js";

const MAX_CONTEXT_CHARS = 60_000;

const truncateContext = (context: string): string => {
  if (context.length <= MAX_CONTEXT_CHARS) {
    return context;
  }

  return (
    context.slice(0, MAX_CONTEXT_CHARS) +
    "\n\n... [Context truncated for optimal processing] ..."
  );
};

export interface AgentExecutionResult {
  output: string;
  selfEvaluation: {
    confidence: number;
    quality: "low" | "medium" | "high";
    completeness: number;
    notes: string;
  };
  toolUsage: string[];
}

const SELF_EVALUATION_PROMPT = `After generating your response, evaluate its quality. Add a self-evaluation block at the end:

---SELF_EVAL---
Confidence: <0.0-1.0>
Quality: <low|medium|high>
Completeness: <0-100>%
Notes: <brief notes about the evaluation>
---END_EVAL---

Be honest in your self-evaluation. This helps improve the system.`;

function parseSelfEvaluation(output: string): AgentExecutionResult["selfEvaluation"] {
  const evalMatch = output.match(/---SELF_EVAL---([\s\S]*?)---END_EVAL---/);

  if (!evalMatch) {
    return {
      confidence: 0.7,
      quality: "medium",
      completeness: 75,
      notes: "No self-evaluation provided",
    };
  }

  const evalBlock = evalMatch[1];

  const confidenceMatch = evalBlock.match(/Confidence:\s*([\d.]+)/);
  const qualityMatch = evalBlock.match(/Quality:\s*(low|medium|high)/i);
  const completenessMatch = evalBlock.match(/Completeness:\s*(\d+)/);
  const notesMatch = evalBlock.match(/Notes:\s*(.+)/);

  return {
    confidence: confidenceMatch ? Math.min(Math.max(parseFloat(confidenceMatch[1]), 0), 1) : 0.7,
    quality: (qualityMatch?.[1]?.toLowerCase() as "low" | "medium" | "high") ?? "medium",
    completeness: completenessMatch ? Math.min(parseInt(completenessMatch[1], 10), 100) : 75,
    notes: notesMatch?.[1]?.trim() ?? "Evaluation parsed from output",
  };
}

export const executeAgent = async (
  type: AgentType,
  context: string,
  question: string,
  memory?: AgentMemory
): Promise<string> => {
  const agent = AGENTS[type];

  const truncatedContext = truncateContext(context);

  let memoryContext = "";
  if (memory) {
    const memInsights = memory.getInsights();
    if (memInsights.length > 0) {
      memoryContext = `\n\nPrevious Agent Insights:\n${memInsights.map((i) => `- [${i.agent}/${i.type}] ${i.content}`).join("\n")}`;
    }

    const patterns = memory.getShared<string[]>("detectedPatterns");
    if (patterns && patterns.length > 0) {
      memoryContext += `\n\nDetected Patterns: ${patterns.join(", ")}`;
    }

    const complexity = memory.getShared<{ level: string }>("complexity");
    if (complexity) {
      memoryContext += `\nCode Complexity: ${complexity.level}`;
    }
  }

  const userPrompt = `${agent.userContextPrefix ? agent.userContextPrefix + "\n\n" : ""}Repository Context:\n\n${truncatedContext}${memoryContext}\n\n---\n\nTask: ${question}\n\n${SELF_EVALUATION_PROMPT}`;

  const output = await generateText(agent.systemPrompt, userPrompt);

  const cleanedOutput = output.replace(
    /---SELF_EVAL---[\s\S]*?---END_EVAL---/g,
    ""
  ).trim();

  if (memory) {
    memory.recordExecution(type);
    const evaluation = parseSelfEvaluation(output);

    memory.addInsight({
      agent: type,
      type: "finding",
      content: `Agent completed with ${evaluation.quality} quality and ${(evaluation.confidence * 100).toFixed(0)}% confidence`,
      severity: evaluation.confidence < 0.5 ? "medium" : "info",
    });

    memory.setMetrics(type, {
      executionTimeMs: 0,
      tokensProcessed: cleanedOutput.length,
      confidence: evaluation.confidence,
      coverageScore: evaluation.completeness,
    });
  }

  return cleanedOutput;
};

export const executeAgentWithEvaluation = async (
  type: AgentType,
  context: string,
  question: string,
  memory?: AgentMemory
): Promise<AgentExecutionResult> => {
  const agent = AGENTS[type];

  const truncatedContext = truncateContext(context);

  let memoryContext = "";
  if (memory) {
    const memInsights = memory.getInsights();
    if (memInsights.length > 0) {
      memoryContext = `\n\nPrevious Agent Insights:\n${memInsights.map((i) => `- [${i.agent}/${i.type}] ${i.content}`).join("\n")}`;
    }
  }

  const userPrompt = `${agent.userContextPrefix ? agent.userContextPrefix + "\n\n" : ""}Repository Context:\n\n${truncatedContext}${memoryContext}\n\n---\n\nTask: ${question}\n\n${SELF_EVALUATION_PROMPT}`;

  const output = await generateText(agent.systemPrompt, userPrompt);

  const cleanedOutput = output.replace(
    /---SELF_EVAL---[\s\S]*?---END_EVAL---/g,
    ""
  ).trim();

  const selfEvaluation = parseSelfEvaluation(output);

  if (memory) {
    memory.recordExecution(type);
    memory.addInsight({
      agent: type,
      type: "finding",
      content: `Self-evaluation: ${selfEvaluation.quality} quality, ${(selfEvaluation.confidence * 100).toFixed(0)}% confidence, ${selfEvaluation.completeness}% complete`,
      severity: selfEvaluation.confidence < 0.5 ? "medium" : "info",
    });
    memory.setMetrics(type, {
      executionTimeMs: 0,
      tokensProcessed: cleanedOutput.length,
      confidence: selfEvaluation.confidence,
      coverageScore: selfEvaluation.completeness,
    });
  }

  return {
    output: cleanedOutput,
    selfEvaluation,
    toolUsage: [],
  };
};
