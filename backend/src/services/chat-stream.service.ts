import { generateTextStream } from "../ai/providers/llm.service.js";
import { agentGraph } from "../agents/graph.state.js";
import { AGENTS } from "../agents/prompts.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import type { AgentType } from "../agents/agent.types.js";

const MAX_CONTEXT_CHARS = 100_000;

const truncateContext = (context: string): string => {
  if (context.length <= MAX_CONTEXT_CHARS) return context;
  return context.slice(0, MAX_CONTEXT_CHARS) + "\n\n... [Context truncated] ...";
};

const RESULT_FIELDS = [
  "answer", "reviewResult", "fixResult", "commitResult",
  "architecture", "documentation", "pullRequest", "testResult", "securityResult",
] as const;

const TYPE_MAP: Record<string, string> = {
  answer: "answer", reviewResult: "review", fixResult: "fix",
  commitResult: "commit", architecture: "architecture", documentation: "documentation",
  pullRequest: "pullRequest", testResult: "test", securityResult: "security",
};

export interface StreamChatInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
  history?: { role: string; content: string }[];
  userId?: string;
  signal?: AbortSignal;
}

/**
 * Runs the agent graph to get context, then streams the LLM response.
 * Yields { token, type, source } objects.
 */
export async function* streamRepositoryChat(input: StreamChatInput) {
  // Step 1: Run the agent graph to get retrieved context (non-streaming)
  const result = await agentGraph.invoke({
    question: input.question,
    repositoryId: input.repositoryId,
    filePath: input.filePath,
  });

  // Determine the agent type from the graph result
  let agentType: AgentType = "answer";
  let source = null;

  for (const field of RESULT_FIELDS) {
    if (result[field]) {
      agentType = TYPE_MAP[field] as AgentType;
      const firstChunk = result.chunks?.[0];
      if (firstChunk) {
        source = {
          filePath: firstChunk.filePath,
          startLine: firstChunk.startLine,
          endLine: firstChunk.endLine,
          confidence: Math.round((1 - firstChunk.distance) * 100),
        };
      }
      break;
    }
  }

  // Step 2: Build context from retrieved chunks
  const context = result.chunks
    ?.map((c: any) => `[${c.filePath}:${c.startLine}-${c.endLine}]\n${c.content}`)
    .join("\n\n") ?? "";

  // Step 3: Build prompt with conversation history
  const agent = AGENTS[agentType] || AGENTS.answer;
  const truncatedContext = truncateContext(context);

  let historyBlock = "";
  if (input.history && input.history.length > 0) {
    historyBlock = "\n\nConversation History:\n" +
      input.history.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  }

  const userPrompt = `Repository Context:\n\n${truncatedContext}${historyBlock}\n\nQuestion: ${input.question}`;

  // Step 4: Look up user's preferred model
  let preferredModel: string | undefined;
  if (input.userId) {
    try {
      const prefs = await getPreferences(input.userId);
      preferredModel = prefs.defaultModel;
    } catch {
      // Ignore preference lookup errors, use default provider order
    }
  }

  // Step 5: Stream the response
  const stream = generateTextStream(agent.systemPrompt, userPrompt, preferredModel, input.signal);

  for await (const token of stream) {
    yield { token, type: agentType, source };
  }
}
