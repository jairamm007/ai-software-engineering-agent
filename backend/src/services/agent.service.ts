import { agentGraph } from "../agents/graph.state.js";

export const executeAgent = async (
  question: string
) => {
  return agentGraph.invoke({
    question,
  });
};