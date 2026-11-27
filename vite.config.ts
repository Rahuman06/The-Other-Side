import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const isPoki = mode === 'poki';

  return {
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    cacheDir: './node_modules/.vite',
    plugins: [
      {
        name: 'poki-sdk-html-transform',
        transformIndexHtml(html) {
          if (!isPoki) {
            return html;
          }
          const pokiTag =
            '  <script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>\n';
          return html.replace('</head>', `${pokiTag}</head>`);
        },
      },
    ],
    build: {
      outDir: isPoki ? 'dist-poki' : 'dist',
      emptyOutDir: true,
      target: 'esnext',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: false,
    },
    // @ts-expect-error vitest options
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./tests/setup.ts'],
      pool: 'forks',
      testTimeout: 35000,
      include: [
        'tests/unit/**/*.test.ts',
        'tests/integration/**/*.test.ts',
        'tests/levels/**/*.test.ts',
      ],
    },
  };
});
