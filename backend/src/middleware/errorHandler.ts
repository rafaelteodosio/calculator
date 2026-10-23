import type { ErrorRequestHandler } from 'express';
import { AppError, MESSAGES } from '../errors.js';
import type { ErrorCode } from '../contract.js';
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  let error: AppError;
  if (err instanceof AppError) error = err;
  else {
    const type = typeof err === 'object' && err !== null && 'type' in err ? err.type : undefined;
    let mapped: [number, keyof typeof MESSAGES & ErrorCode] | undefined;
    if (type === 'entity.too.large') mapped = [413, 'PAYLOAD_TOO_LARGE'];
    else if (
      type === 'entity.parse.failed' ||
      type === 'request.aborted' ||
      type === 'request.size.invalid'
    )
      mapped = [400, 'MALFORMED_JSON'];
    else if (type === 'charset.unsupported' || type === 'encoding.unsupported')
      mapped = [415, 'UNSUPPORTED_MEDIA_TYPE'];
    if (mapped) {
      const [status, code] = mapped;
      error = new AppError(status, code, String(MESSAGES[code]));
    } else {
      console.error('Unhandled error:', err);
      error = new AppError(500, 'INTERNAL_ERROR', MESSAGES.INTERNAL_ERROR);
    }
  }
  res
    .status(error.status)
    .json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
};
