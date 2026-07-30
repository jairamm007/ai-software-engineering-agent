import { generateText } from "../ai/providers/llm.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import { getPreferences } from "../repository/user-preference.repository.js";
import type { CreateCodeGenerationInput } from "../repository/code-generation.repository.js";
import {
  createCodeGeneration,
  updateCodeGeneration,
} from "../repository/code-generation.repository.js";

const MAX_CONTEXT_CHARS = 60_000;

const SYSTEM_PROMPTS: Record<string, string> = {
  generate: `You are an expert software engineer. Generate clean, production-ready code based on the user's request and repository context.

RULES:
- Always use the repository's existing language, framework, and patterns
- Include complete, runnable code (not partial snippets)
- Follow the project's coding style and naming conventions
- Include error handling and edge cases
- Use TypeScript if the project uses it
- Output code blocks with the appropriate language tag
- If a specific file path is provided, include the full file path in your response
- Output format: Provide a brief explanation followed by the code block`,

  refactor: `You are a principal engineer. Refactor the provided code to improve quality while preserving all original behavior.

FOCUS AREAS:
1. SOLID principles
2. Remove duplication
3. Improve readability
4. Better variable and function naming
5. Error handling improvements
6. Performance optimizations
7. Reduce complexity

RULES:
- Preserve ALL original functionality
- Show the complete refactored file
- After the code, list key changes made and why
- Keep the same public API if applicable`,

  explain: `You are a senior engineer explaining code to a colleague.

FORMAT:
## Overview
(2-3 sentence summary)

## How It Works
(Step-by-step explanation)

## Key Functions
- \`functionName\`: What it does (line references if available)

## Dependencies
(What it imports/depends on)

## Time Complexity
(Big-O analysis)

## Space Complexity
(Big-O analysis)

## Design Patterns
(Any patterns used)

## Potential Issues
(Any concerns or bugs)

## Suggestions
(Improvements)

RULES:
- Be clear and concise
- Use code references if available
- Max 1000 words`,

  translate: `You are a polyglot software engineer. Translate code from one language/framework to another while preserving all functionality.

RULES:
- Preserve ALL original logic and behavior
- Follow TARGET language idioms and conventions
- Use standard libraries of the target language
- Maintain equivalent error handling
- Keep naming conventions appropriate for the target language
- Output the complete translated code
- Add a brief note about language-specific choices made`,

  test: `You are a QA automation engineer. Generate comprehensive tests for the provided code.

GENERATE:
- Unit tests for all functions/methods
- Edge case tests
- Mock data where needed
- Follow the project's test framework conventions
- Include test descriptions/names

RULES:
- Cover happy paths, error cases, and edge cases
- Use appropriate assertion libraries
- Keep tests isolated and deterministic
- Max 1500 words`,

  documentation: `You are a technical writer. Generate documentation for the provided code.

GENERATE:
- Module/file description
- Function/class documentation
- Parameter descriptions with types
- Return value descriptions
- Usage examples
- Error handling notes

RULES:
- Use JSDoc/TSDoc or project doc style
- Be comprehensive but concise
- Include examples for complex functions
- Markdown format`,

  completion: `You are an inline code completion engine. Continue the code at the cursor.

RULES:
- Return only the code that should be inserted after the cursor
- Do not repeat the provided code
- Match the existing language, formatting, and naming conventions
- Keep the completion concise and syntactically valid`,

  function: `You are an expert software engineer. Generate a focused, production-ready function based on the user's request.

RULES:
- Generate a single function with clear inputs, outputs, and error handling
- Include TypeScript type annotations if the project uses TypeScript
- Add JSDoc/TSDoc documenting parameters, return value, and edge cases
- Handle null/undefined/invalid inputs gracefully
- Follow the project's existing coding style and naming conventions
- Output the complete function in a code block with the appropriate language tag`,

  class: `You are an expert software engineer. Generate a complete class with methods, properties, and proper encapsulation.

RULES:
- Generate a full class/interface with all necessary methods and properties
- Use proper access modifiers (public, private, protected) where applicable
- Include constructor, getters/setters if needed
- Follow SOLID principles
- Add TSDoc/JSDoc comments for the class and all public methods
- Type all parameters and return values
- Include error handling in methods
- Output the complete class in a code block`,

  crud: `You are a backend engineer. Generate a complete CRUD module for the given entity.

GENERATE ALL OF THE FOLLOWING:
1. Model/Schema definition (Prisma, Mongoose, or equivalent based on project)
2. Validation schema (Zod, Joi, or equivalent)
3. Service layer with business logic
4. Controller with request handling
5. Routes with proper HTTP methods and status codes

RULES:
- Follow the project's existing patterns and framework
- Use the same ORM/ODM as the project
- Include proper HTTP status codes (201 for create, 200 for others)
- Add proper error handling and validation
- Include pagination for list endpoints
- Output each section with a clear heading and code block`,

  api: `You are a backend engineer. Generate a REST API endpoint or set of endpoints.

GENERATE:
- Route definitions with HTTP methods and paths
- Request validation (Zod, Joi, or equivalent)
- Controller/handler functions
- Response formatting
- Error handling

RULES:
- Follow REST conventions for naming and HTTP methods
- Include proper HTTP status codes
- Add validation for request body, query params, and path params
- Follow the project's existing patterns and framework
- Output each section with a clear heading and code block`,

  ui: `You are a frontend engineer. Generate a responsive React component using the project's UI conventions.

RULES:
- Use React with TypeScript
- Follow the project's existing styling approach (Tailwind, CSS modules, etc.)
- Make components responsive and accessible (ARIA attributes, keyboard navigation)
- Handle loading, empty, error, and edge case states
- Use existing UI components from the project if applicable
- Include proper TypeScript props interface
- Output the complete component in a code block`,
};


function buildPrompts(
  type: string,
  userPrompt: string,
  context: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.generate;

  let userContent = "";

  if (context && context !== "No relevant repository context found. Generate based on your best practices.") {
    userContent += `Repository Context:\n${context}\n\n---\n\n`;
  }

  if (type === "translate") {
    userContent += `Task: ${userPrompt}\n\nProvide ONLY the translated code in a code block. Do not include explanations outside the code block.`;
  } else if (type === "documentation") {
    userContent += `Task: ${userPrompt}\n\nGenerate documentation in Markdown format.`;
  } else if (type === "test") {
    userContent += `Task: ${userPrompt}\n\nGenerate comprehensive test cases.`;
  } else if (type === "explain") {
    userContent += `Task: ${userPrompt}\n\nProvide a detailed explanation.`;
  } else if (type === "refactor") {
    userContent += `Task: ${userPrompt}\n\nProvide the complete refactored code and explain key changes.`;
  } else if (type === "completion") {
    userContent += `Code before cursor:\n${userPrompt}\n\nReturn only the completion to insert.`;
  } else if (type === "function") {
    userContent += `Task: ${userPrompt}\n\nGenerate a complete, production-ready function with TypeScript types and JSDoc.`;
  } else if (type === "class") {
    userContent += `Task: ${userPrompt}\n\nGenerate a complete class with all methods, properties, and proper encapsulation.`;
  } else if (type === "crud") {
    userContent += `Task: ${userPrompt}\n\nGenerate the complete CRUD module including model, validation, service, controller, and routes.`;
  } else if (type === "api") {
    userContent += `Task: ${userPrompt}\n\nGenerate the REST API endpoint(s) with validation, controller, and routes.`;
  } else if (type === "ui") {
    userContent += `Task: ${userPrompt}\n\nGenerate a complete React component following the project's UI conventions.`;
  } else {
    userContent += `Task: ${userPrompt}\n\nGenerate complete, production-ready code.`;
  }

  return { systemPrompt, userPrompt: userContent };
}

export const generateCode = async (
  input: CreateCodeGenerationInput
) => {
  const record = await createCodeGeneration(input);

  try {
    let context = "No relevant repository context found. Generate based on your best practices.";

    if (input.repositoryId) {
      try {
        const repo = await getRepositoryById(input.repositoryId, input.userId);
        if (repo?.files?.length) {
          const allChunks: any[] = [];
          let totalChars = 0;

          for (const file of repo.files) {
            for (const chunk of file.chunks ?? []) {
              const chunkText = `[${file.path}:L${chunk.startLine}-${chunk.endLine}]\n${chunk.content}`;
              if (totalChars + chunkText.length > MAX_CONTEXT_CHARS) break;
              totalChars += chunkText.length;
              allChunks.push({
                ...chunk,
                filePath: file.path,
              });
            }
            if (totalChars >= MAX_CONTEXT_CHARS) break;
          }

          if (allChunks.length > 0) {
            context = allChunks
              .map((c) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`)
              .join("\n\n---\n\n");
          }

          if (input.filePath) {
            const fileChunks = allChunks.filter((c) => c.filePath === input.filePath);
            if (fileChunks.length > 0) {
              context =
                fileChunks
                  .map((c) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`)
                  .join("\n\n---\n\n") +
                "\n\n[Other repository files for context]\n" +
                allChunks
                  .filter((c) => c.filePath !== input.filePath)
                  .slice(0, 10)
                  .map((c) => `[${c.filePath}:L${c.startLine}-${c.endLine}]\n${c.content}`)
                  .join("\n\n---\n\n");
            }
          }
        }
      } catch {
        // ignore context retrieval errors
      }
    }

    let preferredModel: string | undefined;
    try {
      const prefs = await getPreferences(input.userId);
      preferredModel = prefs.defaultModel;
    } catch {
      // use default model
    }

    const { systemPrompt, userPrompt } = buildPrompts(input.type, input.prompt, context);

    const generatedCode = await generateText(systemPrompt, userPrompt, preferredModel);

    await updateCodeGeneration(record.id, {
      generatedCode,
      status: "completed",
      model: preferredModel ?? "default",
      updatedAt: new Date(),
    });

    return { ...record, generatedCode, status: "completed" };
  } catch (error) {
    await updateCodeGeneration(record.id, {
      status: "failed",
      updatedAt: new Date(),
    });
    throw error;
  }
};