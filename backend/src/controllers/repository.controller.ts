import { parseGitHubUrl } from "../github/github.service.js";
import { githubParseSchema } from "../validators/github.validator.js";

import { indexGitHubRepository } from "../services/repository-index.service.js";

import {
  getRepositories,
  getRepositoryById,
  getRepositoryByGithubUrl,
  deleteRepository,
  toggleFavorite,
  clearRepositoryIndex,
} from "../repository/repository.repository.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const analyzeRepositoryController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  const result = githubParseSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(
      errorResponse(result.error.issues[0].message)
    );
    return;
  }

  const { url } = result.data;

  const repository = parseGitHubUrl(url);

  if (!repository) {
    res.status(400).json(
      errorResponse("Invalid GitHub repository URL")
    );
    return;
  }

  try {
    const existingRepo = await getRepositoryByGithubUrl(repository.url, userId);
    if (existingRepo) {
      await clearRepositoryIndex(existingRepo.id, userId);
    }

    const indexResult = await indexGitHubRepository(
      repository.url,
      repository.repo,
      userId
    );

    res.status(200).json(
      successResponse(
        indexResult,
        "Repository indexed successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Repository indexing failed"
      )
    );
  }
};

export const getRepositoriesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;

    const repositories = await getRepositories(userId, { search, sortBy });

    res.status(200).json(
      successResponse(
        repositories,
        "Repositories fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to fetch repositories"
      )
    );
  }
};

export const getRepositoryByIdController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(
      req.params.id,
      userId
    );

    if (!repository) {
      res.status(404).json(
        errorResponse("Repository not found")
      );
      return;
    }

    res.status(200).json(
      successResponse(
        repository,
        "Repository fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to fetch repository"
      )
    );
  }
};

export const deleteRepositoryController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(
      req.params.id,
      userId
    );

    if (!repository) {
      res.status(404).json(
        errorResponse("Repository not found")
      );
      return;
    }

    await deleteRepository(req.params.id, userId);

    res.status(200).json(
      successResponse(
        null,
        "Repository deleted successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to delete repository"
      )
    );
  }
};

export const toggleFavoriteController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await toggleFavorite(req.params.id, userId);

    res.status(200).json(
      successResponse(
        repository,
        "Favorite status updated"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to toggle favorite"
      )
    );
  }
};

export const reindexRepositoryController = async (
  req: AuthRequest & { params: { id: string } },
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const repository = await getRepositoryById(
      req.params.id,
      userId
    );

    if (!repository) {
      res.status(404).json(
        errorResponse("Repository not found")
      );
      return;
    }

    await clearRepositoryIndex(req.params.id, userId);

    const indexResult = await indexGitHubRepository(
      repository.githubUrl,
      repository.name,
      userId
    );

    res.status(200).json(
      successResponse(
        indexResult,
        "Repository re-indexed successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to re-index repository"
      )
    );
  }
};
