import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    // mockReset clears vi.fn() history between tests; in Vitest 3 it resets to the implementation
    // passed to vi.fn(impl), so the api.test.ts wrapper keeps the real calculate().
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // server.ts only wires listen/signals (covered by the manual smoke test in M3);
      // contract.ts is types-only and compiles to an empty module.
      exclude: ['src/server.ts', 'src/contract.ts'],
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
