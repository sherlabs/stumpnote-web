import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // `server-only` throws outside the React server condition; tests import server modules directly.
    alias: { 'server-only': path.resolve(import.meta.dirname, 'tests/unit/stubs/server-only.ts') },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
