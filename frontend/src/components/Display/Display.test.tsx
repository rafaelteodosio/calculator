import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Display } from './Display';
it('DS1 announces value', () => {
  render(<Display value="123" error={null} expression="" />);
  expect(screen.getByRole('status')).toHaveTextContent('123');
  expect(screen.getByRole('status')).toHaveAttribute('data-size', 'lg');
  expect(screen.getByRole('status')).not.toHaveAttribute('data-error');
});
it('DS2 shows error text', () => {
  render(<Display value="0" error="Math error" expression="" />);
  expect(screen.getByRole('status')).toHaveTextContent('Math error');
  expect(screen.getByRole('status')).toHaveAttribute('data-error', 'true');
});
it('DS3 secondary expression', () => {
  render(<Display value="2" error={null} expression="2 +" />);
  expect(screen.getByTestId('expression')).toHaveTextContent('2 +');
});
it('DS4 shrinks long values', () => {
  render(<Display value={'1'.repeat(22)} error={null} expression="" />);
  expect(screen.getByRole('status')).toHaveAttribute('data-size', 'sm');
});
