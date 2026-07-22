import {getRepositoryById} from "../repository/repository.repository.js";
import {
  combinedSearch,
  searchFiles,
  searchFunctions,
  searchClasses,
  SearchFilters,
} from "../services/semantic-search.service.js";
import {errorResponse, successResponse} from "../utils/api-response.js";
import type {AuthRequest} from "../auth/auth.middleware.js";
import type {Response} from "express";

const getRepo = async (req: AuthRequest & { params: { id: string } }, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return null; }
  const repository = await getRepositoryById(req.params.id, userId);
  if (!repository) { res.status(404).json(errorResponse("Repository not found")); return null; }
  return repository;
};

export const combinedSearchController = async (
  req: AuthRequest & { params: { id: string }; query: { q?: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const query = (req.query.q as string) || "";
    const filters: SearchFilters = {
      language: req.query.language as string | undefined,
      extension: req.query.extension as string | undefined,
      minLines: req.query.minLines ? parseInt(req.query.minLines as string) : undefined,
      maxLines: req.query.maxLines ? parseInt(req.query.maxLines as string) : undefined,
      path: req.query.path as string | undefined,
    };

    const results = await combinedSearch(
      repository.id,
      repository.localPath,
      query,
      filters
    );
    res.status(200).json(successResponse(results, "Search completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Search failed"));
  }
};

export const semanticSearchController = async (
  req: AuthRequest & { params: { id: string }; query: { q?: string; limit?: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const { semanticSearch } = await import("../services/search.service.js");
    const query = (req.query.q as string) || "";
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const results = await semanticSearch(query, limit, repository.id);
    res.status(200).json(successResponse(results, "Semantic search completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Semantic search failed"));
  }
};

export const fileSearchController = async (
  req: AuthRequest & { params: { id: string }; query: { q?: string; language?: string; extension?: string; minLines?: string; maxLines?: string; path?: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const query = (req.query.q as string) || "";
    const filters: SearchFilters = {
      language: req.query.language as string | undefined,
      extension: req.query.extension as string | undefined,
      minLines: req.query.minLines ? parseInt(req.query.minLines as string) : undefined,
      maxLines: req.query.maxLines ? parseInt(req.query.maxLines as string) : undefined,
      path: req.query.path as string | undefined,
    };
    const results = searchFiles(repository.localPath, query, filters);
    res.status(200).json(successResponse(results, "File search completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "File search failed"));
  }
};

export const functionSearchController = async (
  req: AuthRequest & { params: { id: string }; query: { q?: string; language?: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const query = (req.query.q as string) || "";
    const filters: SearchFilters = {
      language: req.query.language as string | undefined,
    };
    const results = searchFunctions(repository.localPath, query, filters);
    res.status(200).json(successResponse(results, "Function search completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Function search failed"));
  }
};

export const classSearchController = async (
  req: AuthRequest & { params: { id: string }; query: { q?: string; language?: string } },
  res: Response
): Promise<void> => {
  const repository = await getRepo(req, res);
  if (!repository) return;

  try {
    const query = (req.query.q as string) || "";
    const filters: SearchFilters = {
      language: req.query.language as string | undefined,
    };
    const results = searchClasses(repository.localPath, query, filters);
    res.status(200).json(successResponse(results, "Class search completed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Class search failed"));
  }
};
