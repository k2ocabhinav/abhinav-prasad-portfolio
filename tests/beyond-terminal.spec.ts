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

async function freezeHeroAmbientForSnapshot(
  page: Parameters<typeof test>[0]["page"]
) {
  await page.evaluate(() => {
    document.documentElement.dataset.e2eFreezeArtifacts = "true";
    document.documentElement.dataset.e2eStaticHero = "true";
  });
}

function getHeroPortalTrigger(page: Parameters<typeof test>[0]["page"]) {
  return page.locator('[data-animated-name="hero-trigger"]').first();
}

async function expectBeyondPhotoWallVisible(page: Parameters<typeof test>[0]["page"]) {
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

  await expect(page.getByRole("heading", { name: "Philosophy", exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    windowWidth: window.innerWidth,
  }));

  expect(widths.documentWidth).toBeLessThanOrEqual(widths.windowWidth);
});

test("desktop section handoff into Philosophy stays seam-free", async ({ page }) => {
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

test("explore bridge keeps the matte headline composition on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document
      .querySelector('[data-home-explore-bridge="true"]')
      ?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);

  const exploreBridge = page.locator('[data-home-explore-bridge="true"]');
  await expect(exploreBridge).toBeVisible();

  const screenshot = await exploreBridge.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-explore-bridge-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("explore bridge keeps the matte headline composition on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document
      .querySelector('[data-home-explore-bridge="true"]')
      ?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);

  const exploreBridge = page.locator('[data-home-explore-bridge="true"]');
  await expect(exploreBridge).toBeVisible();

  const screenshot = await exploreBridge.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-explore-bridge-mobile.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("profile stage keeps premium composition on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const profileStage = page.locator('[data-home-profile-stage="true"]');
  await page.evaluate(() => {
    document
      .querySelector('[data-home-profile-stage="true"]')
      ?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);
  await expect(profileStage).toBeVisible();

  const screenshot = await profileStage.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-profile-stage-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("profile stage keeps premium composition on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const profileStage = page.locator('[data-home-profile-stage="true"]');
  await page.evaluate(() => {
    document
      .querySelector('[data-home-profile-stage="true"]')
      ?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);
  await expect(profileStage).toBeVisible();

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

  await page.evaluate(() => {
    document
      .querySelector('[data-home-profile-stage="true"]')
      ?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(320);

  const hint = page.locator('[data-secret-hint="true"]').first();
  await expect(hint).toBeVisible();

  await page.evaluate(() => {
    window.scrollBy({ top: 180, behavior: "auto" });
  });
  await page.waitForTimeout(220);

  const activeOpacity = await hint.evaluate((el) =>
    Number.parseFloat(getComputedStyle(el).opacity || "0")
  );
  expect(activeOpacity).toBeGreaterThan(0.7);

  await page.evaluate(() => {
    window.scrollBy({ top: 260, behavior: "auto" });
  });
  await page.waitForTimeout(260);

  const midOpacity = await hint.evaluate((el) =>
    Number.parseFloat(getComputedStyle(el).opacity || "0")
  );
  expect(midOpacity).toBeGreaterThan(0.7);

  await page.evaluate(() => {
    window.scrollBy({ top: 260, behavior: "auto" });
  });
  await page.waitForTimeout(220);

  const lateOpacity = await hint.evaluate((el) =>
    Number.parseFloat(getComputedStyle(el).opacity || "0")
  );
  expect(lateOpacity).toBeGreaterThan(0.36);
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

test("desktop home hero keeps the ember scene visible above the fold", async ({
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

test("hovered A, n, and v hero letters keep the ember wordmark states", async ({
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

  await fifthLetter.hover();
  await page.waitForTimeout(280);
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthLetter.locator('[data-letter-layer="editorial"]')).toContainText("n");

  await seventhLetter.hover();
  await page.waitForTimeout(280);
  await expect(seventhLetter).toHaveAttribute("data-hovered", "true");
  await expect(seventhLetter.locator('[data-letter-layer="editorial"]')).toContainText("v");

  const [firstShadow, fifthShadow, seventhShadow] = await Promise.all([
    firstLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => getComputedStyle(el).textShadow),
    fifthLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => getComputedStyle(el).textShadow),
    seventhLetter.locator('[data-letter-layer="editorial"]').evaluate((el) => getComputedStyle(el).textShadow),
  ]);

  expect(firstShadow).not.toBe("none");
  expect(fifthShadow).toBe("none");
  expect(seventhShadow).not.toBe("none");

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
