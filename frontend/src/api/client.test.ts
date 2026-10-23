import { afterEach, it, expect, vi } from 'vitest';
import { calculate, ApiError, REQUEST_TIMEOUT_MS } from './client';
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fetchResponse = (r: Response) => {
  const mock = vi.fn().mockResolvedValue(r);
  vi.stubGlobal('fetch', mock);
  return mock;
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('FC1 sends the exact API request', async () => {
  const mock = fetchResponse(response({ operation: 'add', operands: [2, 3], result: 5 }));
  expect(await calculate('add', [2, 3])).toBe(5);
  expect(mock).toHaveBeenCalledExactlyOnceWith('/api/v1/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ operation: 'add', operands: [2, 3] }),
    signal: expect.any(AbortSignal),
  });
});
it('FC2 preserves API error metadata', async () => {
  fetchResponse(response({ error: { code: 'DIVISION_BY_ZERO', message: 'server message' } }, 422));
  const err = await calculate('divide', [1, 0]).catch((e: unknown) => e);
  expect(err).toBeInstanceOf(ApiError);
  expect(err).toBeInstanceOf(Error);
  expect(err).toMatchObject({
    name: 'ApiError',
    code: 'DIVISION_BY_ZERO',
    message: 'server message',
    status: 422,
  });
});
it('FC3 handles validation details', async () => {
  fetchResponse(
    response(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'invalid',
          details: [{ path: 'operands.0', message: 'invalid' }],
        },
      },
      400,
    ),
  );
  await expect(calculate('add', [2, 3])).rejects.toMatchObject({
    code: 'VALIDATION_ERROR',
    status: 400,
  });
});
it('FC4 preserves mathematical error codes', async () => {
  for (const code of ['NEGATIVE_SQRT', 'NON_FINITE_RESULT']) {
    fetchResponse(response({ error: { code, message: 'math' } }, 422));
    await expect(calculate('sqrt', [-1])).rejects.toMatchObject({ code, status: 422 });
  }
});
it('FC5 maps fetch rejection', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  await expect(calculate('add', [1, 2])).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
    status: undefined,
  });
});
it('FC6 aborts after ten seconds', async () => {
  vi.useFakeTimers();
  let signal: AbortSignal | undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url: unknown, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal = init.signal as AbortSignal;
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    ),
  );
  const check = expect(calculate('add', [1, 2])).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
    status: undefined,
  });
  await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
  await check;
  expect(signal?.aborted).toBe(true);
});
it('FC7 handles proxy HTML', async () => {
  fetchResponse(new Response('<html>Bad Gateway</html>', { status: 502 }));
  await expect(calculate('add', [1, 2])).rejects.toMatchObject({
    code: 'UNEXPECTED_RESPONSE',
    status: 502,
  });
});
it('FC8 rejects unexpected error bodies', async () => {
  for (const body of [{ foo: 1 }, null, { error: null }, { error: { code: 42, message: 'x' } }]) {
    fetchResponse(response(body, 500));
    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      status: 500,
    });
  }
});
it('FC9 rejects invalid successful results', async () => {
  for (const body of [{ result: '5' }, {}, { result: null }, null]) {
    fetchResponse(response(body));
    await expect(calculate('add', [1, 2])).rejects.toMatchObject({
      code: 'UNEXPECTED_RESPONSE',
      status: 200,
    });
  }
  fetchResponse(new Response('{"result":1e309}'));
  await expect(calculate('add', [1, 2])).rejects.toMatchObject({
    code: 'UNEXPECTED_RESPONSE',
    status: 200,
  });
});
it('FC10 rejects non-JSON success', async () => {
  fetchResponse(new Response('not json'));
  await expect(calculate('add', [1, 2])).rejects.toMatchObject({
    code: 'UNEXPECTED_RESPONSE',
    status: 200,
  });
});
it('FC11 clears the timeout after success', async () => {
  vi.useFakeTimers();
  fetchResponse(response({ result: 5 }));
  await calculate('add', [2, 3]);
  expect(vi.getTimerCount()).toBe(0);
});
