import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Parallel test execution - 2 workers in CI, 4 workers locally for optimal performance */
  workers: process.env.CI ? 2 : 4,
  /* Timeout per test - CLI tests should be fast */
  timeout: 10000, // 10 seconds per test (reduced from 60s)
  /* Global setup/teardown - runs ONCE before/after all tests */
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], // Console reporter for better visibility
    ['html']  // HTML reporter for detailed analysis
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Disable all browser-related features for CLI tests */
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    actionTimeout: 0,
    navigationTimeout: 0,
  },

  /* Configure projects for CLI tests - no browser needed */
  projects: [
    {
      name: 'cli-tests',
      testMatch: '**/*.spec.ts',
      use: {
        // Explicitly disable browser features
        browserName: undefined as any,
        headless: true,
        launchOptions: {
          // Skip browser launch entirely
          args: ['--no-startup-window'],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
