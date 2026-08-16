import type { Request, Response, NextFunction } from "express";
import { logger } from "./logging.middleware.js";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.headers["x-request-id"] as string | undefined;

  if (error?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, error: "Invalid JSON body" });
    return;
  }

  const status =
    error?.status ||
    error?.statusCode ||
    (error instanceof SyntaxError ? 400 : 500);

  if (status >= 500) {
    logger.error("Unhandled error", {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url || req.path,
      message: error?.message || "Unknown error",
      stack: error?.stack,
    });
  }

  const isProd = process.env.NODE_ENV === "production";
  const clientMessage =
    isProd && status >= 500
      ? "Internal Server Error"
      : error?.message || "Internal Server Error";

  res.status(status).json({ success: false, error: clientMessage });
};
