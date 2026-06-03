import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';
import { baseUrl, browserProjects, headless, timeoutMs, workers } from './src/config/env';

const allProjects: PlaywrightTestConfig['projects'] = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
];

/**
 * Playwright configuration for the scientific calculator E2E framework.
 * Environment variables are loaded via src/config/env.ts (dotenv).
 */
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,
  timeout: timeoutMs,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: baseUrl,
    headless,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  outputDir: 'test-results',

  projects: allProjects.filter((p) =>
    browserProjects.includes(p.name as (typeof browserProjects)[number]),
  ),
});
