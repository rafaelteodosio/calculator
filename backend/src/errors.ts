import type { ErrorCode, ValidationIssue } from './contract.js';
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ValidationIssue[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
export const MESSAGES = {
  MALFORMED_JSON: 'Request body is not valid JSON.',
  VALIDATION_ERROR: 'Request body failed validation.',
  UNSUPPORTED_MEDIA_TYPE: 'Content-Type must be application/json.',
  PAYLOAD_TOO_LARGE: 'Request body exceeds the 10kb limit.',
  DIVISION_BY_ZERO: 'Division by zero is not allowed.',
  NEGATIVE_SQRT: 'Cannot take the square root of a negative number.',
  NON_FINITE_RESULT: 'The result is not a finite real number.',
  INTERNAL_ERROR: 'An unexpected error occurred.',
  UNSUPPORTED_OPERATION: (op: string, supported: readonly string[]) =>
    `Unsupported operation '${op}'. Supported operations: ${supported.join(', ')}.`,
  INVALID_OPERAND_COUNT: (op: string, arity: number, received: number) =>
    `Operation '${op}' expects ${arity} operand${arity === 1 ? '' : 's'} but received ${received}.`,
  NOT_FOUND: (method: string, path: string) => `Route ${method} ${path} not found.`,
  METHOD_NOT_ALLOWED: (method: string, path: string) => `Method ${method} not allowed on ${path}.`,
} as const;
