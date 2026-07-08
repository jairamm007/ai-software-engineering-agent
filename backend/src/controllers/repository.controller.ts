import { Request, Response } from "express";

import { parseGitHubUrl } from "../github/github.service.js";
import { githubParseSchema } from "../validators/github.validator.js";

import { indexGitHubRepository } from "../services/repository-index.service.js";

import {
  getRepositories,
  getRepositoryById,
  deleteRepository,
} from "../repository/repository.repository.js";

import {
  successResponse,
  errorResponse,
} from "../utils/api-response.js";

export const analyzeRepositoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const indexResult = await indexGitHubRepository(
      repository.url,
      repository.repo
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const repositories = await getRepositories();

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
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const repository = await getRepositoryById(
      req.params.id
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
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const repository = await getRepositoryById(
      req.params.id
    );

    if (!repository) {
      res.status(404).json(
        errorResponse("Repository not found")
      );
      return;
    }

    await deleteRepository(req.params.id);

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