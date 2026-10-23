import { it, expect, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Request, Response } from 'express';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { requestLogFormat } from '../src/middleware/requestLogger.js';
import { createApp } from '../src/app.js';
function stubs(headersSent = false) {
  const status = vi.fn();
  const json = vi.fn();
  const res = { headersSent, status, json } as unknown as Response;
  status.mockReturnValue(res);
  return { status, json, res, next: vi.fn(), req: {} as Request };
}
it('M1 environment log formats', () => {
  expect(requestLogFormat('development')).toBe('dev');
  expect(requestLogFormat('production')).toBe('combined');
  expect(requestLogFormat('test')).toBeNull();
});
it('M2 delegates after headers', () => {
  const s = stubs(true);
  const err = new Error('sent');
  errorHandler(err, s.req, s.res, s.next);
  expect(s.next).toHaveBeenCalledWith(err);
  expect(s.status).not.toHaveBeenCalled();
});
it('M3 sanitizes thrown non-errors and unknown parser errors', () => {
  for (const err of ['boom', { type: 'unknown' }]) {
    const s = stubs();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(err, s.req, s.res, s.next);
    expect(s.status).toHaveBeenCalledWith(500);
    expect(s.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  }
});
it('M4 fails fast with missing index', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'empty-spa-'));
  try {
    expect(() => createApp({ port: 3000, nodeEnv: 'test', staticDir: dir })).toThrow(
      /does not contain index.html/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
it('M5 constructs production and development apps', () => {
  for (const nodeEnv of ['production', 'development'] as const)
    expect(() => createApp({ port: 3000, nodeEnv })).not.toThrow();
});
it('M6 maps request transport errors', () => {
  for (const type of ['request.aborted', 'request.size.invalid']) {
    const s = stubs();
    errorHandler({ type }, s.req, s.res, s.next);
    expect(s.status).toHaveBeenCalledWith(400);
    expect(s.json).toHaveBeenCalledWith({
      error: { code: 'MALFORMED_JSON', message: 'Request body is not valid JSON.' },
    });
  }
});
