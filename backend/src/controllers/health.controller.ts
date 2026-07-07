import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service.js";

export const healthController = (
  req: Request,
  res: Response
): void => {
  const health = getHealthStatus();

  res.status(200).json(health);
};