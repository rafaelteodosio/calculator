import type { RequestHandler } from 'express';
import type { OperationsResponse } from '../contract.js';
import { listOperations } from '../calculator.js';
export const getOperations: RequestHandler = (_req, res) => {
  res.json({ operations: listOperations() } satisfies OperationsResponse);
};
