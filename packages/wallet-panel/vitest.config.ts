import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8'
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['src/**/*.test-d.ts', 'src/**/*.playwright.*'],
    testTimeout: 5000,
    hookTimeout: 5000,
    teardownTimeout: 2000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    isolate: true
  },
})
