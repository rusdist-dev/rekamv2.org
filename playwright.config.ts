import { defineConfig, devices } from '@playwright/test';

/* Assumes a server is already running on 3100 (`npm run build && npm start`).
   webServer is deliberately not configured: the rtk shell hook rewrites
   `next` invocations and swallows their output, so letting Playwright own the
   server lifecycle makes failures unreadable. */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* Four pages build a WebGL context and paint procedural canvases at up to
     4096px. Unbounded workers contend for the GPU and for the browser cap on
     live contexts, so the hero never settles and the audit times out — a flake
     that reads exactly like a real failure. */
  workers: 2,
  forbidOnly: !!process.env.CI,
  /* One retry even locally. The four hero pages each build a WebGL context and
     paint procedural canvases at up to 4096px; when two land on the two
     workers at once they contend for the GPU and the hero can miss its settle
     window. That is a resource flake, not a defect — verified by running the
     same audit alone, which reports zero violations. A retry keeps the suite
     honest without pretending the contention is not there. */
  retries: process.env.CI ? 2 : 1,
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
