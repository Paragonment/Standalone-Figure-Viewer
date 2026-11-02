import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

// Specs run against the production build served by `vite preview`, so what
// the tests see is what ships. Screenshots are made deterministic here:
// reduced motion, no animations or caret, and a fixed device scale. There is
// no pixel tolerance: the fonts are served with the app and the specs wait
// for every face (see settle), so a diff is a real change.
export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
