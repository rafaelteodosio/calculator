import express, { type Router } from 'express';
import { getHealth } from '../controllers/health.js';
import { getOperations } from '../controllers/operations.js';
import { postCalculate } from '../controllers/calculate.js';
import { requireJson } from '../middleware/requireJson.js';
import { methodNotAllowed } from '../middleware/methodNotAllowed.js';
export function createApiRouter(): Router {
  const router = express.Router();
  router
    .route('/health')
    .get(getHealth)
    .all(methodNotAllowed(['GET']));
  router
    .route('/operations')
    .get(getOperations)
    .all(methodNotAllowed(['GET']));
  router
    .route('/calculate')
    .post(requireJson, express.json({ limit: '10kb', strict: true }), postCalculate)
    .all(methodNotAllowed(['POST']));
  return router;
}
