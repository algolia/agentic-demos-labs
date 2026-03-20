import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    pool: 'vmThreads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.{ts,js,mts}',
        '**/types/**',
        '**/*.d.ts',
        'src/app/**/layout.tsx',
        'src/app/**/template.tsx',
      ],
      // Thresholds will be enabled once we reach Phase 1 coverage (~30%)
      // thresholds: {
      //   lines: 30,
      //   branches: 25,
      //   functions: 30,
      //   statements: 30,
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
