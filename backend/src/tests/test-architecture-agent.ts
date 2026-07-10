import "dotenv/config";

import { agentGraph } from "../agents/graph.state.js";

async function main() {
  const result = await agentGraph.invoke({
    question: "Explain the architecture of this repository",
  });

  console.log(result.architecture);
}

main().catch(console.error);