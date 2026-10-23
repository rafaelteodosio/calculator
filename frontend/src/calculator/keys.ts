import type { BinaryOperation, UnaryOperation } from '../api/contract';
import type { Digit, KeyId } from './types';
export interface KeyDef {
  id: KeyId;
  label: string;
  ariaLabel: string;
  kind: 'digit' | 'decimal' | 'operator' | 'unary' | 'equals' | 'clear';
}
export const OPERATOR_SYMBOLS: Record<BinaryOperation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
};
export const isBinaryKey = (k: KeyId): k is BinaryOperation => Object.hasOwn(OPERATOR_SYMBOLS, k);
export const isUnaryKey = (k: KeyId): k is UnaryOperation => k === 'sqrt' || k === 'percent';
export const isDigitKey = (k: KeyId): k is Digit => /^\d$/.test(k);
export const KEYPAD: readonly KeyDef[] = [
  { id: 'clear', label: 'C', ariaLabel: 'Clear', kind: 'clear' },
  { id: 'sqrt', label: '√', ariaLabel: 'Square root', kind: 'unary' },
  { id: 'percent', label: '%', ariaLabel: 'Percent', kind: 'unary' },
  { id: 'divide', label: '÷', ariaLabel: 'Divide', kind: 'operator' },
  { id: '7', label: '7', ariaLabel: '7', kind: 'digit' },
  { id: '8', label: '8', ariaLabel: '8', kind: 'digit' },
  { id: '9', label: '9', ariaLabel: '9', kind: 'digit' },
  { id: 'multiply', label: '×', ariaLabel: 'Multiply', kind: 'operator' },
  { id: '4', label: '4', ariaLabel: '4', kind: 'digit' },
  { id: '5', label: '5', ariaLabel: '5', kind: 'digit' },
  { id: '6', label: '6', ariaLabel: '6', kind: 'digit' },
  { id: 'subtract', label: '−', ariaLabel: 'Subtract', kind: 'operator' },
  { id: '1', label: '1', ariaLabel: '1', kind: 'digit' },
  { id: '2', label: '2', ariaLabel: '2', kind: 'digit' },
  { id: '3', label: '3', ariaLabel: '3', kind: 'digit' },
  { id: 'add', label: '+', ariaLabel: 'Add', kind: 'operator' },
  { id: '0', label: '0', ariaLabel: '0', kind: 'digit' },
  { id: 'decimal', label: '.', ariaLabel: 'Decimal point', kind: 'decimal' },
  { id: 'power', label: '^', ariaLabel: 'Power', kind: 'operator' },
  { id: 'equals', label: '=', ariaLabel: 'Equals', kind: 'equals' },
];
