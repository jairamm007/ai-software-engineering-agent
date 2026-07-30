import api from "@/lib/axios";
import type {
  CodeGeneration,
  SavedPrompt,
  GenerationHistoryResponse,
  CodeGenerationType,
} from "@/types/code-generation";

export const generateCode = async (payload: {
  type: CodeGenerationType;
  prompt: string;
  repositoryId?: string;
  filePath?: string;
  inputCode?: string;
  inputLanguage?: string;
  targetLanguage?: string;
  model?: string;
}) => {
  const response = await api.post("/ai/generate", payload);
  return response.data.data as CodeGeneration;
};

export const refactorCode = async (payload: {
  inputCode?: string;
  prompt?: string;
  repositoryId?: string;
  filePath?: string;
}) => {
  const response = await api.post("/ai/refactor", payload);
  return response.data.data as CodeGeneration;
};

export const explainCode = async (payload: {
  inputCode?: string;
  prompt?: string;
  repositoryId?: string;
  filePath?: string;
}) => {
  const response = await api.post("/ai/explain", payload);
  return response.data.data as CodeGeneration;
};

export const translateCode = async (payload: {
  inputCode: string;
  targetLanguage: string;
  inputLanguage?: string;
  prompt?: string;
  repositoryId?: string;
  filePath?: string;
}) => {
  const response = await api.post("/ai/translate", payload);
  return response.data.data as CodeGeneration;
};

export const generateTests = async (payload: {
  inputCode?: string;
  prompt?: string;
  repositoryId?: string;
  filePath?: string;
}) => {
  const response = await api.post("/ai/tests", payload);
  return response.data.data as CodeGeneration;
};

export const generateDocumentation = async (payload: {
  inputCode?: string;
  prompt?: string;
  repositoryId?: string;
  filePath?: string;
}) => {
  const response = await api.post("/ai/documentation", payload);
  return response.data.data as CodeGeneration;
};

export const recordHistoryAction = async (payload: {
  generationId: string;
  action: "accepted" | "rejected" | "edited";
  editedCode?: string;
}) => {
  const response = await api.post("/ai/history/action", payload);
  return response.data.data;
};

export const applyGeneratedCode = async (payload: {
  generationId: string;
  repositoryId: string;
  filePath: string;
  code: string;
}): Promise<{ filePath: string }> => {
  const response = await api.post("/ai/apply", payload);
  return response.data.data;
};

export const getGenerationHistory = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<GenerationHistoryResponse> => {
  const response = await api.get("/ai/history", { params });
  return response.data.data;
};

export const getSavedPrompts = async (): Promise<SavedPrompt[]> => {
  const response = await api.get("/ai/prompts");
  return response.data.data;
};

export const createSavedPrompt = async (payload: {
  title: string;
  prompt: string;
  category?: string;
}): Promise<SavedPrompt> => {
  const response = await api.post("/ai/prompts", payload);
  return response.data.data;
};

export const deleteSavedPrompt = async (id: string): Promise<void> => {
  await api.delete(`/ai/prompts/${id}`);
};
