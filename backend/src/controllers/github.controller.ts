import { Request, Response } from "express";
import { parseGitHubUrl } from "../github/github.service.js";
import { cloneRepository } from "../github/github.clone.js";
import { githubParseSchema } from "../validators/github.validator.js";
import { successResponse, errorResponse } from "../utils/api-response.js";

export const parseRepositoryController = (
  req: Request,
  res: Response
): void => {
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

  res.status(200).json(
    successResponse(repository, "Repository parsed successfully")
  );
};

export const cloneRepositoryController = async (
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
    const clonePath = await cloneRepository(
      repository.url,
      repository.repo
    );

    res.status(200).json(
      successResponse(
        {
          repository,
          clonePath,
        },
        "Repository cloned successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to clone repository"
      )
    );
  }
};