import {
  Annotation,
  END,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { plannerAgent } from "./planner.agent.js";
import { retrieverAgent } from "./retriever.agent.js";
import { reasonerAgent } from "./reasoner.agent.js";
import { answerAgent } from "./answer.agent.js";
import { codeReviewAgent } from "./code-review.agent.js";
import { fixAgent } from "./fix.agent.js";
import { commitMessageAgent } from "./commit-message.agent.js";
import { architectureAgent } from "./architecture.agent.js";
import { documentationAgent } from "./documentation.agent.js";
import { pullRequestAgent } from "./pull-request.agent.js";
import { testGeneratorAgent } from "./test-generator.agent.js";
import { securityAgent } from "./security.agent.js";

const AgentState = Annotation.Root({
  question: Annotation<string>(),
  repositoryId: Annotation<string | undefined>(),
  filePath: Annotation<string | undefined>(),
  useLLMPlanning: Annotation<boolean>(),
  plan: Annotation<any>(),
  chunks: Annotation<any[]>(),
  reasoning: Annotation<any>(),

  answer: Annotation<string>(),
  reviewResult: Annotation<any>(),
  fixResult: Annotation<string>(),
  commitResult: Annotation<string>(),
  architecture: Annotation<string>(),
  documentation: Annotation<string>(),
  pullRequest: Annotation<string>(),
  testResult: Annotation<string>(),
  securityResult: Annotation<string>(),

  executionTrace: Annotation<string[]>(),
  agentTimings: Annotation<Record<string, number>>(),
});

const timedNode = <T extends Record<string, unknown>>(
  name: string,
  fn: (state: any) => Promise<T>
): ((state: any) => Promise<T & { executionTrace: string[]; agentTimings: Record<string, number> }>) => {
  return async (state) => {
    const start = Date.now();
    const result = await fn(state);
    const duration = Date.now() - start;
    return {
      ...result,
      executionTrace: [...(state.executionTrace ?? []), `${name}:${duration}ms`],
      agentTimings: { ...(state.agentTimings ?? {}), [name]: duration },
    };
  };
};

const graph = new StateGraph(AgentState)

  .addNode("planner", timedNode("planner", async (state) => ({
    plan: await plannerAgent({
      question: state.question,
      repositoryId: state.repositoryId,
      filePath: state.filePath,
      useLLM: state.useLLMPlanning,
    }),
  })))

  .addNode("retriever", timedNode("retriever", async (state) => {
    const retrievalResult = await retrieverAgent(state.plan);
    return { chunks: retrievalResult.chunks };
  }))

  .addNode("reasoner", timedNode("reasoner", async (state) => ({
    reasoning: await reasonerAgent(state.chunks),
  })))

  .addNode("codeReview", timedNode("codeReview", async (state) => ({
    reviewResult: await codeReviewAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("fixAgent", timedNode("fixAgent", async (state) => ({
    fixResult: await fixAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("commitMessageAgent", timedNode("commitMessageAgent", async (state) => ({
    commitResult: await commitMessageAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("architectureAgent", timedNode("architectureAgent", async (state) => ({
    architecture: await architectureAgent(
      state.plan,
      state.reasoning.context
    ),
  })))

  .addNode("documentationAgent", timedNode("documentationAgent", async (state) => ({
    documentation: await documentationAgent(
      state.plan,
      state.reasoning.context
    ),
  })))

  .addNode("pullRequestAgent", timedNode("pullRequestAgent", async (state) => ({
    pullRequest: await pullRequestAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("testGeneratorAgent", timedNode("testGeneratorAgent", async (state) => ({
    testResult: await testGeneratorAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("securityAgent", timedNode("securityAgent", async (state) => ({
    securityResult: await securityAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addNode("answerAgent", timedNode("answerAgent", async (state) => ({
    answer: await answerAgent(
      state.plan,
      state.reasoning
    ),
  })))

  .addEdge(START, "planner")

  .addEdge("planner", "retriever")

  .addEdge("retriever", "reasoner")

  .addConditionalEdges(
    "reasoner",
    (state) => {
      switch (state.plan.task) {
        case "review":
          return "codeReview";

        case "fix":
          return "fixAgent";

        case "commit":
          return "commitMessageAgent";

        case "architecture":
          return "architectureAgent";

        case "documentation":
          return "documentationAgent";

        case "pullRequest":
          return "pullRequestAgent";

        case "test":
          return "testGeneratorAgent";

        case "security":
          return "securityAgent";

        default:
          return "answerAgent";
      }
    },
    {
      codeReview: "codeReview",
      fixAgent: "fixAgent",
      commitMessageAgent: "commitMessageAgent",
      architectureAgent: "architectureAgent",
      documentationAgent: "documentationAgent",
      pullRequestAgent: "pullRequestAgent",
      testGeneratorAgent: "testGeneratorAgent",
      securityAgent: "securityAgent",
      answerAgent: "answerAgent",
    }
  )

  .addEdge("codeReview", END)

  .addEdge("fixAgent", END)

  .addEdge("commitMessageAgent", END)

  .addEdge("architectureAgent", END)

  .addEdge("documentationAgent", END)

  .addEdge("pullRequestAgent", END)

  .addEdge("testGeneratorAgent", END)

  .addEdge("securityAgent", END)

  .addEdge("answerAgent", END);

export const agentGraph = graph.compile();
