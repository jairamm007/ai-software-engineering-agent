import { getRepositoryById } from "../repository/repository.repository.js";
import {
  generateReadme,
  generateApiDocs,
  generateFunctionDocs,
  generateClassDocs,
  generateArchitectureDocs,
  generateAllDocumentation,
} from "../services/documentation-generator.service.js";
import { errorResponse, successResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

const getRepo = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return null; }
  const repository = await getRepositoryById(req.params.id, userId);
  if (!repository) { res.status(404).json(errorResponse("Repository not found")); return null; }
  return repository;
};

export const generateReadmeController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const readme = generateReadme(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(readme, "README generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate README"));
  }
};

export const generateApiDocsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const docs = generateApiDocs(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(docs, "API documentation generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate API docs"));
  }
};

export const generateFunctionDocsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const docs = generateFunctionDocs(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(docs, "Function documentation generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate function docs"));
  }
};

export const generateClassDocsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const docs = generateClassDocs(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(docs, "Class documentation generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate class docs"));
  }
};

export const generateArchitectureDocsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const docs = generateArchitectureDocs(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(docs, "Architecture documentation generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate architecture docs"));
  }
};

export const generateAllDocsController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;
  try {
    const docs = generateAllDocumentation(repository.localPath);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).json(successResponse(docs, "All documentation generated successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to generate documentation"));
  }
};
