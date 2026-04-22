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

test("easter egg entry transitions into the Beyond route", async ({ page }) => {
  await page.goto("/");

  const heroNameTrigger = page.getByRole("button", { name: "Abhinav", exact: true });
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

test("home hero paints the editorial wordmark before the premium hover state activates", async ({
  page,
}) => {
  await page.goto("/");

  const wordmark = page.locator('[data-home-hero-wordmark="true"]');
  const firstEditorialLayer = wordmark.locator('[data-letter-layer="editorial"]').first();
  const firstScriptLayer = wordmark.locator('[data-letter-layer="script"]').first();

  await expect(wordmark).toBeVisible();
  await expect(firstEditorialLayer).toBeVisible();
  await expect(firstScriptLayer).toHaveAttribute("data-visible", "false");
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

test("keyboard entry uses the centered trigger mode and opens the Beyond route accessibly", async ({
  page,
  browserName,
}) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Abhinav", exact: true });
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
  const firstScriptLayer = firstLetter.locator('[data-letter-layer="script"]');
  const fifthScriptLayer = fifthLetter.locator('[data-letter-layer="script"]');
  const firstDecoration = firstLetter.locator('[data-letter-decoration="true"]');
  const fifthDecoration = fifthLetter.locator('[data-letter-decoration="true"]');

  await firstLetter.hover();
  await expect(firstLetter).toHaveAttribute("data-hovered", "true");
  await expect(firstScriptLayer).toHaveAttribute("data-visible", "true");
  await expect(firstScriptLayer).toContainText("A");
  await expect(firstDecoration).toHaveAttribute("data-visible", "true");
  await expect(page).toHaveURL(/\/$/);

  await fifthLetter.hover();
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthScriptLayer).toHaveAttribute("data-visible", "true");
  await expect(fifthScriptLayer).toContainText("n");
  await expect(fifthDecoration).toHaveAttribute("data-visible", "true");
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

test("desktop home hero keeps the editorial aurora scene visible above the fold", async ({
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

test("hovered A, n, and v hero letters keep the premium script, glow, and decoration states", async ({
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
  await expect(firstLetter.locator('[data-letter-layer="script"]')).toHaveAttribute(
    "data-visible",
    "true"
  );
  await expect(firstLetter.locator('[data-letter-decoration="true"]')).toHaveAttribute(
    "data-visible",
    "true"
  );

  await fifthLetter.hover();
  await page.waitForTimeout(280);
  await expect(fifthLetter).toHaveAttribute("data-hovered", "true");
  await expect(fifthLetter.locator('[data-letter-layer="script"]')).toHaveAttribute(
    "data-visible",
    "true"
  );
  await expect(fifthLetter.locator('[data-letter-decoration="true"]')).toHaveAttribute(
    "data-visible",
    "true"
  );

  await seventhLetter.hover();
  await page.waitForTimeout(280);
  await expect(seventhLetter).toHaveAttribute("data-hovered", "true");
  await expect(seventhLetter.locator('[data-letter-layer="script"]')).toHaveAttribute(
    "data-visible",
    "true"
  );
  await expect(seventhLetter.locator('[data-letter-decoration="true"]')).toHaveAttribute(
    "data-visible",
    "true"
  );

  await expect(page).toHaveURL(/\/$/);
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
