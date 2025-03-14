import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@elizaos/core'],
  noExternal: [],
  target: 'node18',
  outDir: 'dist',
});