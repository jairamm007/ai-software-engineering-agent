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

const AgentState = Annotation.Root({
  question: Annotation<string>(),
  plan: Annotation<any>(),
  chunks: Annotation<any[]>(),
  reasoning: Annotation<any>(),
  answer: Annotation<string>(),
  reviewResult: Annotation<any>(),
});

const graph = new StateGraph(AgentState)

  .addNode("planner", async (state) => ({
    plan: await plannerAgent(state.question),
  }))

  .addNode("retriever", async (state) => ({
    chunks: await retrieverAgent(state.plan),
  }))

  .addNode("reasoner", async (state) => ({
    reasoning: await reasonerAgent(state.chunks),
  }))

  // Node name is different from state key
  .addNode("codeReview", async (state) => ({
    reviewResult: await codeReviewAgent(state.reasoning),
  }))

  .addNode("answerAgent", async (state) => ({
    answer: await answerAgent(
      state.plan,
      state.reasoning
    ),
  }))

  .addEdge(START, "planner")
  .addEdge("planner", "retriever")
  .addEdge("retriever", "reasoner")

  .addConditionalEdges(
    "reasoner",
    (state) => {
      return state.plan.task === "review"
        ? "codeReview"
        : "answerAgent";
    },
    {
      codeReview: "codeReview",
      answerAgent: "answerAgent",
    }
  )

  .addEdge("codeReview", END)
  .addEdge("answerAgent", END);

export const agentGraph = graph.compile();