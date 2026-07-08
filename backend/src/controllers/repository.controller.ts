import { Request, Response } from "express";
import { parseGitHubUrl } from "../github/github.service.js";
import { cloneRepository } from "../github/github.clone.js";
import { githubParseSchema } from "../validators/github.validator.js";
import { scanRepository } from "../repository/repository.scanner.js";
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
    const clonePath = await cloneRepository(
      repository.url,
      repository.repo
    );

    const scanResult = scanRepository(clonePath);

    res.status(200).json(
      successResponse(
        {
          repository,
          scanResult,
        },
        "Repository analyzed successfully"
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Analysis failed"
      )
    );
  }
};