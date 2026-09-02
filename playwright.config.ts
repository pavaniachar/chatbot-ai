import { defineConfig, devices } from '@playwright/test';

// Port 3100, not 3000, so the suite never collides with a `npm run dev` you
// already have open. `localhost`, not `127.0.0.1`: Next treats the numeric host
// as a cross-origin dev request and answers 403 for every `/_next/static`
// chunk, leaving a page that loads but never hydrates.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * End-to-end config. Every spec route-intercepts `/api/chat` in the browser, so
 * the real handler never runs: no `OPENROUTER_API_KEY` is needed and no
 * OpenRouter budget is spent.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Serial deliberately: one Next server serving concurrent browser contexts
  // starves navigations, and the resulting `page.goto` timeouts look like app
  // bugs. The whole suite runs in about a minute this way.
  workers: 1,
  timeout: 45_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // A production build, not `next dev`: dev compiles routes on demand and
  // stalls under parallel workers, and its error overlay masks the blank-page
  // symptom these tests exist to catch.
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: BASE_URL,
    // Always a fresh server: reusing one left over from a previous run picks up
    // a stale build, or a process already on its way down.
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
