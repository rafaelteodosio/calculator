import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  calculate: vi.fn(),
}));
import { calculate, ApiError } from '../../api/client';
import { Calculator } from './Calculator';
import { useCalculator } from '../../calculator/useCalculator';
const api = vi.mocked(calculate);
beforeEach(() => {
  api.mockReset();
  api.mockResolvedValue(0);
});
function setup() {
  render(<Calculator />);
  const user = userEvent.setup();
  return async (...names: string[]) => {
    for (const name of names) await user.click(screen.getByRole('button', { name }));
  };
}
const display = () => screen.getByRole('status');
function deferred() {
  let resolve!: (value: number) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<number>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const shown = async (text: string) => waitFor(() => expect(display().textContent).toBe(text));
it('UI1 initial state', () => {
  setup();
  expect(display()).toHaveTextContent('0');
  expect(api).not.toHaveBeenCalled();
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false');
});
it('UI2 local input', async () => {
  const press = setup();
  await press('1', '2', '3');
  expect(display()).toHaveTextContent('123');
  expect(api).not.toHaveBeenCalled();
});
it('UI3 addition', async () => {
  api.mockResolvedValueOnce(5);
  const press = setup();
  await press('2', 'Add', '3', 'Equals');
  await shown('5');
  expect(api).toHaveBeenCalledExactlyOnceWith('add', [2, 3]);
  expect(screen.getByTestId('expression').textContent).toBe(' ');
});
it('UI4 left-to-right chaining', async () => {
  api.mockResolvedValueOnce(5).mockResolvedValueOnce(20);
  const press = setup();
  await press('2', 'Add', '3', 'Multiply');
  await shown('5');
  expect(api).toHaveBeenNthCalledWith(1, 'add', [2, 3]);
  expect(screen.getByTestId('expression')).toHaveTextContent('5 ×');
  expect(screen.getByRole('button', { name: 'Multiply' })).toHaveAttribute('aria-pressed', 'true');
  await press('4', 'Equals');
  await shown('20');
  expect(api).toHaveBeenNthCalledWith(2, 'multiply', [5, 4]);
});
it('UI5 operator replacement', async () => {
  const press = setup();
  await press('2', 'Add', 'Multiply', '3', 'Equals');
  expect(api).toHaveBeenCalledExactlyOnceWith('multiply', [2, 3]);
});
it('UI6 square root', async () => {
  api.mockResolvedValueOnce(3);
  const press = setup();
  await press('9', 'Square root');
  await shown('3');
  expect(api).toHaveBeenCalledWith('sqrt', [9]);
});
it('UI7 percent', async () => {
  api.mockResolvedValueOnce(0.5);
  const press = setup();
  await press('5', '0', 'Percent');
  await shown('0.5');
  expect(api).toHaveBeenCalledWith('percent', [50]);
});
it('UI8 power', async () => {
  api.mockResolvedValueOnce(1024);
  const press = setup();
  await press('2', 'Power', '1', '0', 'Equals');
  await shown('1024');
  expect(api).toHaveBeenCalledWith('power', [2, 10]);
});
it('UI9 disables all but clear until response', async () => {
  const d = deferred();
  api.mockReturnValueOnce(d.promise);
  const press = setup();
  await press('2', 'Add', '3', 'Equals');
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
  for (const b of screen.getAllByRole('button'))
    if (b.getAttribute('aria-label') === 'Clear') expect(b).toBeEnabled();
    else expect(b).toBeDisabled();
  await act(async () => d.resolve(5));
  expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false');
  for (const b of screen.getAllByRole('button')) expect(b).toBeEnabled();
});
it('UI10 clear discards late response', async () => {
  const d = deferred();
  api.mockReturnValueOnce(d.promise);
  const press = setup();
  await press('2', 'Add', '3', 'Equals', 'Clear');
  await shown('0');
  await act(async () => d.resolve(99));
  expect(display().textContent).toBe('0');
  expect(screen.getByRole('button', { name: 'Equals' })).toBeEnabled();
});
it('UI11 double click makes one request', async () => {
  const d = deferred();
  api.mockReturnValueOnce(d.promise);
  const press = setup();
  await press('2', 'Add', '3');
  await userEvent.setup().dblClick(screen.getByRole('button', { name: 'Equals' }));
  expect(api).toHaveBeenCalledExactlyOnceWith('add', [2, 3]);
  await act(async () => d.resolve(5));
  await shown('5');
});
it('UI12 division error display', async () => {
  api.mockRejectedValueOnce(new ApiError('DIVISION_BY_ZERO', 'secret', 422));
  const press = setup();
  await press('5', 'Divide', '0', 'Equals');
  await shown('Cannot divide by zero');
  expect(display()).toHaveAttribute('data-error', 'true');
});
it('UI13 maps errors and hides server messages', async () => {
  const press = setup();
  for (const [err, text] of [
    [new ApiError('NEGATIVE_SQRT', 'secret'), 'Invalid input'],
    [new ApiError('NON_FINITE_RESULT', 'secret'), 'Math error'],
    [new ApiError('NETWORK_ERROR', 'secret'), 'Network error'],
    [new ApiError('VALIDATION_ERROR', 'secret'), 'Error'],
    [new Error('secret'), 'Error'],
  ] as const) {
    api.mockRejectedValueOnce(err);
    await press('Clear', '9', 'Square root');
    await shown(text);
  }
});
it('UI14 errors ignore computation keys', async () => {
  api.mockRejectedValueOnce(new ApiError('DIVISION_BY_ZERO', 'x'));
  const press = setup();
  await press('5', 'Divide', '0', 'Equals');
  await shown('Cannot divide by zero');
  await press('Add', 'Square root', 'Equals');
  expect(api).toHaveBeenCalledTimes(1);
  expect(display()).toHaveTextContent('Cannot divide by zero');
});
it('UI15 digit recovers after error', async () => {
  api.mockRejectedValueOnce(new Error('x'));
  const press = setup();
  await press('9', 'Square root');
  await shown('Error');
  await press('7');
  expect(display().textContent).toBe('7');
  expect(display()).not.toHaveAttribute('data-error');
});
it('UI16 clear recovers after error', async () => {
  api.mockRejectedValueOnce(new Error('x'));
  const press = setup();
  await press('9', 'Square root');
  await shown('Error');
  await press('Clear');
  await shown('0');
});
it('UI17 equals without pending operation', async () => {
  const press = setup();
  await press('5', 'Equals');
  expect(api).not.toHaveBeenCalled();
  expect(display().textContent).toBe('5');
});
it('UI18 uses negative result in next call', async () => {
  api.mockResolvedValueOnce(-2).mockResolvedValueOnce(-6);
  const press = setup();
  await press('3', 'Subtract', '5', 'Equals');
  await shown('-2');
  await press('Multiply', '3', 'Equals');
  await shown('-6');
  expect(api).toHaveBeenNthCalledWith(2, 'multiply', [-2, 3]);
});
it('UI19 long results retain precision and exponent notation', async () => {
  api.mockResolvedValueOnce(1.23456789012346e21);
  const press = setup();
  await press('9', 'Square root');
  await shown('1.23456789012346e+21');
  expect(display()).toHaveAttribute('data-size', 'sm');
});
it('UI20 limits input to 15 digits', async () => {
  const press = setup();
  await press(...Array<string>(16).fill('9'));
  expect(display().textContent).toBe('9'.repeat(15));
});
it('UI21 ignores repeated decimal', async () => {
  const press = setup();
  await press('Decimal point', 'Decimal point', '5');
  expect(display().textContent).toBe('0.5');
});
it('uses latest synchronous state and guards repeated presses before render', async () => {
  const d = deferred();
  api.mockReturnValueOnce(d.promise);
  const { result } = renderHook(() => useCalculator());
  act(() => {
    result.current.press('2');
    result.current.press('add');
    result.current.press('3');
    result.current.press('equals');
    result.current.press('equals');
    result.current.press('7');
  });
  expect(api).toHaveBeenCalledExactlyOnceWith('add', [2, 3]);
  await act(async () => d.resolve(5));
  expect(result.current.state.display).toBe('5');
});
it('stale failure cannot overwrite a newer result', async () => {
  const old = deferred();
  api.mockReturnValueOnce(old.promise).mockResolvedValueOnce(3);
  const press = setup();
  await press('9', 'Square root', 'Clear', '9', 'Square root');
  await shown('3');
  await act(async () => old.reject(new Error('late')));
  expect(display().textContent).toBe('3');
});
