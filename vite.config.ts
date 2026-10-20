import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./frontend', import.meta.url)),
  plugins: [react()],
  // This technical shell has no client routes; forbidden paths must not get
  // a misleading successful SPA fallback.
  appType: 'mpa',
  publicDir: false,
  envDir: false,
  // No application environment variables are exposed to the browser.
  envPrefix: [],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8787' },
    fs: {
      strict: true,
      allow: [
        fileURLToPath(new URL('./frontend/index.html', import.meta.url)),
        fileURLToPath(new URL('./frontend/src', import.meta.url)),
        fileURLToPath(new URL('./src/shared', import.meta.url)),
      ],
      deny: [
        '**/.git/**', '**/.env*', '**/.dev.vars*', '**/*.{crt,pem}',
        '**/content/**', '**/docs/**', '**/_bmad/**', '**/.agents/**',
        '**/.wrangler/**', '**/.venv/**', '**/venv/**', '**/coverage/**',
        '**/public/**',
      ],
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/frontend', import.meta.url)),
    emptyOutDir: true,
  },
});
