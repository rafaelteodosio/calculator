// API contract shared by backend and frontend.
// KEEP BOTH COPIES BYTE-IDENTICAL: backend/src/contract.ts and frontend/src/api/contract.ts.
// Verified by `npm run check:contract` (runs in CI). Types only — no runtime code.

export type BinaryOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';
export type UnaryOperation = 'sqrt' | 'percent';
export type Operation = BinaryOperation | UnaryOperation;

export interface CalculateRequest {
  operation: Operation;
  operands: number[];
}

export interface CalculateResponse {
  operation: Operation;
  operands: number[];
  result: number;
}

export interface OperationInfo {
  name: Operation;
  symbol: string;
  arity: 1 | 2;
  description: string;
}

export interface OperationsResponse {
  operations: OperationInfo[];
}

export interface HealthResponse {
  status: 'ok';
}

export type ErrorCode =
  | 'MALFORMED_JSON'
  | 'VALIDATION_ERROR'
  | 'UNSUPPORTED_OPERATION'
  | 'INVALID_OPERAND_COUNT'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'DIVISION_BY_ZERO'
  | 'NEGATIVE_SQRT'
  | 'NON_FINITE_RESULT'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationIssue[];
  };
}
