import type { RequestHandler } from 'express';
import type { HealthResponse } from '../contract.js';
export const getHealth: RequestHandler = (_req, res) => {
  res.json({ status: 'ok' } satisfies HealthResponse);
};
