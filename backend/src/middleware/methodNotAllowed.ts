import type { RequestHandler } from 'express';
import { AppError, MESSAGES } from '../errors.js';
import { pathOf } from './notFound.js';
export function methodNotAllowed(allowed: readonly string[]): RequestHandler {
  return (req, res, next) => {
    res.set('Allow', allowed.join(', '));
    next(
      new AppError(405, 'METHOD_NOT_ALLOWED', MESSAGES.METHOD_NOT_ALLOWED(req.method, pathOf(req))),
    );
  };
}
