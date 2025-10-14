import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@lib/errors';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError());
};
