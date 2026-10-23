import { isBinaryKey, isUnaryKey, isDigitKey } from './keys';
import { countDigits } from './selectors';
import type { CalcState, CalcAction, ComputeRequest, KeyId } from './types';
export const MAX_INPUT_DIGITS = 15;
export const initialState: CalcState = {
  display: '0',
  accumulator: null,
  pendingOperation: null,
  awaitingOperand: false,
  overwrite: false,
  error: null,
  loading: false,
  inFlight: null,
};
export function calculatorReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'clear':
      return initialState;
    case 'digit': {
      if (state.loading) return state;
      const base = state.error !== null ? initialState : state;
      if (base.overwrite)
        return { ...base, display: action.digit, overwrite: false, awaitingOperand: false };
      if (base.display === '0') return { ...base, display: action.digit };
      if (countDigits(base.display) >= MAX_INPUT_DIGITS) return base;
      return { ...base, display: base.display + action.digit };
    }
    case 'decimal': {
      if (state.loading) return state;
      const base = state.error !== null ? initialState : state;
      if (base.overwrite)
        return { ...base, display: '0.', overwrite: false, awaitingOperand: false };
      if (base.display.includes('.') || countDigits(base.display) >= MAX_INPUT_DIGITS) return base;
      return { ...base, display: base.display + '.' };
    }
    case 'operator':
      if (state.loading || state.error !== null) return state;
      if (state.pendingOperation !== null)
        return state.awaitingOperand ? { ...state, pendingOperation: action.operation } : state;
      return {
        ...state,
        accumulator: Number(state.display),
        pendingOperation: action.operation,
        awaitingOperand: true,
        overwrite: true,
      };
    case 'computeStart':
      return {
        ...state,
        loading: true,
        inFlight: { requestId: action.requestId, continuation: action.continuation },
      };
    case 'computeSuccess': {
      if (state.inFlight === null || state.inFlight.requestId !== action.requestId) return state;
      const common = {
        ...state,
        display: String(action.result),
        loading: false,
        inFlight: null,
        error: null,
        overwrite: true,
      };
      switch (state.inFlight.continuation.kind) {
        case 'chain':
          return {
            ...common,
            accumulator: action.result,
            pendingOperation: state.inFlight.continuation.next,
            awaitingOperand: true,
          };
        case 'equals':
          return { ...common, accumulator: null, pendingOperation: null, awaitingOperand: false };
        case 'unary':
          return { ...common, awaitingOperand: false };
      }
      break;
    }
    case 'computeFailure':
      if (state.inFlight === null || state.inFlight.requestId !== action.requestId) return state;
      return { ...initialState, error: action.message };
  }
}
export function getComputeRequest(state: CalcState, key: KeyId): ComputeRequest | null {
  if (state.loading || state.error !== null) return null;
  if (isUnaryKey(key))
    return { operation: key, operands: [Number(state.display)], continuation: { kind: 'unary' } };
  if (key === 'equals' && state.pendingOperation !== null)
    return {
      operation: state.pendingOperation,
      operands: [state.accumulator!, Number(state.display)],
      continuation: { kind: 'equals' },
    };
  if (isBinaryKey(key) && state.pendingOperation !== null && !state.awaitingOperand)
    return {
      operation: state.pendingOperation,
      operands: [state.accumulator!, Number(state.display)],
      continuation: { kind: 'chain', next: key },
    };
  return null;
}
export function keyToAction(key: KeyId): CalcAction | null {
  if (isDigitKey(key)) return { type: 'digit', digit: key };
  if (key === 'decimal') return { type: 'decimal' };
  if (isBinaryKey(key)) return { type: 'operator', operation: key };
  if (key === 'clear') return { type: 'clear' };
  return null;
}
