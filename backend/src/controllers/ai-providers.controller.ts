import { Request, Response } from "express";
import { getAIProviders } from "../services/ai-providers.service.js";

export const aiProvidersController = (req: Request, res: Response): void => {
  const result = getAIProviders();
  res.status(200).json({ success: true, data: result });
};
