import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /^(\.\/.*)\.js$/,
        replacement: '$1',
      },
    ],
  },
});
