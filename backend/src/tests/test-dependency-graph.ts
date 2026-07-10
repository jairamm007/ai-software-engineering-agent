import {
  DependencyGraph,
} from "../graph/dependency-graph.js";

const graph =
  new DependencyGraph();

graph.addNode(
  "controller.ts",
  [
    "service.ts",
    "utils.ts",
  ]
);

graph.addNode(
  "service.ts",
  [
    "repository.ts",
  ]
);

console.log(
  graph.getGraph()
);