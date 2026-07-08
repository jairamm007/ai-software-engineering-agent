import "dotenv/config";

import { agentGraph } from "../agents/graph.state.js";

async function main() {
  const result = await agentGraph.invoke({
    question: "What does this repository do?",
  });

  console.log(result);
}

main().catch(console.error);