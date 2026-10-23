import type { BinaryOperation, Operation, UnaryOperation } from '../api/contract';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type KeyId = Digit | 'decimal' | BinaryOperation | UnaryOperation | 'equals' | 'clear';

export type Continuation =
  | { kind: 'chain'; next: BinaryOperation } // operator pressed while a binary op was pending with a typed 2nd operand
  | { kind: 'equals' } // '=' with a pending binary op
  | { kind: 'unary' }; // sqrt or percent on the display value

export interface InFlight {
  requestId: number;
  continuation: Continuation;
}

export interface CalcState {
  display: string; // text being typed, or String(lastResult); never an error text
  accumulator: number | null; // left operand of the pending binary op
  pendingOperation: BinaryOperation | null;
  awaitingOperand: boolean; // true right after a binary operator: 2nd operand not yet entered
  overwrite: boolean; // true when next digit/'.' must REPLACE display (after operator, '=', unary)
  error: string | null; // display text of the last error (already mapped), or null
  loading: boolean; // a compute request is in flight
  inFlight: InFlight | null; // invariant: loading === (inFlight !== null)
}

export type CalcAction =
  | { type: 'digit'; digit: Digit }
  | { type: 'decimal' }
  | { type: 'operator'; operation: BinaryOperation }
  | { type: 'clear' }
  | { type: 'computeStart'; requestId: number; continuation: Continuation }
  | { type: 'computeSuccess'; requestId: number; result: number }
  | { type: 'computeFailure'; requestId: number; message: string };

export interface ComputeRequest {
  operation: Operation;
  operands: number[];
  continuation: Continuation;
}
