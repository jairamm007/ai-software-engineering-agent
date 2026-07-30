import type { Request, Response, NextFunction } from "express";

export function validatePerformanceScanInput(req: Request, res: Response, next: NextFunction) {
  const { repositoryId } = req.body;

  if (repositoryId !== undefined && typeof repositoryId !== "string") {
    res.status(400).json({ success: false, error: "repositoryId must be a string" });
    return;
  }

  next();
}
