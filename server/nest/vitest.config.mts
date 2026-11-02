import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

// NestJS relies on `emitDecoratorMetadata` for constructor injection, which
// esbuild (vitest's default transformer) does not emit. unplugin-swc runs the
// same decorator settings as the build via .swcrc.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
  plugins: [swc.vite()],
})
