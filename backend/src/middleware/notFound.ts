import type { RequestHandler, Request } from 'express';
import { AppError, MESSAGES } from '../errors.js';
export function pathOf(req: Request): string {
  return req.originalUrl.split('?')[0];
}
export const notFoundHandler: RequestHandler = (req) => {
  throw new AppError(404, 'NOT_FOUND', MESSAGES.NOT_FOUND(req.method, pathOf(req)));
};
