import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  globalTimeout: 360_000,
  expect: { timeout: 5_000 },
  reporter: 'list',
  outputDir: 'test-results',
  // Servers and Chromium are owned by the disposable local fixture, never reused.
});
