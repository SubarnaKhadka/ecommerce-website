import { Request, Response, NextFunction } from "express";
import { HttpException } from "../http.exception";

export function catchHttpException(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
    statusCode: 500,
  });
}
