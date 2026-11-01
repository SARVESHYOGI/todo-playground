import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['vitest.setup.ts'],
    env: {
      VITE_API_BACKEND: 'fastapi',
      VITE_API_URL: process.env.FASTAPI_TEST_URL ?? 'http://localhost:8000',
    },
  },
})
