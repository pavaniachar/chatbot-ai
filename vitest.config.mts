import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Unit tests only. `e2e/` holds Playwright specs, which Vitest would
    // otherwise collect and fail to run.
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
