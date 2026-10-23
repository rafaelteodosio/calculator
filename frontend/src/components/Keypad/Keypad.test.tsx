import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Keypad } from './Keypad';
it('K4 twenty keys in fixed order', () => {
  render(<Keypad onPress={vi.fn()} disabled={false} activeOperation={null} />);
  expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
    'Clear',
    'Square root',
    'Percent',
    'Divide',
    '7',
    '8',
    '9',
    'Multiply',
    '4',
    '5',
    '6',
    'Subtract',
    '1',
    '2',
    '3',
    'Add',
    '0',
    'Decimal point',
    'Power',
    'Equals',
  ]);
});
it('K5 clear remains enabled', () => {
  render(<Keypad onPress={vi.fn()} disabled activeOperation={null} />);
  expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  expect(screen.getAllByRole('button').filter((b) => b.hasAttribute('disabled'))).toHaveLength(19);
});
it('K6 active operator state', () => {
  render(<Keypad onPress={vi.fn()} disabled={false} activeOperation="add" />);
  expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'true');
  for (const name of ['Subtract', 'Multiply', 'Divide', 'Power'])
    expect(screen.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
});
