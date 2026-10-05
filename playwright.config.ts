import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    ...devices['Desktop Chrome'],
    launchOptions: { executablePath: process.env.CHROMIUM_EXECUTABLE },
  },
  webServer: {
    // --ignore-lock keeps `astro preview` in the foreground: Astro 7 backgrounds it (and exits) when run by an agent.
    command: 'node node_modules/astro/bin/astro.mjs preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
