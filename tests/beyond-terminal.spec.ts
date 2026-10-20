import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const artifactDirectory = path.join(
  process.env.PLAYWRIGHT_OUTPUT_DIR ?? path.join(process.cwd(), "test-results"),
  "artifacts"
);
const artifactPath = (filename: string) => path.join(artifactDirectory, filename);

test.beforeAll(() => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
});

async function expectHeroNameToFit(page: Page) {
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

async function freezeHeroAmbientForSnapshot(
  page: Page
) {
  await page.addStyleTag({
    content: `[data-scroll-indicator="true"] { display: none !important; }`,
  });
}

function getHeroPortalTrigger(page: Page) {
  return page.locator('[data-animated-name="hero-trigger"]').first();
}

async function expectBeyondPhotoWallVisible(page: Page) {
  await expect(page.getByText("Beyond the Build", { exact: true })).toBeVisible();
  await expect(page.locator("#beyond-hero-title")).toHaveText("Beyond The Terminal");
  await expect(
    page.getByText("Photos, people, notes, and the parts that don't fit inside a resume.")
  ).toBeVisible();
}

test("easter egg entry transitions into the Beyond route", async ({ page }) => {
  await page.goto("/");

  const heroNameTrigger = getHeroPortalTrigger(page);
  await expect(heroNameTrigger).toBeVisible();
  await page.waitForTimeout(180);

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
  await expectBeyondPhotoWallVisible(page);
});

test("home hero keeps the full name inside the desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");

  const metrics = await expectHeroNameToFit(page);

  const wordmarkWidthRatio = metrics.wordmarkWidth / metrics.viewportWidth;
  expect(wordmarkWidthRatio).toBeGreaterThanOrEqual(0.5);
  expect(wordmarkWidthRatio).toBeLessThanOrEqual(0.56);
});

test("home hero keeps the full name inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expectHeroNameToFit(page);
});

test("home page does not expose an obvious Beyond CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Beyond the Terminal →")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Beyond", exact: true })).toHaveCount(0);
});

test("home hero paints the editorial wordmark before the premium hover state activates", async ({
  page,
}) => {
  await page.goto("/");

  const wordmark = page.locator('[data-home-hero-wordmark="true"]');
  const firstEditorialLayer = wordmark.locator('[data-letter-layer="editorial"]').first();

  await expect(wordmark).toBeVisible();
  await expect(firstEditorialLayer).toBeVisible();
  await expect(wordmark.locator('[data-letter-layer="editorial"]')).toHaveCount(7);
  await expect(wordmark.locator('[data-letter-layer="script"]')).toHaveCount(0);
});

test("reduced motion falls back to the accessible fade variant", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(150);

  const staticRole = page.getByText("Software engineer", { exact: true });
  await expect(staticRole).toBeVisible();
  await page.waitForTimeout(2_800);
  await expect(staticRole).toBeVisible();

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  await expect(method.getByRole("heading", { name: "How I orchestrate AI agents" })).toBeVisible();
  await expect(method.getByText("From Velo's build record", { exact: true })).toBeVisible();

  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(
    page.getByText("I design and build across the database, API, and product interface.", { exact: true })
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.windowWidth);

  await getHeroPortalTrigger(page).click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-variant",
    "accessible-fade"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
});

test("legacy journal routes redirect into the Beyond photo wall", async ({ page }) => {
  await page.goto("/beyond-terminal/journal");

  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expectBeyondPhotoWallVisible(page);

  await page.goto("/beyond-terminal/journal/training-for-quiet-judgment");
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expectBeyondPhotoWallVisible(page);
});

test("desktop Beyond shell matches the photo wall layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/beyond-terminal");

  await expectBeyondPhotoWallVisible(page);
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-desktop.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("keyboard entry uses the centered trigger mode and opens the Beyond route accessibly", async ({
  page,
  browserName,
}) => {
  await page.goto("/");

  const trigger = getHeroPortalTrigger(page);
  await expect(trigger).toBeVisible();
  await page.waitForTimeout(150);
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");

  if (browserName === "chromium") {
    await expect(page.locator("html")).toHaveAttribute(
      "data-last-portal-trigger-mode",
      "keyboard"
    );
  }
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(page.locator("#beyond-hero-title")).toBeVisible();
});

test("hovering individual letters keeps the per-letter animation active without navigating", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(200);

  const firstLetter = page.locator('[data-animated-letter-index="0"]').first();
  const fifthLetter = page.locator('[data-animated-letter-index="4"]').first();
  const firstEditorialLayer = firstLetter.locator('[data-letter-layer="editorial"]');
  const fifthEditorialLayer = fifthLetter.locator('[data-letter-layer="editorial"]');

  await firstLetter.hover();
  await expect(firstLetter).toHaveAttribute("data-hovered", "true");
  await expect(firstEditorialLayer).toContainText("A");
  await expect(firstLetter.locator('[data-letter-aura="true"]')).toBeAttached();
  await expect(page).toHaveURL(/\/$/);

  await fifthLetter.hover();
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthEditorialLayer).toContainText("n");
  await expect(fifthLetter.locator('[data-letter-aura="true"]')).toBeAttached();
  await expect(page).toHaveURL(/\/$/);
});

test("deferred sections still render cleanly when scrolled into view", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    document.querySelector("main")?.scrollIntoView({ block: "start" });
  });

  await expect(
    page.getByRole("heading", {
      name: "I design and build across the database, API, and product interface.",
      exact: true,
    })
  ).toBeVisible();
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  }));

  expect(widths.documentWidth).toBeLessThanOrEqual(widths.windowWidth);

  await expect(page.locator("#experience article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Velo, a white-label dispatch prototype", exact: true })
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Portfolio publishing system",
      exact: true,
    })
  ).toHaveCount(1);

  const resumeCta = page.getByRole("link", { name: "Download résumé", exact: true });
  await expect(resumeCta).toHaveAttribute(
    "href",
    "/resume/abhinav-prasad-resume.pdf"
  );
  await expect(resumeCta).toHaveAttribute("download", "");

  await page.goto("/work/portfolio-platform");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Portfolio publishing system",
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(6);

  await page.goto("/work/velo");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Velo, a white-label dispatch prototype",
      exact: true,
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View project source on GitHub", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/k2ocabhinav/Velo"
  );
});

test("desktop handoff into the profile section stays seam-free", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.getElementById("about")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);

  const about = page.locator("#about").first();
  await expect(about).toBeVisible();
  const screenshot = await about.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-about-handoff-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("orchestration panel keeps the build method readable on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();

  const screenshot = await method.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("orchestration-method-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("orchestration panel keeps the build method readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();

  const screenshot = await method.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("orchestration-method-mobile.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("profile stage keeps premium composition on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const profileStage = page.locator("#about .spec-sheet");
  await page.evaluate(() => {
    document.querySelector("#about .spec-sheet")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);
  await expect(profileStage).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-site-chrome="brand"]')).toHaveCSS("opacity", "1");

  const screenshot = await profileStage.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-profile-stage-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("profile stage keeps premium composition on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const profileStage = page.locator("#about .spec-sheet");
  await page.evaluate(() => {
    document.querySelector("#about .spec-sheet")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);
  await expect(profileStage).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content:
      '[data-site-chrome="brand"], [data-site-chrome="navigation-toggle"] { display: none !important; }',
  });

  const screenshot = await profileStage.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-profile-stage-mobile.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("secret hint stays visible through mid profile scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);

  const hint = page.locator('[data-secret-hint="true"]').first();
  await expect(hint).toBeVisible();
  await expect(hint).toContainText("Personal layer");
  await expect(hint).toContainText("v opens it");
});

test("desktop home hero wordmark keeps the editorial look", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.waitForTimeout(900);

  const screenshot = await page.locator('[data-home-hero-wordmark="true"]').screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-hero-wordmark-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("desktop home hero keeps the matte scene visible above the fold", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.waitForTimeout(900);

  const screenshot = await page.locator('[data-home-hero-frame="true"]').screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-hero-scene-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("hovered A, n, and v hero letters keep the matte print states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.waitForTimeout(300);

  const firstLetter = page.locator('[data-animated-letter-index="0"]').first();
  const fifthLetter = page.locator('[data-animated-letter-index="4"]').first();
  const seventhLetter = page.locator('[data-animated-letter-index="6"]').first();

  await firstLetter.hover();
  await page.waitForTimeout(280);
  await expect(firstLetter).toHaveAttribute("data-hovered", "true");
  await expect(firstLetter.locator('[data-letter-layer="editorial"]')).toContainText("A");
  const firstPrintState = await firstLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => ({
    color: getComputedStyle(el).color,
    strokeWidth: getComputedStyle(el).webkitTextStrokeWidth,
    textShadow: getComputedStyle(el).textShadow,
  }));
  expect(firstPrintState.color).toBe("rgba(0, 0, 0, 0)");
  expect(firstPrintState.strokeWidth).toBe("1.5px");
  expect(firstPrintState.textShadow).toBe("none");

  await fifthLetter.hover();
  await page.waitForTimeout(280);
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthLetter.locator('[data-letter-layer="editorial"]')).toContainText("n");
  const fifthPrintState = await fifthLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => ({
    color: getComputedStyle(el).color,
    strokeWidth: getComputedStyle(el).webkitTextStrokeWidth,
    textShadow: getComputedStyle(el).textShadow,
  }));
  expect(fifthPrintState.color).toBe("rgb(106, 33, 53)");
  expect(fifthPrintState.strokeWidth).toBe("0px");
  expect(fifthPrintState.textShadow).toBe("none");

  await seventhLetter.hover();
  await page.waitForTimeout(280);
  await expect(seventhLetter).toHaveAttribute("data-hovered", "true");
  await expect(seventhLetter.locator('[data-letter-layer="editorial"]')).toContainText("v");
  const seventhPrintState = await seventhLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => ({
    color: getComputedStyle(el).color,
    strokeWidth: getComputedStyle(el).webkitTextStrokeWidth,
    textShadow: getComputedStyle(el).textShadow,
  }));
  expect(seventhPrintState.color).toBe("rgba(0, 0, 0, 0)");
  expect(seventhPrintState.strokeWidth).toBe("1.5px");
  expect(seventhPrintState.textShadow).toBe("none");

  await expect(page).toHaveURL(/\/$/);
});

test("mobile Beyond shell matches the photo wall layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/beyond-terminal");

  await expectBeyondPhotoWallVisible(page);
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-mobile.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-mobile.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("redirected journal archive matches the Beyond photo wall layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/beyond-terminal/journal");

  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expectBeyondPhotoWallVisible(page);
  await page.waitForTimeout(700);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-journal-archive.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-journal-archive.png");
});
