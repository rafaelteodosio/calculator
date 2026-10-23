import { it, expect } from 'vitest';
import { ApiError } from './client';
import { toDisplayMessage } from './errorMessages';
it.each([
  ['FE1', 'DIVISION_BY_ZERO', 'Cannot divide by zero'],
  ['FE2', 'NEGATIVE_SQRT', 'Invalid input'],
  ['FE3', 'NON_FINITE_RESULT', 'Math error'],
  ['FE4', 'NETWORK_ERROR', 'Network error'],
] as const)('%s maps display text', (_id, code, text) =>
  expect(toDisplayMessage(new ApiError(code, 'secret'))).toBe(text),
);
it('FE5 maps other codes to generic text', () => {
  for (const code of [
    'VALIDATION_ERROR',
    'UNSUPPORTED_OPERATION',
    'UNEXPECTED_RESPONSE',
    'INTERNAL_ERROR',
  ] as const)
    expect(toDisplayMessage(new ApiError(code, 'secret'))).toBe('Error');
});
it('FE6 handles unexpected errors', () => {
  for (const e of [new Error('x'), 'boom', undefined]) expect(toDisplayMessage(e)).toBe('Error');
});
