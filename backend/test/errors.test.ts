import { it, expect } from 'vitest';
import { AppError, MESSAGES } from '../src/errors.js';
it('E1 carries error metadata', () => {
  const e = new AppError(422, 'DIVISION_BY_ZERO', 'm');
  expect(e).toBeInstanceOf(Error);
  expect(e).toMatchObject({
    name: 'AppError',
    status: 422,
    code: 'DIVISION_BY_ZERO',
    message: 'm',
  });
  expect(e.details).toBeUndefined();
});
it('E2 formats supported operations', () =>
  expect(
    MESSAGES.UNSUPPORTED_OPERATION('modulo', [
      'add',
      'subtract',
      'multiply',
      'divide',
      'power',
      'sqrt',
      'percent',
    ]),
  ).toBe(
    "Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent.",
  ));
it('E3 pluralizes arity', () => {
  expect(MESSAGES.INVALID_OPERAND_COUNT('sqrt', 1, 2)).toBe(
    "Operation 'sqrt' expects 1 operand but received 2.",
  );
  expect(MESSAGES.INVALID_OPERAND_COUNT('add', 2, 1)).toBe(
    "Operation 'add' expects 2 operands but received 1.",
  );
});
it('E4 formats path errors', () => {
  expect(MESSAGES.NOT_FOUND('GET', '/api/v1/nope')).toBe('Route GET /api/v1/nope not found.');
  expect(MESSAGES.METHOD_NOT_ALLOWED('GET', '/api/v1/calculate')).toBe(
    'Method GET not allowed on /api/v1/calculate.',
  );
});
