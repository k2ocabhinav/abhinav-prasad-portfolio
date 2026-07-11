import { defineConfig, devices } from "@playwright/test";

const responsiveSpec = /portfolio-responsive\.spec\.ts/;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
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
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
