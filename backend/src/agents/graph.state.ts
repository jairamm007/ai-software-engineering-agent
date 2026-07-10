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
import { architectureAgent } from "./architecture.agent.js";

const AgentState = Annotation.Root({
  question: Annotation<string>(),
  plan: Annotation<any>(),
  chunks: Annotation<any[]>(),
  reasoning: Annotation<any>(),

  answer: Annotation<string>(),
  reviewResult: Annotation<any>(),
  architecture: Annotation<string>(),
});

const graph = new StateGraph(AgentState)

  // Planner
  .addNode("planner", async (state) => ({
    plan: await plannerAgent(state.question),
  }))

  // Retriever
  .addNode("retriever", async (state) => ({
    chunks: await retrieverAgent(state.plan),
  }))

  // Reasoner
  .addNode("reasoner", async (state) => ({
    reasoning: await reasonerAgent(state.chunks),
  }))

  // Code Review
  .addNode("codeReview", async (state) => ({
    reviewResult: await codeReviewAgent(
      state.reasoning
    ),
  }))

  // Architecture
  .addNode("architectureAgent", async (state) => ({
    architecture: await architectureAgent(
      state.reasoning.context
    ),
  }))

  // Normal QA
  .addNode("answerAgent", async (state) => ({
    answer: await answerAgent(
      state.plan,
      state.reasoning
    ),
  }))

  // Graph

  .addEdge(START, "planner")

  .addEdge("planner", "retriever")

  .addEdge("retriever", "reasoner")

  .addConditionalEdges(
    "reasoner",
    (state) => {
      switch (state.plan.task) {
        case "review":
          return "codeReview";

        case "architecture":
          return "architectureAgent";

        default:
          return "answerAgent";
      }
    },
    {
      codeReview: "codeReview",
      architectureAgent: "architectureAgent",
      answerAgent: "answerAgent",
    }
  )

  .addEdge("codeReview", END)

  .addEdge("architectureAgent", END)

  .addEdge("answerAgent", END);

export const agentGraph = graph.compile();