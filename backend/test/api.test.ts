import request from 'supertest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { it, expect, vi, afterAll } from 'vitest';
import type { ApiErrorBody } from '../src/contract.js';
vi.mock('../src/calculator.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/calculator.js')>();
  return { ...actual, calculate: vi.fn(actual.calculate) };
});
import { calculate } from '../src/calculator.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
const app = createApp(loadConfig({ NODE_ENV: 'test' }));
const calc = (body: object) => request(app).post('/api/v1/calculate').send(body);
const raw = (body: string, type = 'application/json') =>
  request(app).post('/api/v1/calculate').set('Content-Type', type).send(body);
const paths = (res: { body: unknown }) =>
  (res.body as ApiErrorBody).error.details?.map((d) => d.path) ?? [];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spa-'));
fs.mkdirSync(path.join(dir, 'assets'));
fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>spa</title>');
fs.writeFileSync(path.join(dir, 'assets/app.js'), 'export const app = 1;');
const spa = createApp({ ...loadConfig({ NODE_ENV: 'test' }), staticDir: dir });
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));
it('1 health', async () => {
  const r = await request(app).get('/api/v1/health');
  expect(r.status).toBe(200);
  expect(r.body).toEqual({ status: 'ok' });
});
it('2 discover operations', async () => {
  const r = await request(app).get('/api/v1/operations');
  expect(r.status).toBe(200);
  expect(r.body.operations.map((o: { name: string; arity: number }) => [o.name, o.arity])).toEqual([
    ['add', 2],
    ['subtract', 2],
    ['multiply', 2],
    ['divide', 2],
    ['power', 2],
    ['sqrt', 1],
    ['percent', 1],
  ]);
});
it.each([
  [3, 'add', [2, 3], 5],
  [4, 'add', [0.1, 0.2], 0.3],
  [5, 'subtract', [0.3, 0.1], 0.2],
  [6, 'multiply', [-1, 0], 0],
  [7, 'divide', [10, 4], 2.5],
  [8, 'divide', [1, 3], 0.333333333333333],
  [11, 'power', [2, 10], 1024],
  [12, 'power', [2, -1], 0.5],
  [13, 'power', [0, 0], 1],
  [18, 'add', [Number.MAX_VALUE, 0], Number.MAX_VALUE],
  [19, 'sqrt', [9], 3],
  [20, 'sqrt', [2], 1.4142135623731],
  [22, 'percent', [50], 0.5],
  ['A15', 'multiply', [1e-200, 1e-200], 0],
  ['A16', 'percent', [-50], -0.5],
  ['A17', 'add', [Number('123456789012345678'), 0], 123456789012346000],
] as const)('%s successful calculation', async (_id, operation, operands, result) => {
  const r = await calc({ operation, operands });
  expect(r.status).toBe(200);
  expect(r.body).toEqual({ operation, operands, result });
});
it.each([
  [9, 'divide', [5, 0], 422, 'DIVISION_BY_ZERO'],
  [10, 'divide', [0, 0], 422, 'DIVISION_BY_ZERO'],
  [14, 'power', [0, -1], 422, 'NON_FINITE_RESULT'],
  [15, 'power', [10, 400], 422, 'NON_FINITE_RESULT'],
  [16, 'power', [-8, 0.5], 422, 'NON_FINITE_RESULT'],
  [17, 'multiply', [1e308, 10], 422, 'NON_FINITE_RESULT'],
  [21, 'sqrt', [-4], 422, 'NEGATIVE_SQRT'],
  [23, 'modulo', [1, 2], 400, 'UNSUPPORTED_OPERATION'],
  [24, 'ADD', [1, 2], 400, 'UNSUPPORTED_OPERATION'],
  [25, 'sqrt', [1, 2], 400, 'INVALID_OPERAND_COUNT'],
  [26, 'add', [1], 400, 'INVALID_OPERAND_COUNT'],
  [27, 'add', [], 400, 'INVALID_OPERAND_COUNT'],
  [28, 'add', ['2', 3], 400, 'VALIDATION_ERROR'],
  [33, 'modulo', ['x'], 400, 'VALIDATION_ERROR'],
  ['A5', '', [1, 2], 400, 'VALIDATION_ERROR'],
  ['A6', 123, [1, 2], 400, 'VALIDATION_ERROR'],
  ['A7', 'add', '1,2', 400, 'VALIDATION_ERROR'],
  ['A11', 'percent', [1, 2], 400, 'INVALID_OPERAND_COUNT'],
  ['A14', 'divide', [1e308, 1e-10], 422, 'NON_FINITE_RESULT'],
] as const)('%s rejects invalid calculation', async (_id, operation, operands, status, code) => {
  const r = await calc({ operation, operands });
  expect(r.status).toBe(status);
  expect(r.body.error.code).toBe(code);
  if (_id === 28) expect(paths(r)).toContain('operands.0');
  if (_id === 'A5' || _id === 'A6') expect(paths(r)).toContain('operation');
  if (_id === 'A7') expect(paths(r)).toContain('operands');
  if (_id === 'A11')
    expect(r.body.error.message).toBe("Operation 'percent' expects 1 operand but received 2.");
});
it('29 rejects boolean and null operands', async () => {
  for (const n of [true, null]) {
    const r = await calc({ operation: 'add', operands: [n, 3] });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
  }
});
it('30 rejects overflowing JSON number', async () => {
  const r = await raw('{"operation":"add","operands":[1e309,1]}');
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
});
it('31 missing operation', async () => {
  const r = await calc({ operands: [1, 2] });
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
  expect(paths(r)).toContain('operation');
});
it('32 rejects extra keys', async () => {
  const r = await calc({ operation: 'add', operands: [1, 2], extra: 1 });
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
});
it('34 rejects top-level arrays', async () => {
  const r = await calc([1, 2]);
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
});
it.each([
  [35, '{"operation":'],
  [36, 'null'],
] as const)('%s malformed JSON', async (_id, s) => {
  const r = await raw(s);
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('MALFORMED_JSON');
});
it('37 unsupported media type', async () => {
  const r = await raw('hello', 'text/plain');
  expect(r.status).toBe(415);
  expect(r.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
});
it('38 body limit', async () => {
  const r = await calc({ operation: 'a'.repeat(11000), operands: [] });
  expect(r.status).toBe(413);
  expect(r.body.error.code).toBe('PAYLOAD_TOO_LARGE');
});
it('39 calculate method', async () => {
  const r = await request(app).get('/api/v1/calculate');
  expect(r.status).toBe(405);
  expect(r.headers.allow).toBe('POST');
  expect(r.body.error.code).toBe('METHOD_NOT_ALLOWED');
});
it('40 health method', async () => {
  const r = await request(app).post('/api/v1/health');
  expect(r.status).toBe(405);
  expect(r.headers.allow).toBe('GET');
  expect(r.body.error.code).toBe('METHOD_NOT_ALLOWED');
});
it('41 unknown API routes', async () => {
  for (const p of ['/api/v1/nope', '/api/v2/calculate']) {
    const r = await request(app).get(p);
    expect(r.status).toBe(404);
    expect(r.body.error.code).toBe('NOT_FOUND');
    expect(r.type).toBe('application/json');
  }
});
it('42 no cache or powered-by', async () => {
  const r = await request(app).get('/api/v1/health');
  expect(r.headers['cache-control']).toBe('no-store');
  expect(r.headers['x-powered-by']).toBeUndefined();
});
it('43 hides internal exceptions', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(calculate).mockImplementationOnce(() => {
    throw new Error('boom: secret internals');
  });
  const r = await calc({ operation: 'add', operands: [1, 2] });
  expect(r.status).toBe(500);
  expect(r.body).toEqual({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  });
  expect(JSON.stringify(r.body)).not.toMatch(/boom|at /);
  expect(Object.keys(r.body.error)).toEqual(['code', 'message']);
  expect(spy).toHaveBeenCalledTimes(1);
});
it('44 serves SPA without swallowing API 404', async () => {
  for (const p of ['/', '/some/client/route']) {
    const r = await request(spa).get(p);
    expect(r.status).toBe(200);
    expect(r.type).toBe('text/html');
  }
  const r = await request(spa).get('/api/v1/nope');
  expect(r.status).toBe(404);
  expect(r.type).toBe('application/json');
});
it('A1 no body or content type', async () => {
  const r = await request(app).post('/api/v1/calculate');
  expect(r.status).toBe(415);
  expect(r.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
});
it('A2 UTF-8 parameters', async () => {
  const r = await raw('{"operation":"add","operands":[2,3]}', 'application/json; charset=utf-8');
  expect(r.status).toBe(200);
  expect(r.body.result).toBe(5);
});
it('A3 media type checked before length', async () => {
  const r = await raw('x'.repeat(11000), 'text/plain');
  expect(r.status).toBe(415);
});
it('A4 empty object paths', async () => {
  const r = await calc({});
  expect(r.status).toBe(400);
  expect(r.body.error.code).toBe('VALIDATION_ERROR');
  expect(paths(r)).toEqual(['operation', 'operands']);
});
it('A8 compound operands', async () => {
  for (const n of [[1], {}]) {
    const r = await calc({ operation: 'add', operands: [n, 2] });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
    expect(paths(r)).toContain('operands.0');
  }
});
it('A9 prototype operations', async () => {
  for (const operation of ['constructor', 'toString']) {
    const r = await calc({ operation, operands: [1, 2] });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('UNSUPPORTED_OPERATION');
  }
});
it('A10 supported names in message', async () => {
  const r = await calc({ operation: 'modulo', operands: [1, 2] });
  expect(r.body.error.message).toBe(
    "Unsupported operation 'modulo'. Supported operations: add, subtract, multiply, divide, power, sqrt, percent.",
  );
});
it('A12 rejects negative zero divisor', async () => {
  const r = await raw('{"operation":"divide","operands":[1,-0]}');
  expect(r.status).toBe(422);
  expect(r.body.error.code).toBe('DIVISION_BY_ZERO');
});
it('A13 rejects arithmetic overflow', async () => {
  for (const [operation, operands] of [
    ['add', [1e308, 1e308]],
    ['subtract', [-1e308, 1e308]],
  ]) {
    const r = await calc({ operation, operands });
    expect(r.status).toBe(422);
    expect(r.body.error.code).toBe('NON_FINITE_RESULT');
  }
});
it('A18 response key order and content type', async () => {
  const r = await calc({ operation: 'add', operands: [2, 3] });
  expect(Object.keys(r.body)).toEqual(['operation', 'operands', 'result']);
  expect(typeof r.body.result).toBe('number');
  expect(r.headers['content-type']).toMatch(/application\/json; charset=utf-8/);
});
it('A19 minimal error envelope', async () => {
  const r = await calc({ operation: 'divide', operands: [1, 0] });
  expect(Object.keys(r.body)).toEqual(['error']);
  expect(r.body.error).not.toHaveProperty('details');
});
it('A20 explicit OPTIONS and PUT handling', async () => {
  const a = await request(app).options('/api/v1/calculate');
  const b = await request(app).put('/api/v1/operations');
  expect(a.status).toBe(405);
  expect(a.headers.allow).toBe('POST');
  expect(b.status).toBe(405);
  expect(b.headers.allow).toBe('GET');
});
it('A21 full path in method error', async () => {
  const r = await request(app).get('/api/v1/calculate?secret=1');
  expect(r.body.error.message).toBe('Method GET not allowed on /api/v1/calculate.');
});
it('A22 HEAD health', async () =>
  expect((await request(app).head('/api/v1/health')).status).toBe(200));
it('A23 /api itself and unknown POST', async () => {
  const r = await request(app).post('/api/v1/nope');
  expect(r.status).toBe(404);
  expect(r.body.error.message).toBe('Route POST /api/v1/nope not found.');
  expect((await request(app).get('/api')).body.error.code).toBe('NOT_FOUND');
});
it('A24 errors carry no-store', async () => {
  for (const r of [
    await request(app).get('/api/nope'),
    await calc({ operation: 'divide', operands: [1, 0] }),
  ])
    expect(r.headers['cache-control']).toBe('no-store');
});
it('A25 security headers', async () => {
  const r = await request(app).get('/api/v1/health');
  expect(r.headers['x-content-type-options']).toBe('nosniff');
  expect(r.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
});
it('A26 no implicit SPA', async () => expect((await request(app).get('/')).status).toBe(404));
it('A27 real assets', async () => {
  const r = await request(spa).get('/assets/app.js');
  expect(r.status).toBe(200);
  expect(r.type).toMatch(/javascript/);
});
it('A28 HEAD SPA', async () => expect((await request(spa).head('/')).status).toBe(200));
it('A29 SPA ignores POST', async () =>
  expect((await request(spa).post('/some/client/route')).status).toBe(404));
it('A30 static app health', async () => {
  const r = await request(spa).get('/api/v1/health');
  expect(r.status).toBe(200);
  expect(r.type).toBe('application/json');
});
it('A31 queries do not alter routing', async () => {
  const r = await request(app)
    .post('/api/v1/calculate?x=1')
    .send({ operation: 'add', operands: [2, 3] });
  expect(r.status).toBe(200);
  expect(r.body.result).toBe(5);
});
it('A32 unsupported charset', async () => {
  const r = await raw('{"operation":"add","operands":[2,3]}', 'application/json; charset=latin1');
  expect(r.status).toBe(415);
  expect(r.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
});
it('A33 unsupported encoding', async () => {
  const r = await request(app)
    .post('/api/v1/calculate')
    .set('Content-Type', 'application/json')
    .set('Content-Encoding', 'bogus')
    .send('{}');
  expect(r.status).toBe(415);
  expect(r.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
});
