export type CodeGenerationType =
  | "generate"
  | "refactor"
  | "explain"
  | "translate"
  | "test"
  | "documentation"
  | "completion"
  | "function"
  | "class"
  | "crud"
  | "api"
  | "ui";

export interface CodeGeneration {
  id: string;
  userId: string;
  repositoryId?: string;
  type: CodeGenerationType;
  prompt: string;
  inputCode?: string;
  inputLanguage?: string;
  targetLanguage?: string;
  generatedCode: string;
  status: string;
  filePath?: string;
  model?: string;
  tokensUsed?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedPrompt {
  id: string;
  userId: string;
  title: string;
  icon: string;
  prompt: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationHistoryItem {
  id: string;
  userId: string;
  generationId: string;
  action: "accepted" | "rejected" | "edited";
  editedCode?: string;
  createdAt: Date;
}

export interface GenerationHistoryResponse {
  items: CodeGeneration[];
  total: number;
  page: number;
  limit: number;
}

export type GeneratorTab =
  | "generate"
  | "function"
  | "class"
  | "crud"
  | "api"
  | "ui"
  | "refactor"
  | "explain"
  | "translate"
  | "tests"
  | "docs"
  | "completion"
  | "prompts"
  | "history";
