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
});

const graph = new StateGraph(AgentState)

  // Planner
  .addNode("planner", async (state) => ({
    plan: await plannerAgent({
      question: state.question,
      repositoryId: state.repositoryId,
      filePath: state.filePath,
    }),
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
      state.plan,
      state.reasoning
    ),
  }))

  // Suggested Fix
  .addNode("fixAgent", async (state) => ({
    fixResult: await fixAgent(
      state.plan,
      state.reasoning
    ),
  }))

  // Commit Message
  .addNode("commitMessageAgent", async (state) => ({
    commitResult: await commitMessageAgent(
      state.plan,
      state.reasoning
    ),
  }))

  // Architecture
  .addNode("architectureAgent", async (state) => ({
    architecture: await architectureAgent(
      state.plan,
      state.reasoning.context
    ),
  }))

  // Documentation
  .addNode("documentationAgent", async (state) => ({
    documentation: await documentationAgent(
      state.plan,
      state.reasoning.context
    ),
  }))

  // Pull Request
  .addNode("pullRequestAgent", async (state) => ({
    pullRequest: await pullRequestAgent(
      state.plan,
      state.reasoning
    ),
  }))

  // Test Generator
  .addNode("testGeneratorAgent", async (state) => ({
    testResult: await testGeneratorAgent(
      state.plan,
      state.reasoning
    ),
  }))

  // Security Scanner
  .addNode("securityAgent", async (state) => ({
    securityResult: await securityAgent(
      state.plan,
      state.reasoning
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
