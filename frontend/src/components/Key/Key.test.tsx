import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Key } from './Key';
import { KEYPAD } from '../../calculator/keys';
it('K1 accessible operator and click', async () => {
  const onPress = vi.fn();
  render(<Key def={KEYPAD[15]!} onPress={onPress} disabled={false} />);
  const b = screen.getByRole('button', { name: 'Add' });
  expect(b).toHaveAttribute('type', 'button');
  await userEvent.setup().click(b);
  expect(onPress).toHaveBeenCalledWith('add');
});
it('K2 digit has no pressed state', () => {
  render(<Key def={KEYPAD[4]!} onPress={vi.fn()} disabled={false} />);
  expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
});
it('K3 disabled click ignored', async () => {
  const onPress = vi.fn();
  render(<Key def={KEYPAD[0]!} onPress={onPress} disabled />);
  await userEvent.setup().click(screen.getByRole('button'));
  expect(onPress).not.toHaveBeenCalled();
});
