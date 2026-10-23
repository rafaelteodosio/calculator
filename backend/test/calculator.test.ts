import { describe, it, expect } from 'vitest';
import { calculate, finalizeResult, isOperation, listOperations } from '../src/calculator.js';
import { AppError, MESSAGES } from '../src/errors.js';
import type { Operation, ErrorCode } from '../src/contract.js';

function expectError(fn: () => unknown, status: number, code: ErrorCode, message?: string) {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ status, code, ...(message ? { message } : {}) });
    return;
  }
  throw new Error('Expected AppError');
}
describe('result finalization', () => {
  it.each([
    ['D1', 0.30000000000000004, 0.3],
    ['D2', -0, 0],
    ['D6', Number.MAX_VALUE, Number.MAX_VALUE],
    ['D7', -Number.MAX_VALUE, -Number.MAX_VALUE],
    ['D8', Number('123456789012345678'), 123456789012346000],
    ['D9', Number.MIN_VALUE, 5e-324],
  ] as const)('%s rounds and normalizes', (_id, input, result) => {
    expect(Object.is(finalizeResult(input), result)).toBe(true);
  });
  it.each([
    ['D3', Infinity],
    ['D4', -Infinity],
    ['D5', NaN],
  ] as const)('%s rejects non-finite values', (_id, input) =>
    expectError(() => finalizeResult(input), 422, 'NON_FINITE_RESULT'),
  );
  it('D10 retains integers and exponent notation', () => {
    for (const n of [42, 1e21]) expect(finalizeResult(n)).toBe(n);
  });
});
const success: [string, Operation, number[], number][] = [
  ['D11', 'add', [2, 3], 5],
  ['D12', 'add', [0.1, 0.2], 0.3],
  ['D14', 'subtract', [0.3, 0.1], 0.2],
  ['D15', 'subtract', [5, 8], -3],
  ['D17', 'multiply', [0.1, 3], 0.3],
  ['D18', 'multiply', [-1, 0], 0],
  ['D19', 'multiply', [1e-200, 1e-200], 0],
  ['D21', 'divide', [10, 4], 2.5],
  ['D22', 'divide', [1, 3], 0.333333333333333],
  ['D23', 'divide', [2, 3], 0.666666666666667],
  ['D24', 'divide', [-6, 3], -2],
  ['D29', 'power', [2, 10], 1024],
  ['D30', 'power', [2, -1], 0.5],
  ['D31', 'power', [0, 0], 1],
  ['D32', 'power', [-2, 3], -8],
  ['D33', 'power', [2, 0.5], 1.4142135623731],
  ['D37', 'sqrt', [9], 3],
  ['D38', 'sqrt', [2], 1.4142135623731],
];
it.each(success)('%s computes %s', (_id, op, args, result) => {
  expect(Object.is(calculate(op, args), result)).toBe(true);
});
const failures: [string, Operation, number[], ErrorCode][] = [
  ['D13', 'add', [1e308, 1e308], 'NON_FINITE_RESULT'],
  ['D16', 'subtract', [-1e308, 1e308], 'NON_FINITE_RESULT'],
  ['D20', 'multiply', [1e308, 10], 'NON_FINITE_RESULT'],
  ['D25', 'divide', [5, 0], 'DIVISION_BY_ZERO'],
  ['D26', 'divide', [5, -0], 'DIVISION_BY_ZERO'],
  ['D27', 'divide', [0, 0], 'DIVISION_BY_ZERO'],
  ['D28', 'divide', [1e308, 1e-10], 'NON_FINITE_RESULT'],
  ['D34', 'power', [0, -1], 'NON_FINITE_RESULT'],
  ['D35', 'power', [10, 400], 'NON_FINITE_RESULT'],
  ['D36', 'power', [-8, 0.5], 'NON_FINITE_RESULT'],
];
it.each(failures)('%s rejects undefined arithmetic', (_id, op, args, code) =>
  expectError(() => calculate(op, args), 422, code),
);
it('D39 normalizes square roots of both zero signs', () => {
  for (const n of [0, -0]) expect(Object.is(calculate('sqrt', [n]), 0)).toBe(true);
});
it('D40 rejects negative square roots', () => {
  for (const n of [-4, -1e-300]) expectError(() => calculate('sqrt', [n]), 422, 'NEGATIVE_SQRT');
});
it('D41 calculates unary percent', () => {
  for (const [n, r] of [
    [50, 0.5],
    [-50, -0.5],
    [0.1, 0.001],
    [0, 0],
  ])
    expect(calculate('percent', [n])).toBe(r);
});
it('D42 validates unary arity', () =>
  expectError(
    () => calculate('sqrt', [1, 2]),
    400,
    'INVALID_OPERAND_COUNT',
    "Operation 'sqrt' expects 1 operand but received 2.",
  ));
it('D43 validates binary arity', () => {
  expectError(
    () => calculate('add', [1]),
    400,
    'INVALID_OPERAND_COUNT',
    "Operation 'add' expects 2 operands but received 1.",
  );
  expectError(() => calculate('add', []), 400, 'INVALID_OPERAND_COUNT');
});
it('D44 does not mutate inputs', () => expect(calculate('add', Object.freeze([1, 2]))).toBe(3));
it('D45 accepts each operation', () => {
  for (const op of ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'percent'])
    expect(isOperation(op)).toBe(true);
});
it('D46 rejects prototype names and unknown operations', () => {
  for (const op of ['ADD', 'modulo', '', 'toString', 'constructor', '__proto__', 'hasOwnProperty'])
    expect(isOperation(op)).toBe(false);
});
it('D47 lists fresh public metadata in order', () => {
  expect(listOperations()).toEqual([
    { name: 'add', symbol: '+', arity: 2, description: 'Sum of a and b' },
    { name: 'subtract', symbol: '−', arity: 2, description: 'a minus b' },
    { name: 'multiply', symbol: '×', arity: 2, description: 'Product of a and b' },
    { name: 'divide', symbol: '÷', arity: 2, description: 'a divided by b; b must not be 0' },
    { name: 'power', symbol: '^', arity: 2, description: 'a raised to the power b' },
    { name: 'sqrt', symbol: '√', arity: 1, description: 'Square root of a; a must be >= 0' },
    { name: 'percent', symbol: '%', arity: 1, description: 'a divided by 100' },
  ]);
  for (const info of listOperations())
    expect(Object.keys(info)).toEqual(['name', 'symbol', 'arity', 'description']);
  expect(listOperations()[0]).not.toBe(listOperations()[0]);
});
it('D48 preserves stable domain messages', () => {
  for (const [op, args, code] of [
    ['divide', [1, 0], 'DIVISION_BY_ZERO'],
    ['sqrt', [-1], 'NEGATIVE_SQRT'],
    ['power', [10, 400], 'NON_FINITE_RESULT'],
  ] as const) {
    expectError(() => calculate(op, args), 422, code, MESSAGES[code]);
    try {
      calculate(op, args);
    } catch (e) {
      expect((e as Error).name).toBe('AppError');
    }
  }
});
