import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  target: 'es5', // Use ES2018 for better compatibility with modern dependencies
  minify: false, // Keep readable for debugging
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
