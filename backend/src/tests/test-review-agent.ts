import "dotenv/config";

import { agentGraph } from "../agents/graph.state.js";

async function main() {
  const result = await agentGraph.invoke({
    question: "Review this repository",
  });

  console.log(result.reviewResult);
}

main().catch(console.error);