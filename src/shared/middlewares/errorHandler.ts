import { Request, Response, NextFunction } from "express";
import { BaseError } from "../../core/errors/baseError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.description,
    });
  }

  console.error("❌ Unhandled Error:", err);

  return res.status(500).json({
    error: "InternalServerError",
    message: "Erro inesperado no servidor.",
  });
};
