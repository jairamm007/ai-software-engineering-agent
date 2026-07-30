import { generateCode } from "../services/code-generation.service.js";
import {
  getCodeGenerations,
  getCodeGenerationById,
} from "../repository/code-generation.repository.js";
import {
  getSavedPrompts,
  createSavedPrompt,
  deleteSavedPrompt,
} from "../repository/code-generation.repository.js";
import {
  createGenerationHistory,
} from "../repository/code-generation.repository.js";
import {
  getRepositoryById,
} from "../repository/repository.repository.js";
import {
  codeGenerationSchema,
  savePromptSchema,
  generationHistoryQuerySchema,
  applyGeneratedCodeSchema,
} from "../validators/code-generation.validator.js";
import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const parseZodMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "issues" in err) {
    const zodErr = err as { issues: Array<{ message: string }> };
    return zodErr.issues.map((i) => i.message).join(", ");
  }
  if (err instanceof Error) return err.message;
  return "Invalid request";
};

export const generateCodeController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const parsed = codeGenerationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    const body = parsed.data;

    if (body.repositoryId) {
      const repo = await getRepositoryById(body.repositoryId, userId);
      if (!repo) {
        res.status(404).json(errorResponse("Repository not found"));
        return;
      }
    }

    const result = await generateCode({
      userId,
      type: body.type,
      prompt: body.prompt,
      repositoryId: body.repositoryId,
      filePath: body.filePath,
      inputCode: body.inputCode,
      inputLanguage: body.inputLanguage,
      targetLanguage: body.targetLanguage,
      model: body.model,
    });

    res.status(200).json(successResponse(result, "Code generated successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Code generation failed"
      )
    );
  }
};

export const refactorCodeController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { inputCode, prompt, repositoryId, filePath } = req.body;

    if (!inputCode && !prompt) {
      res.status(400).json(errorResponse("inputCode or prompt is required"));
      return;
    }

    const result = await generateCode({
      userId,
      type: "refactor",
      prompt: prompt ?? "Refactor this code using best practices and SOLID principles",
      repositoryId,
      filePath,
      inputCode,
    });

    res.status(200).json(successResponse(result, "Code refactored successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Refactoring failed"
      )
    );
  }
};

export const explainCodeController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { inputCode, prompt, repositoryId, filePath } = req.body;

    if (!inputCode && !prompt) {
      res.status(400).json(errorResponse("inputCode or prompt is required"));
      return;
    }

    const result = await generateCode({
      userId,
      type: "explain",
      prompt: prompt ?? "Explain this code in detail",
      repositoryId,
      filePath,
      inputCode,
    });

    res.status(200).json(successResponse(result, "Code explained successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Explanation failed"
      )
    );
  }
};

export const translateCodeController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { inputCode, inputLanguage, targetLanguage, prompt, repositoryId, filePath } =
      req.body;

    if (!inputCode || !targetLanguage) {
      res.status(400).json(errorResponse("inputCode and targetLanguage are required"));
      return;
    }

    const finalPrompt =
      prompt ??
      `Translate the following ${inputLanguage ?? "code"} to ${targetLanguage}. Preserve all functionality.`;

    const result = await generateCode({
      userId,
      type: "translate",
      prompt: finalPrompt,
      repositoryId,
      filePath,
      inputCode,
      inputLanguage,
      targetLanguage,
    });

    res.status(200).json(successResponse(result, "Code translated successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Translation failed"
      )
    );
  }
};

export const generateTestsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { inputCode, prompt, repositoryId, filePath } = req.body;

    if (!inputCode && !prompt) {
      res.status(400).json(errorResponse("inputCode or prompt is required"));
      return;
    }

    const result = await generateCode({
      userId,
      type: "test",
      prompt: prompt ?? "Generate comprehensive unit and integration tests for this code",
      repositoryId,
      filePath,
      inputCode,
    });

    res.status(200).json(successResponse(result, "Tests generated successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Test generation failed"
      )
    );
  }
};

export const generateDocumentationController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { inputCode, prompt, repositoryId, filePath } = req.body;

    if (!inputCode && !prompt) {
      res.status(400).json(errorResponse("inputCode or prompt is required"));
      return;
    }

    const result = await generateCode({
      userId,
      type: "documentation",
      prompt: prompt ?? "Generate comprehensive documentation for this code",
      repositoryId,
      filePath,
      inputCode,
    });

    res.status(200).json(successResponse(result, "Documentation generated successfully"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Documentation generation failed"
      )
    );
  }
};

export const getGenerationHistoryController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const parsed = generationHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    const { page, limit, type } = parsed.data;
    const result = await getCodeGenerations(userId, { page, limit, type });
    res.status(200).json(successResponse(result, "History fetched"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to fetch history"
      )
    );
  }
};

export const getSavedPromptsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const prompts = await getSavedPrompts(req.userId!);
    res.status(200).json(successResponse(prompts, "Saved prompts fetched"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to fetch saved prompts"
      )
    );
  }
};

export const createSavedPromptController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const parsed = savePromptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    const prompt = await createSavedPrompt({
      userId,
      title: parsed.data.title,
      prompt: parsed.data.prompt,
      category: parsed.data.category,
    });

    res.status(201).json(successResponse(prompt, "Prompt saved"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to save prompt"
      )
    );
  }
};

export const deleteSavedPromptController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    await deleteSavedPrompt(idStr, userId);
    res.status(200).json(successResponse(null, "Prompt deleted"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to delete prompt"
      )
    );
  }
};

export const recordHistoryActionController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { generationId, action, editedCode } = req.body;

    if (!generationId || !action) {
      res.status(400).json(errorResponse("generationId and action are required"));
      return;
    }

    const validActions = ["accepted", "rejected", "edited"];
    if (!validActions.includes(action)) {
      res.status(400).json(errorResponse("Invalid action"));
      return;
    }

    const generation = await getCodeGenerationById(generationId, userId);
    if (!generation) {
      res.status(404).json(errorResponse("Generation not found"));
      return;
    }

    await createGenerationHistory({
      userId,
      generationId,
      action: action as "accepted" | "rejected" | "edited",
      editedCode,
    });

    let newStatus = generation.status;
    if (action === "accepted") newStatus = "accepted";
    if (action === "rejected") newStatus = "rejected";
    if (action === "edited") newStatus = "accepted";

    const { updateCodeGeneration } = await import("../repository/code-generation.repository.js");
    await updateCodeGeneration(generationId, { status: newStatus });

    res.status(200).json(successResponse(null, "Action recorded"));
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to record action"
      )
    );
  }
};

export const applyGeneratedCodeController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const parsed = applyGeneratedCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(errorResponse(parseZodMessage(parsed.error)));
      return;
    }

    const { generationId, repositoryId, filePath, code } = parsed.data;
    const [generation, repository] = await Promise.all([
      getCodeGenerationById(generationId, userId),
      getRepositoryById(repositoryId, userId),
    ]);
    if (!generation || !repository) {
      res.status(404).json(errorResponse("Generation or repository not found"));
      return;
    }

    const repositoryRoot = path.resolve(repository.localPath);
    const targetPath = path.resolve(repositoryRoot, filePath);
    if (targetPath !== repositoryRoot && !targetPath.startsWith(`${repositoryRoot}${path.sep}`)) {
      res.status(400).json(errorResponse("File path must stay inside the selected repository"));
      return;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, code, "utf8");
    await createGenerationHistory({ userId, generationId, action: "accepted", editedCode: code });
    const { updateCodeGeneration } = await import("../repository/code-generation.repository.js");
    await updateCodeGeneration(generationId, { status: "accepted", filePath });

    res.status(200).json(successResponse({ filePath }, "Generated code applied to file"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to apply generated code"));
  }
};
