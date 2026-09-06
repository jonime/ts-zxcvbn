import { defineConfig } from 'tsdown';

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
  cjsDefault: false,
  target: 'es2015',
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.js' : '.mjs',
    dts: '.d.ts',
  }),
});
