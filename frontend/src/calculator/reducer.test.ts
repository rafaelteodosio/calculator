import { it, expect } from 'vitest';
import {
  calculatorReducer as reduce,
  initialState,
  getComputeRequest,
  keyToAction,
} from './reducer';
import type { KeyId, CalcState, ComputeRequest } from './types';
function invariant(s: CalcState) {
  expect(s.loading).toBe(s.inFlight !== null);
  if (s.awaitingOperand) {
    expect(s.overwrite).toBe(true);
    expect(s.pendingOperation).not.toBeNull();
  }
  expect(s.pendingOperation !== null).toBe(s.accumulator !== null);
  if (s.error !== null) expect(s).toEqual({ ...initialState, error: s.error });
}
function fake(r: ComputeRequest): number {
  const a = r.operands[0]!;
  const b = r.operands[1]!;
  switch (r.operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      return a / b;
    case 'power':
      return a ** b;
    case 'sqrt':
      return Math.sqrt(a);
    case 'percent':
      return a / 100;
  }
}
function run(keys: KeyId[], api = fake) {
  let state = initialState;
  const requests: ComputeRequest[] = [];
  let id = 0;
  for (const key of keys) {
    const req = getComputeRequest(state, key);
    if (req) {
      requests.push(req);
      state = reduce(state, {
        type: 'computeStart',
        requestId: ++id,
        continuation: req.continuation,
      });
      invariant(state);
      try {
        state = reduce(state, { type: 'computeSuccess', requestId: id, result: api(req) });
      } catch {
        state = reduce(state, {
          type: 'computeFailure',
          requestId: id,
          message: 'Cannot divide by zero',
        });
      }
    } else {
      const action = keyToAction(key);
      if (action) state = reduce(state, action);
    }
    invariant(state);
  }
  return { state, requests };
}
const state = (...keys: KeyId[]) => run(keys).state;
const loading = () =>
  reduce(initialState, { type: 'computeStart', requestId: 1, continuation: { kind: 'equals' } });
const failed = { ...initialState, error: 'Cannot divide by zero' };
it('R1 initial state', () => {
  expect(initialState).toEqual({
    display: '0',
    accumulator: null,
    pendingOperation: null,
    awaitingOperand: false,
    overwrite: false,
    error: null,
    loading: false,
    inFlight: null,
  });
  invariant(initialState);
});
it.each([
  ['R2', ['5'], '5'],
  ['R3', ['0', '0'], '0'],
  ['R4', ['0', '7'], '7'],
  ['R5', ['1', '2', '3'], '123'],
  ['R6', ['decimal'], '0.'],
  ['R8', ['0', 'decimal', '0', '5'], '0.05'],
  ['R10', ['1', 'decimal', ...Array<KeyId>(15).fill('2')], '1.' + '2'.repeat(14)],
  ['R15', ['2', 'add', 'decimal'], '0.'],
  ['R18', ['2', 'add', '3', 'multiply', '4', 'equals'], '20'],
  ['R21', ['2', 'add', '3', 'equals', '7'], '7'],
  ['R22', ['2', 'add', '3', 'equals', 'decimal'], '0.'],
  ['R23', ['2', 'add', '3', 'equals', 'add', '1', 'equals'], '6'],
  ['R24', ['5', 'multiply', 'equals'], '25'],
  ['R26', ['9', 'sqrt'], '3'],
  ['R27', ['2', 'add', '9', 'sqrt', 'equals'], '5'],
  ['R29', ['5', '0', 'percent'], '0.5'],
  ['R30', ['9', 'sqrt', '4'], '4'],
] as [string, KeyId[], string][])('%s input sequence', (_id, keys, display) =>
  expect(run(keys).state.display).toBe(display),
);
it('R7 ignores second decimal by reference', () => {
  const s = state('1', 'decimal');
  expect(reduce(s, { type: 'decimal' })).toBe(s);
  expect(state('1', 'decimal', 'decimal', '5').display).toBe('1.5');
});
it('R9 ignores sixteenth digit by reference', () => {
  const s = run(Array<KeyId>(15).fill('9')).state;
  expect(reduce(s, { type: 'digit', digit: '9' })).toBe(s);
  expect(s.display).toBe('9'.repeat(15));
});
it('R11 decimal cannot bypass digit cap', () => {
  const s = run(Array<KeyId>(15).fill('9')).state;
  expect(reduce(s, { type: 'decimal' })).toBe(s);
});
it('R12 operator arms next input without API', () => {
  const r = run(['2', 'add']);
  expect(r.requests).toEqual([]);
  expect(r.state).toMatchObject({
    display: '2',
    accumulator: 2,
    pendingOperation: 'add',
    awaitingOperand: true,
    overwrite: true,
  });
});
it('R13 replaces an operator', () => {
  const r = run(['2', 'add', 'multiply']);
  expect(r.state.pendingOperation).toBe('multiply');
  expect(r.requests).toEqual([]);
});
it('R14 second operand overwrites display', () =>
  expect(state('2', 'add', '3')).toMatchObject({
    display: '3',
    awaitingOperand: false,
    overwrite: false,
    accumulator: 2,
  }));
it('R16 builds chain request', () =>
  expect(getComputeRequest(state('2', 'add', '3'), 'multiply')).toEqual({
    operation: 'add',
    operands: [2, 3],
    continuation: { kind: 'chain', next: 'multiply' },
  }));
it('R17 chain response arms next operation', () => {
  const s = reduce(state('2', 'add', '3'), {
    type: 'computeStart',
    requestId: 1,
    continuation: { kind: 'chain', next: 'multiply' },
  });
  const result = reduce(s, { type: 'computeSuccess', requestId: 1, result: 5 });
  expect(result).toMatchObject({
    display: '5',
    accumulator: 5,
    pendingOperation: 'multiply',
    awaitingOperand: true,
    loading: false,
    inFlight: null,
  });
  invariant(result);
});
it('R19 equals without operation is a no-op', () => {
  const s = state('5');
  expect(getComputeRequest(s, 'equals')).toBeNull();
  expect(keyToAction('equals')).toBeNull();
});
it('R20 equals request and result reset pending operation', () => {
  const r = run(['2', 'add', '3', 'equals']);
  expect(r.requests).toEqual([
    { operation: 'add', operands: [2, 3], continuation: { kind: 'equals' } },
  ]);
  expect(r.state).toMatchObject({
    display: '5',
    accumulator: null,
    pendingOperation: null,
    overwrite: true,
    awaitingOperand: false,
  });
});
it('R25 no repeat equals', () =>
  expect(run(['2', 'add', '3', 'equals', 'equals']).requests).toHaveLength(1));
it('R28 unary after operator keeps pending binary state', () => {
  const r = run(['2', 'add', 'sqrt']);
  expect(r.requests[0]).toEqual({
    operation: 'sqrt',
    operands: [2],
    continuation: { kind: 'unary' },
  });
  expect(r.state).toMatchObject({
    pendingOperation: 'add',
    accumulator: 2,
    awaitingOperand: false,
  });
});
it('R31 trailing decimal parses with Number', () =>
  expect(run(['5', 'decimal', 'add', '1', 'equals']).requests[0]?.operands).toEqual([5, 1]));
it('R32 negative result is next operand', () => {
  expect(state('3', 'subtract', '5', 'equals').display).toBe('-2');
  const r = run(['3', 'subtract', '5', 'equals', 'multiply', '3', 'equals']);
  expect(r.requests[1]?.operands).toEqual([-2, 3]);
  expect(r.state.display).toBe('-6');
});
it('R33 sends negative square root to backend', () => {
  const r = run(['0', 'subtract', '4', 'equals', 'sqrt']);
  expect(r.requests[1]).toEqual({
    operation: 'sqrt',
    operands: [-4],
    continuation: { kind: 'unary' },
  });
});
it('R34 matching failure resets state', () => {
  const s = reduce(loading(), { type: 'computeFailure', requestId: 1, message: failed.error! });
  expect(s).toEqual(failed);
  invariant(s);
});
it('R35 errors ignore computation and operators', () => {
  for (const k of ['add', 'sqrt', 'equals'] as const)
    expect(getComputeRequest(failed, k)).toBeNull();
  expect(reduce(failed, { type: 'operator', operation: 'add' })).toBe(failed);
});
it('R36 digit recovers from error', () =>
  expect(reduce(failed, { type: 'digit', digit: '7' })).toEqual({ ...initialState, display: '7' }));
it('R37 decimal recovers from error', () =>
  expect(reduce(failed, { type: 'decimal' })).toEqual({ ...initialState, display: '0.' }));
it('R38 clear recovers from error', () =>
  expect(reduce(failed, { type: 'clear' })).toBe(initialState));
it('R39 input ignored while loading', () => {
  const s = loading();
  for (const action of [
    { type: 'digit', digit: '1' },
    { type: 'decimal' },
    { type: 'operator', operation: 'add' },
  ] as const)
    expect(reduce(s, action)).toBe(s);
});
it('R40 compute ignored while loading', () => {
  for (const key of ['equals', 'add', 'sqrt'] as const)
    expect(getComputeRequest(loading(), key)).toBeNull();
});
it('R41 stale success ignored', () => {
  const s = loading();
  expect(reduce(s, { type: 'computeSuccess', requestId: 2, result: 99 })).toBe(s);
});
it('R42 clear discards late success', () => {
  const s = reduce(loading(), { type: 'clear' });
  expect(s).toBe(initialState);
  expect(reduce(s, { type: 'computeSuccess', requestId: 1, result: 99 })).toBe(s);
});
it('R43 stale failure ignored', () => {
  const s = loading();
  expect(reduce(s, { type: 'computeFailure', requestId: 2, message: 'x' })).toBe(s);
  expect(reduce(initialState, { type: 'computeFailure', requestId: 1, message: 'x' })).toBe(
    initialState,
  );
});
it('R44 results displayed without rounding', () => {
  for (const [result, text] of [
    [1e21, '1e+21'],
    [1e-7, '1e-7'],
    [0.3, '0.3'],
  ] as const)
    expect(reduce(loading(), { type: 'computeSuccess', requestId: 1, result }).display).toBe(text);
});
it('R45 direct chain operator ignored', () => {
  const s = state('2', 'add', '3');
  expect(reduce(s, { type: 'operator', operation: 'multiply' })).toBe(s);
});
it('chain and unary requests preserve operands', () => {
  expect(
    run(['2', 'add', '3', 'multiply', '4', 'equals']).requests.map((r) => [
      r.operation,
      r.operands,
    ]),
  ).toEqual([
    ['add', [2, 3]],
    ['multiply', [5, 4]],
  ]);
  expect(
    run(['2', 'add', '9', 'sqrt', 'equals']).requests.map((r) => [r.operation, r.operands]),
  ).toEqual([
    ['sqrt', [9]],
    ['add', [2, 3]],
  ]);
});
