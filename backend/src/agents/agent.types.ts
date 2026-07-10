export type AgentType =
  | "answer"
  | "review"
  | "architecture";

export interface AgentDefinition {
  name: AgentType;

  systemPrompt: string;
}