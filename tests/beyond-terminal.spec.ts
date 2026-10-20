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
  const trigger = page.locator('[data-animated-name="hero-trigger"]');

  await expect(wordmark).toBeVisible();
  await expect(trigger).toBeVisible();

  const [wordmarkBox, triggerBox, viewport, widths] = await Promise.all([
    wordmark.boundingBox(),
    trigger.boundingBox(),
    page.viewportSize(),
    page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
    })),
  ]);

  expect(wordmarkBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(wordmarkBox!.x).toBeGreaterThanOrEqual(0);
  expect(triggerBox!.x + triggerBox!.width).toBeLessThanOrEqual(viewport!.width);
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.windowWidth);

  const textRight = await wordmark.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().right;
  });
  expect(textRight).toBeLessThanOrEqual(viewport!.width - 20);

  return {
    viewportWidth: viewport!.width,
    wordmarkWidth: wordmarkBox!.width,
  };
}

async function freezeHeroAmbientForSnapshot(
  page: Page
) {
  await page.addStyleTag({
    content: `[data-site-chrome="cursor-orb"] { display: none !important; }`,
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

test("wordmark and email action keep phone gutters from 320 to 430 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  for (const width of [320, 360, 375, 390, 414, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expectHeroNameToFit(page);

    const email = await page
      .locator('[data-home-hero-text] a[href^="mailto:"]')
      .boundingBox();
    expect(email).not.toBeNull();
    expect(email!.x + email!.width).toBeLessThanOrEqual(width - 20);
  }
});

test("server-rendered hero paints both ink layers before hydration", async ({ page }) => {
  await page.route("**/_next/static/chunks/**", (route) => route.abort());
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const heading = page.locator('[data-home-hero-text] h1');
  const plate = heading.locator('[data-ink-plate-drift="true"] span');

  await expect(heading).toHaveAttribute("data-pass", "false");
  await expect(page.locator('[data-home-hero-wordmark="true"]')).toBeVisible();
  await expect(plate).toBeVisible();
  await expect(plate).toHaveCSS("clip-path", "none");
  await expect(plate).toHaveCSS("opacity", "1");
  await expect(page.getByText("Software engineer", { exact: true })).toBeVisible();
  await expect(page.locator('[data-hero-facts="true"] a')).toHaveCount(2);
});

test("home page does not expose an obvious Beyond CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Beyond the Terminal →")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Beyond", exact: true })).toHaveCount(0);
});

test("home hero paints one static wordmark over an aria-hidden ink plate", async ({
  page,
}) => {
  await page.goto("/");

  const wordmark = page.locator('[data-home-hero-wordmark="true"]');
  const heading = page.locator('[data-home-hero-text] h1');
  const plate = heading.locator('[data-ink-plate-drift="true"]');

  await expect(wordmark).toBeVisible();
  await expect(wordmark).toHaveText("Abhinav");
  await expect(plate).toHaveAttribute("aria-hidden", "true");
  await expect(plate).toHaveText("Abhinav");
  await expect(heading).toHaveAttribute("aria-label", "Abhinav");
  await expect(wordmark).toHaveCSS("animation-name", "none");
  await expect(wordmark).toHaveCSS("font-weight", "600");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const fontState = await wordmark.evaluate((element) => {
    const family = getComputedStyle(element).fontFamily.split(",")[0].trim();
    return {
      family,
      loaded: document.fonts.check(`600 20px ${family}`),
    };
  });
  expect(fontState.family).toMatch(/^frauncesWordmark/);
  expect(fontState.family).not.toMatch(/Times New Roman|Georgia/i);
  expect(fontState.loaded).toBe(true);
});

test("hero keeps its identity and work links without the board or proof band", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#hero");

  await expect(hero.getByRole("heading", { name: "Abhinav" })).toBeVisible();
  await expect(hero.getByText("Software engineer", { exact: true })).toBeVisible();
  await expect(
    hero.getByText("I build products end to end, from the first conversation to release.", { exact: true })
  ).toBeVisible();
  await expect(hero.locator("[data-home-hero-board], [data-hero-band]")).toHaveCount(0);
  await expect(hero.locator('[data-hero-facts="true"] a')).toHaveCount(2);
  await expect(hero.getByRole("link", { name: "View work" })).toHaveAttribute("href", "#work");
  await expect(hero.getByRole("link", { name: "Email Abhinav" })).toHaveAttribute(
    "href",
    "mailto:abhinavp0304@gmail.com"
  );
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
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.locator("ol > li")).toHaveCount(4);
  await expect(method.locator("ol > li")).toContainText([
    "Plan",
    "Build",
    "Review",
    "Ship",
  ]);

  const plateState = await page.locator('[data-home-hero-text] h1 [aria-hidden="true"] span').evaluate((element) => ({
    clipPath: getComputedStyle(element).clipPath,
    animationName: getComputedStyle(element).animationName,
    transform: getComputedStyle(element).transform,
  }));
  expect(plateState.clipPath).toBe("none");
  expect(plateState.animationName).toBe("none");
  expect(plateState.transform).toBe("matrix(1, 0, 0, 1, 2, 2)");

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

test("the final v portal target stays in the wordmark and works by pointer", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = getHeroPortalTrigger(page);
  await expect(trigger).toHaveAttribute("data-animated-letter-index", "6");
  await trigger.click();
  await expect(page).toHaveURL(/\/beyond-terminal$/);
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
      name: "Interactive Engineering Portfolio & Content Platform",
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
      name: "Interactive Engineering Portfolio & Content Platform",
      exact: true,
    })
  ).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(7);

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

test("How I work renders four clear steps on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText(["Plan", "Build", "Review", "Ship"]);

  const screenshot = await method.screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("orchestration-method-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("How I work uses a vertical sequence on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText(["Plan", "Build", "Review", "Ship"]);
  const columnCount = await method.locator("ol").evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length
  );
  expect(columnCount).toBe(1);

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

  const screenshot = await page.locator('[data-home-hero-text] h1').screenshot({
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

test("ink pass sweeps the burgundy plate while the black wordmark stays still", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);
  const heading = page.locator('[data-home-hero-text] h1');
  const wordmark = heading.locator('[data-home-hero-wordmark="true"]');
  const plate = heading.locator('[aria-hidden="true"] span');

  await expect.poll(() => heading.getAttribute("data-pass")).toBe("true");
  await expect(wordmark).toHaveCSS("animation-name", "none");
  await expect.poll(
    () => plate.evaluate((element) => getComputedStyle(element).animationName)
  ).toMatch(/inkSweep$/);
  await expect(page).toHaveURL(/\/$/);
});

test("ink pass stays static when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");

  const heading = page.locator('[data-home-hero-text] h1');
  const plate = heading.locator('[data-ink-plate-drift="true"] span');
  await expect(heading).toHaveAttribute("data-reduce-motion", "true");
  await expect(heading).toHaveAttribute("data-pass", "false");
  await expect(plate).toHaveCSS("animation-name", "none");
  await expect(plate).toHaveCSS("clip-path", "none");

  const restTransform = await plate.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(900, 640);
  await page.waitForTimeout(120);
  await expect(plate).toHaveCSS("transform", restTransform);
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
