import type { Operation, OperationInfo } from './contract.js';
import { AppError, MESSAGES } from './errors.js';
interface OperationDef {
  symbol: string;
  arity: 1 | 2;
  description: string;
  apply(operands: readonly number[]): number;
}
export const OPERATIONS: Readonly<Record<Operation, OperationDef>> = {
  add: { symbol: '+', arity: 2, description: 'Sum of a and b', apply: ([a, b]) => a + b },
  subtract: { symbol: '−', arity: 2, description: 'a minus b', apply: ([a, b]) => a - b },
  multiply: { symbol: '×', arity: 2, description: 'Product of a and b', apply: ([a, b]) => a * b },
  divide: {
    symbol: '÷',
    arity: 2,
    description: 'a divided by b; b must not be 0',
    apply: ([a, b]) => {
      if (b === 0) throw new AppError(422, 'DIVISION_BY_ZERO', MESSAGES.DIVISION_BY_ZERO);
      return a / b;
    },
  },
  power: {
    symbol: '^',
    arity: 2,
    description: 'a raised to the power b',
    apply: ([a, b]) => a ** b,
  },
  sqrt: {
    symbol: '√',
    arity: 1,
    description: 'Square root of a; a must be >= 0',
    apply: ([a]) => {
      if (a < 0) throw new AppError(422, 'NEGATIVE_SQRT', MESSAGES.NEGATIVE_SQRT);
      return Math.sqrt(a);
    },
  },
  percent: { symbol: '%', arity: 1, description: 'a divided by 100', apply: ([a]) => a / 100 },
};
export function isOperation(name: string): name is Operation {
  return Object.hasOwn(OPERATIONS, name);
}
export function listOperations(): OperationInfo[] {
  return (Object.keys(OPERATIONS) as Operation[]).map((name) => {
    const { symbol, arity, description } = OPERATIONS[name];
    return { name, symbol, arity, description };
  });
}
export function calculate(operation: Operation, operands: readonly number[]): number {
  const definition = OPERATIONS[operation];
  const { arity } = definition;
  if (operands.length !== arity)
    throw new AppError(
      400,
      'INVALID_OPERAND_COUNT',
      MESSAGES.INVALID_OPERAND_COUNT(operation, arity, operands.length),
    );
  return finalizeResult(definition.apply(operands));
}
export function finalizeResult(x: number): number {
  if (!Number.isFinite(x)) {
    throw new AppError(422, 'NON_FINITE_RESULT', MESSAGES.NON_FINITE_RESULT);
  }
  let r = Number(x.toPrecision(15));
  // toPrecision can round values near Number.MAX_VALUE up to Infinity; keep the finite original.
  if (!Number.isFinite(r)) r = x;
  // Normalise negative zero.
  if (Object.is(r, -0)) r = 0;
  return r;
}
