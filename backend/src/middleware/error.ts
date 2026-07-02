import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isOperational = err instanceof AppError ? err.isOperational : false;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : 'Internal Server Error';
  const errors = err instanceof AppError ? err.errors : undefined;
  const isProduction = process.env.NODE_ENV === 'production';

  // Structured log — never leaks to client
  if (statusCode >= 500) {
    logger.error(
      {
        err,
        requestId: (req as any).requestId,
        method: req.method,
        path: req.path,
        statusCode,
      },
      'Unhandled server error',
    );
  } else {
    logger.warn(
      {
        requestId: (req as any).requestId,
        method: req.method,
        path: req.path,
        statusCode,
        message,
      },
      'Operational error',
    );
  }

  res.status(statusCode).json({
    success: false,
    requestId: (req as any).requestId, // Helps users report exact error logs
    message: isProduction && !isOperational ? 'Internal Server Error' : message,
    ...(errors ? { errors } : {}),
    // Never expose stack trace in production
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    requestId: (req as any).requestId,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
