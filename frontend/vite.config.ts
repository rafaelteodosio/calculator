import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const apiProxy = { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy: apiProxy },
  preview: { port: 4173, strictPort: true, proxy: apiProxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Since Vitest 3, restoreMocks only restores vi.spyOn spies; mockReset also clears
    // vi.fn() call history and queued values between tests.
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/api/contract.ts',
        'src/calculator/types.ts',
      ],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
