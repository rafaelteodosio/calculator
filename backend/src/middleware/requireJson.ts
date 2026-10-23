import type { RequestHandler } from 'express';
import { AppError, MESSAGES } from '../errors.js';
export const requireJson: RequestHandler = (req, _res, next) => {
  if (!req.is('application/json'))
    throw new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', MESSAGES.UNSUPPORTED_MEDIA_TYPE);
  next();
};
