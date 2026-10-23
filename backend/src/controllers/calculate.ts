import type { RequestHandler } from 'express';
import type { CalculateResponse } from '../contract.js';
import { calculate, isOperation, listOperations } from '../calculator.js';
import { AppError, MESSAGES } from '../errors.js';
import { calculateRequestSchema, toValidationIssues } from '../validation.js';
export const postCalculate: RequestHandler = (req, res) => {
  const parsed = calculateRequestSchema.safeParse(req.body);
  if (!parsed.success)
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      MESSAGES.VALIDATION_ERROR,
      toValidationIssues(parsed.error),
    );
  const { operation, operands } = parsed.data;
  if (!isOperation(operation))
    throw new AppError(
      400,
      'UNSUPPORTED_OPERATION',
      MESSAGES.UNSUPPORTED_OPERATION(
        operation,
        listOperations().map((o) => o.name),
      ),
    );
  const result = calculate(operation, operands);
  res.status(200).json({ operation, operands, result } satisfies CalculateResponse);
};
