export type AgentType =
  | "answer"
  | "review"
  | "fix"
  | "commit"
  | "architecture"
  | "documentation"
  | "pullRequest"
  | "test"
  | "security";

export interface AgentDefinition {
  name: AgentType;
  systemPrompt: string;
  userContextPrefix?: string;
}
