import type { NextFunction, Request, Response } from 'express';
import logger from '@lib/logger';
import { AppError } from '@lib/errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        details: err.details
      },
      err.message
    );

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details ?? null
      }
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
};
