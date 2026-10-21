import { defineConfig, devices } from "@playwright/test";

const responsiveSpec = /portfolio-responsive\.spec\.ts/;
const port = process.env.PLAYWRIGHT_PORT ?? "3000";

// PLAYWRIGHT_PROD=1 runs the suite against a real production build. The build
// happens inside the webServer command so the served bundle always matches the
// working tree; an existing server is never reused in that mode, otherwise a
// stale dev server could silently stand in for the build under test.
const prod = process.env.PLAYWRIGHT_PROD === "1";

export default defineConfig({
  testDir: "./tests",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1024 },
      },
    },
    {
      name: "mobile-webkit-narrow",
      testMatch: responsiveSpec,
      use: {
        ...devices["iPhone SE"],
      },
    },
    {
      name: "mobile-safari",
      testMatch: responsiveSpec,
      use: {
        ...devices["iPhone 15"],
      },
    },
    {
      name: "mobile-chrome",
      testMatch: responsiveSpec,
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "mobile-safari-landscape",
      testMatch: responsiveSpec,
      use: {
        ...devices["iPhone 13 landscape"],
      },
    },
    {
      name: "tablet-safari",
      testMatch: responsiveSpec,
      use: {
        ...devices["iPad Mini"],
      },
    },
    {
      name: "tablet-safari-landscape",
      testMatch: responsiveSpec,
      use: {
        ...devices["iPad Mini landscape"],
      },
    },
  ],
  webServer: {
    command: prod
      ? `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`
      : `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !prod,
    timeout: prod ? 300_000 : 120_000,
    ...(prod
      ? { env: { WHATSAPP_E164: process.env.WHATSAPP_E164 ?? "" } }
      : {}),
  },
});
