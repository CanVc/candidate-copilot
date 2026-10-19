import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./frontend', import.meta.url)),
  plugins: [react()],
  publicDir: false,
  envDir: false,
  // No application environment variables are exposed to the browser.
  envPrefix: [],
  build: {
    outDir: fileURLToPath(new URL('./dist/frontend', import.meta.url)),
    emptyOutDir: true,
  },
});
