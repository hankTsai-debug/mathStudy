import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: 4,
  timeout: 5 * 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5291',
    channel: 'chrome', // the locally installed Chrome; no browser download
    viewport: { width: 390, height: 844 }, // phone-sized
  },
  webServer: {
    command: 'npx vite --port 5291 --strictPort',
    url: 'http://localhost:5291',
    reuseExistingServer: false,
  },
})
