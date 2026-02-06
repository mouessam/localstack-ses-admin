import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['test/**/*.{test,spec}.{ts,tsx}'],
      reporter: ['text', 'json', 'lcov'],
      thresholds: {
        lines: 80,
      },
    },
  },
});
