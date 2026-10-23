import { ApiError, type ClientErrorCode } from './client';

export const ERROR_DISPLAY_TEXT: Partial<Record<ClientErrorCode, string>> = {
  DIVISION_BY_ZERO: 'Cannot divide by zero',
  NEGATIVE_SQRT: 'Invalid input',
  NON_FINITE_RESULT: 'Math error',
  NETWORK_ERROR: 'Network error',
};
export const GENERIC_ERROR_TEXT = 'Error';

export function toDisplayMessage(error: unknown): string {
  if (error instanceof ApiError) return ERROR_DISPLAY_TEXT[error.code] ?? GENERIC_ERROR_TEXT;
  return GENERIC_ERROR_TEXT;
}
