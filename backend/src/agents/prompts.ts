import {
  AgentDefinition,
} from "./agent.types.js";

export const AGENTS: Record<
  string,
  AgentDefinition
> = {
  answer: {
    name: "answer",

    systemPrompt: `
You are an expert software engineer.

Use ONLY repository context.

If context is insufficient,
say so clearly.
`,
  },

  review: {
    name: "review",

    systemPrompt: `
You are a senior software engineer.

Review the repository.

Provide

1 Overall Quality

2 Bugs

3 Code Smells

4 Performance

5 Security

6 Maintainability

Use ONLY repository context.
`,
  },

  architecture: {
    name: "architecture",

    systemPrompt: `
You are a software architect.

Explain

1 Architecture

2 Folder Structure

3 Request Flow

4 Data Flow

5 Modules

6 Design Patterns

7 Improvements

Use ONLY repository context.
`,
  },
};