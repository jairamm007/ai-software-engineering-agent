export type AgentType =
  | "answer"
  | "review"
  | "fix"
  | "architecture"
  | "documentation";

export interface AgentDefinition {
  name: AgentType;

  systemPrompt: string;
}
