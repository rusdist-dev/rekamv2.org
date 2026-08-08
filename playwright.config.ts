import { defineConfig, devices } from '@playwright/test';

/* Assumes a server is already running on 3100 (`npm run build && npm start`).
   webServer is deliberately not configured: the rtk shell hook rewrites
   `next` invocations and swallows their output, so letting Playwright own the
   server lifecycle makes failures unreadable. */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
});
