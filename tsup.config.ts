import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/main.ts',
    'src/names/finnish.ts',
    'src/names/english.ts',
    'src/frequencies/passwords.ts',
    'src/frequencies/passwords-lite.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  minify: true,
  clean: true,
  splitting: false,
  target: 'es2015',
});
