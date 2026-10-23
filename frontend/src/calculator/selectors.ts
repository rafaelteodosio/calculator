import { OPERATOR_SYMBOLS } from './keys';
import type { CalcState } from './types';
export const countDigits = (s: string): number => (s.match(/[0-9]/g) ?? []).length;
export const selectExpression = (state: CalcState): string =>
  state.pendingOperation !== null
    ? `${String(state.accumulator)} ${OPERATOR_SYMBOLS[state.pendingOperation]}`
    : '';
export const displaySize = (text: string): 'lg' | 'md' | 'sm' =>
  text.length <= 9 ? 'lg' : text.length <= 13 ? 'md' : 'sm';
