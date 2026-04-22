import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const artifactPath = (filename: string) =>
  path.join(process.cwd(), "test-artifacts", filename);

test.beforeAll(() => {
  fs.mkdirSync(path.join(process.cwd(), "test-artifacts"), { recursive: true });
});

async function expectHeroNameToFit(page: Parameters<typeof test>[0]["page"]) {
  const wordmark = page.locator('[data-home-hero-wordmark="true"]');
  const firstLetter = page.locator('[data-animated-letter-index="0"]').first();
  const lastLetter = page.locator('[data-animated-letter-index="6"]').first();

  await expect(wordmark).toBeVisible();
  await expect(firstLetter).toBeVisible();
  await expect(lastLetter).toBeVisible();
  await page.waitForTimeout(900);

  const [wordmarkBox, firstBox, lastBox, viewport, widths] = await Promise.all([
    wordmark.boundingBox(),
    firstLetter.boundingBox(),
    lastLetter.boundingBox(),
    page.viewportSize(),
    page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
    })),
  ]);

  expect(wordmarkBox).not.toBeNull();
  expect(firstBox).not.toBeNull();
  expect(lastBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(firstBox!.x).toBeGreaterThanOrEqual(0);
  expect(lastBox!.x + lastBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.windowWidth);

  return {
    viewportWidth: viewport!.width,
    wordmarkWidth: wordmarkBox!.width,
  };
}

test("easter egg entry transitions into the Beyond route", async ({ page }) => {
  await page.goto("/");

  const heroNameTrigger = page.getByRole("button", { name: "Abhinav", exact: true });

  await heroNameTrigger.click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-variant",
    "portal-bloom"
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-skin",
    "beyond-pastel-mist"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
});

test("home hero keeps the full name inside the desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");

  const metrics = await expectHeroNameToFit(page);

  expect(metrics.wordmarkWidth).toBeGreaterThanOrEqual(metrics.viewportWidth * 0.75);
});

test("home hero keeps the full name inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const metrics = await expectHeroNameToFit(page);

  expect(metrics.wordmarkWidth).toBeGreaterThanOrEqual(metrics.viewportWidth * 0.68);
});

test("home page does not expose an obvious Beyond CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Beyond the Terminal →")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Beyond", exact: true })).toHaveCount(0);
});

test("reduced motion falls back to the accessible fade variant", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(150);

  await page.getByRole("button", { name: "Abhinav", exact: true }).click();

  await expect(page.locator('[data-portal-variant="accessible-fade"]')).toBeVisible();
  await expect(page).toHaveURL(/\/beyond-terminal$/);
});

test("journal archive and article routes render cleanly", async ({ page }) => {
  await page.goto("/beyond-terminal/journal");

  await expect(
    page.getByRole("heading", {
      name: /Local essays framed like the same system, just quieter/i,
    })
  ).toBeVisible();
  await page.getByRole("link", { name: /Training for Quiet Judgment/i }).click();

  await expect(page).toHaveURL(/\/beyond-terminal\/journal\/training-for-quiet-judgment$/);
  await expect(
    page.getByRole("heading", { name: /Training for Quiet Judgment/i })
  ).toBeVisible();
});

test("desktop Beyond shell matches the pastel grid layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/beyond-terminal");

  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-desktop.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("keyboard entry uses the centered trigger mode and restores focus", async ({
  page,
}) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Abhinav", exact: true });
  await expect(trigger).toBeVisible();
  await page.waitForTimeout(150);
  await trigger.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-trigger-mode",
    "keyboard"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(page.locator("#beyond-hero-title")).toBeFocused();
});

test("hovering individual letters keeps the per-letter animation active without navigating", async ({
  page,
}) => {
  await page.goto("/");

  const firstLetter = page.locator('[data-animated-letter-index="0"]').first();
  const fifthLetter = page.locator('[data-animated-letter-index="4"]').first();
  const firstScriptLayer = firstLetter.locator('[data-letter-layer="script"]');
  const fifthScriptLayer = fifthLetter.locator('[data-letter-layer="script"]');

  await firstLetter.hover();
  await expect(firstLetter).toHaveAttribute("data-hovered", "true");
  await expect(firstScriptLayer).toHaveAttribute("data-visible", "true");
  await expect(page).toHaveURL(/\/$/);

  await fifthLetter.hover();
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthScriptLayer).toHaveAttribute("data-visible", "true");
  await expect(page).toHaveURL(/\/$/);
});

test("desktop home hero wordmark keeps the editorial look", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await page.waitForTimeout(900);

  await expect(page.locator('[data-home-hero-wordmark="true"]')).toHaveScreenshot(
    "home-hero-wordmark-desktop.png"
  );
});

test("mobile Beyond shell matches the pastel grid layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/beyond-terminal");

  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-mobile.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-mobile.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("journal archive layout matches the supporting strip design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/beyond-terminal/journal");

  await expect(
    page.getByRole("heading", {
      name: /Local essays framed like the same system, just quieter/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(700);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-journal-archive.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-journal-archive.png");
});
