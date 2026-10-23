import path from 'node:path';
import { it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';
it('C1 defaults configuration', () =>
  expect(loadConfig({})).toEqual({ port: 3000, nodeEnv: 'development', staticDir: undefined }));
it('C2 reads production configuration', () =>
  expect(loadConfig({ PORT: '8081', NODE_ENV: 'production' })).toMatchObject({
    port: 8081,
    nodeEnv: 'production',
  }));
it('C3 defaults an empty port', () => expect(loadConfig({ PORT: '' }).port).toBe(3000));
it('C4 rejects invalid ports', () => {
  for (const PORT of ['abc', '0', '70000', '3000.5', '-1', ' 3000', 'Infinity'])
    expect(() => loadConfig({ PORT })).toThrow(/Invalid PORT/);
});
it('C5 rejects an unknown environment', () =>
  expect(() => loadConfig({ NODE_ENV: 'staging' })).toThrow(/Invalid NODE_ENV/));
it('C6 supports test environment and empty default', () => {
  expect(loadConfig({ NODE_ENV: 'test' }).nodeEnv).toBe('test');
  expect(loadConfig({ NODE_ENV: '' }).nodeEnv).toBe('development');
});
it('C7 ignores empty static directory', () =>
  expect(loadConfig({ STATIC_DIR: '' }).staticDir).toBeUndefined());
it('C8 resolves relative static directory', () =>
  expect(loadConfig({ STATIC_DIR: 'relative/dir' }).staticDir).toBe(path.resolve('relative/dir')));
it('C9 resolves absolute static directory', () =>
  expect(loadConfig({ STATIC_DIR: '/abs/dir' }).staticDir).toBe(path.resolve('/abs/dir')));
