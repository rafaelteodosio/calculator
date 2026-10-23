import { it, expect } from 'vitest';
import { selectExpression, countDigits, displaySize } from './selectors';
import { initialState, keyToAction } from './reducer';
it('S1 no pending expression', () => expect(selectExpression(initialState)).toBe(''));
it('S2 expression symbols', () => {
  for (const [accumulator, pendingOperation, result] of [
    [2, 'add', '2 +'],
    [-2, 'multiply', '-2 ×'],
    [2, 'power', '2 ^'],
  ] as const)
    expect(selectExpression({ ...initialState, accumulator, pendingOperation })).toBe(result);
});
it('S3 display sizing boundaries', () => {
  for (const [s, size] of [
    ['0', 'lg'],
    ['9'.repeat(9), 'lg'],
    ['9'.repeat(10), 'md'],
    ['9'.repeat(13), 'md'],
    ['9'.repeat(14), 'sm'],
    ['-1.7976931348623157e+308', 'sm'],
  ])
    expect(displaySize(s!)).toBe(size);
});
it('S4 counts decimal and exponent digits', () => {
  for (const [s, n] of [
    ['12.5', 3],
    ['-0.05', 3],
    ['1e+21', 3],
    ['', 0],
  ] as const)
    expect(countDigits(s)).toBe(n);
});
it('S5 maps local keys', () => {
  expect(keyToAction('7')).toEqual({ type: 'digit', digit: '7' });
  expect(keyToAction('decimal')).toEqual({ type: 'decimal' });
  expect(keyToAction('add')).toEqual({ type: 'operator', operation: 'add' });
  expect(keyToAction('clear')).toEqual({ type: 'clear' });
  for (const k of ['equals', 'sqrt', 'percent'] as const) expect(keyToAction(k)).toBeNull();
});
