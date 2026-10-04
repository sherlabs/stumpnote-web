import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3100)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`

// Local runs build once (`pnpm build`) and serve with `next start`; set PLAYWRIGHT_BASE_URL to test a deployment.
export default defineConfig({
  testDir: './tests/playwright',
  testMatch: '**/*.spec.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 60_000,
      },
})
