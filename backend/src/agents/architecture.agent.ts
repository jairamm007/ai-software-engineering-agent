import { executeAgent } from "./agent-executor.js";

export const architectureAgent = async (
  context: string
) => {
  return executeAgent(
    "architecture",
    context,
    "Explain the repository architecture."
  );
};