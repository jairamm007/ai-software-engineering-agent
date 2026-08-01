import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service.js";

export const healthController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const health = await getHealthStatus();

  res.status(200).json(health);
};