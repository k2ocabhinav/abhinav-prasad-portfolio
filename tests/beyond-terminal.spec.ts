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
  expect(wordmarkWidthRatio).toBeGreaterThanOrEqual(0.8);
  expect(wordmarkWidthRatio).toBeLessThanOrEqual(0.96);
});

test("home hero keeps the full name inside the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expectHeroNameToFit(page);
});

test("hero keeps its order and reserves the stack for wide screens", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const widthState = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widthState.document).toBeLessThanOrEqual(widthState.viewport);

    const wordmark = page.locator('[data-home-hero-wordmark="true"]');
    const identity = page.locator('[data-hero-identity="true"]');
    const actions = page.locator("[data-hero-ctas]");
    const stack = page.locator("[data-product-stack]");
    const [wordmarkBox, identityBox, actionsBox] = await Promise.all([
      wordmark.boundingBox(),
      identity.boundingBox(),
      actions.boundingBox(),
    ]);
    expect(wordmarkBox).not.toBeNull();
    expect(identityBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();

    if (width <= 767) {
      expect(wordmarkBox!.y).toBeLessThan(identityBox!.y);
      await expect(stack).toBeHidden();
    } else {
      expect(wordmarkBox!.y).toBeGreaterThan(actionsBox!.y);
      if (width < 1200) {
        await expect(stack).toBeHidden();
      } else {
        const stackBox = await stack.boundingBox();
        expect(stackBox).not.toBeNull();
        const separateColumns =
          identityBox!.x + identityBox!.width <= stackBox!.x ||
          stackBox!.x + stackBox!.width <= identityBox!.x;
        expect(separateColumns).toBe(true);
      }
    }
  }
});

test("desktop stack is an annotated figure with three distinct planes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");

  const figure = page.locator("[data-product-stack]");
  const stage = page.locator("[data-stack-stage]");
  await expect(figure).toBeVisible();
  await expect(figure).toHaveAttribute("aria-labelledby", "product-stack-caption");
  await expect(figure.getByRole("link")).toHaveCount(0);
  await expect(figure.locator("[data-stack-layer='interface']")).toBeVisible();
  await expect(figure.locator("[data-stack-layer='backend']")).toBeVisible();
  await expect(figure.locator("[data-stack-layer='data']")).toBeVisible();
  await expect.poll(() => stage.getAttribute("data-stack-motion")).toBe("settling");
  await expect(figure.locator("svg[role='img']")).toHaveAttribute(
    "aria-labelledby",
    "stack-drawing-title stack-drawing-description"
  );
  await expect(figure.locator('[data-stack-annotation="interface"]')).toBeVisible();
  await expect(figure.locator('[data-stack-annotation="backend"]')).toBeVisible();
  await expect(figure.locator('[data-stack-annotation="data"]')).toBeVisible();
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

    const strip = page.locator("[data-hero-scroll-cue='true']");
    await expect(strip).toBeVisible();

    const email = await page
      .locator('[data-home-hero-text] a[href^="mailto:"]')
      .boundingBox();
    const viewWork = await page.getByRole("link", { name: "View work" }).boundingBox();
    const linkedin = await page
      .locator("[data-home-hero-text]")
      .getByRole("link", { name: "Abhinav Prasad on LinkedIn (opens in a new tab)" })
      .boundingBox();
    expect(email).not.toBeNull();
    expect(viewWork).not.toBeNull();
    expect(linkedin).not.toBeNull();
    expect(email!.x + email!.width).toBeLessThanOrEqual(width - 20);
    expect(viewWork!.height).toBeGreaterThanOrEqual(52);
    expect(viewWork!.width).toBeGreaterThanOrEqual(200);
    expect(viewWork!.y).toBeLessThan(email!.y);
    expect(Math.abs(email!.y - linkedin!.y)).toBeLessThan(1);
  }
});

test("server-rendered hero paints both ink layers before hydration", async ({ page }) => {
  await page.route("**/_next/static/chunks/**", (route) => route.abort());
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const heading = page.locator('[data-home-hero-heading="true"]');
  const plate = heading.locator('[data-ink-plate-drift="true"]');

  await expect(page.locator('[data-home-hero-wordmark="true"]')).toBeVisible();
  await expect(plate).toBeVisible();
  await expect(plate).toHaveCSS("clip-path", "none");
  await expect(plate).toHaveCSS("opacity", "1");
  await expect(page.locator('[data-hero-identity="true"]')).toHaveText("Full-stack engineer");
  await expect(
    page.getByText(
      "I build products end to end, from the first conversation to release.",
      { exact: true }
    )
  ).toBeVisible();
  await expect(page.locator('[data-hero-facts="true"] a')).toHaveCount(2);
  await expect(page.getByRole("link", { name: "View work" })).toBeVisible();
  await expect(
    page.locator("[data-home-hero-text]").getByRole("link", {
      name: "Email Abhinav",
    })
  ).toBeVisible();
  await expect(
    page.locator("[data-home-hero-text]").getByRole("link", {
      name: "Abhinav Prasad on LinkedIn (opens in a new tab)",
    })
  ).toBeVisible();
});

test("LinkedIn is a quiet external hero link beside the email action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hero = page.locator("[data-home-hero-text]");
  const linkedin = hero.getByRole("link", {
    name: "Abhinav Prasad on LinkedIn (opens in a new tab)",
  });
  await expect(linkedin).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/k2ocabhinav22"
  );
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

  const [workBox, emailBox, linkedinBox] = await Promise.all([
    hero.getByRole("link", { name: "View work" }).boundingBox(),
    hero.getByRole("link", { name: "Email Abhinav" }).boundingBox(),
    linkedin.boundingBox(),
  ]);
  expect(workBox).not.toBeNull();
  expect(emailBox).not.toBeNull();
  expect(linkedinBox).not.toBeNull();
  expect(workBox!.height).toBeGreaterThanOrEqual(44);
  expect(workBox!.width).toBeGreaterThanOrEqual(200);
  expect(workBox!.y).toBeLessThan(emailBox!.y);
  expect(Math.abs(emailBox!.y - linkedinBox!.y)).toBeLessThan(1);
});

test("hero actions wrap without overflow at 320 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");

  const ctaGroup = page.locator("[data-hero-ctas='true']");
  await expect(ctaGroup.locator("a")).toHaveCount(3);
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  const groupBounds = await ctaGroup.boundingBox();
  expect(groupBounds).not.toBeNull();
  const actions = await ctaGroup.locator("a").evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right };
    })
  );
  for (const action of actions) {
    expect(action.left).toBeGreaterThanOrEqual(0);
    expect(action.right).toBeLessThanOrEqual(320);
  }
});

test("home page does not expose an obvious Beyond CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Beyond the Terminal →")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Beyond", exact: true })).toHaveCount(0);
});

test("home hero exposes one wordmark over a clean aria-hidden ink plate", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const wordmark = page.locator('[data-home-hero-wordmark="true"]');
  const heading = page.locator('[data-home-hero-heading="true"]');
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
  await expect(hero.locator('[data-hero-identity="true"]')).toHaveText("Full-stack engineer");
  await expect(hero.getByText("Full-stack engineer", { exact: true })).toHaveCount(1);
  await expect(hero.locator("header")).not.toContainText("Full-stack engineer");
  await expect(
    hero.getByText("I build products end to end, from the first conversation to release.", { exact: true })
  ).toBeVisible();
  const summaryFont = await hero.getByText(
    "I build products end to end, from the first conversation to release.",
    { exact: true }
  ).evaluate((element) => getComputedStyle(element).fontFamily);
  expect(summaryFont).toMatch(/Newsreader/i);
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

  const staticRole = page.locator('[data-hero-identity="true"]');
  await expect(staticRole).toBeVisible();
  await page.waitForTimeout(2_800);
  await expect(staticRole).toBeVisible();

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.locator("ol > li")).toHaveCount(4);
  await expect(method.locator("ol > li")).toContainText([
    "Scope",
    "Assign",
    "Review",
    "Verify",
  ]);

  const workProjects = page.locator("#work [data-work-project]");
  await expect(workProjects).toHaveCount(2);
  const staticWorkState = await workProjects.first().evaluate((article) => {
    const stage = article.querySelector("[data-work-frame]")?.parentElement?.parentElement;
    const frame = article.querySelector("[data-work-frame]");
    return {
      stagePosition: stage ? getComputedStyle(stage).position : null,
      frameTransform: frame ? getComputedStyle(frame).transform : null,
    };
  });
  expect(staticWorkState.stagePosition).toBe("static");
  expect(staticWorkState.frameTransform).toBe("none");

  const plateState = await page.locator('[data-home-hero-heading="true"] [data-ink-plate-drift="true"]').evaluate((element) => ({
    clipPath: getComputedStyle(element).clipPath,
    animationName: getComputedStyle(element).animationName,
    transform: getComputedStyle(element).transform,
  }));
  expect(plateState.clipPath).toBe("none");
  expect(plateState.animationName).toBe("none");
  expect(plateState.transform).toBe("matrix(1, 0, 0, 1, 1, 1)");

  const heroStack = page.locator("[data-product-stack]");
  await expect(heroStack).toBeVisible();
  await expect(heroStack.getByRole("link")).toHaveCount(0);
  await expect(page.locator("[data-stack-stage]")).toHaveAttribute("data-stack-motion", "ready");
  await expect(heroStack.locator("[data-stack-layer='interface']")).toBeVisible();
  await expect(heroStack.locator("[data-stack-layer='backend']")).toBeVisible();
  await expect(heroStack.locator("[data-stack-layer='data']")).toBeVisible();

  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "What I do", exact: true })
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

test("album lightbox focuses close, traps Tab, and restores focus on close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/beyond-terminal");

  const hero = page.locator('[data-beyond-section="hero"]');
  const wall = page.locator('[data-beyond-section="wall"]');
  const chrome = page.locator("header").first();
  const firstCard = wall.locator("button[aria-label^='Open ']").first();
  await firstCard.scrollIntoViewIfNeeded();
  await firstCard.click();

  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close album item" });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  const isInert = (locator: typeof hero) =>
    locator.evaluate((element) => element.closest("[inert]") !== null);
  expect(await isInert(hero)).toBe(true);
  expect(await isInert(wall)).toBe(true);
  expect(await isInert(chrome)).toBe(true);

  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(firstCard).toBeFocused();
  expect(await isInert(wall)).toBe(false);
  expect(await isInert(hero)).toBe(false);
  expect(await isInert(chrome)).toBe(false);
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
      name: "What I do",
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
    page.getByRole("heading", { name: "Velo", exact: true })
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
  const gallery = page.locator('section[aria-labelledby="gallery-title"]');
  await expect(gallery).toBeVisible();
  const galleryImages = gallery.locator("img");
  await expect(galleryImages).toHaveCount(3);
  for (const image of await galleryImages.all()) {
    await expect(image).toHaveAttribute("alt", /\S+/);
  }

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
  const screenshot = await page.screenshot({
    animations: "disabled",
    scale: "css",
  });

  expect(screenshot).toMatchSnapshot("home-about-handoff-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("How I work renders four clear steps on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText([
    "1 Scope",
    "2 Assign",
    "3 Review",
    "4 Verify",
  ]);

  const screenshot = await method.locator("[data-work-method-stage]").screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("orchestration-method-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("Velo zooms beside visible details while Portfolio stays a static card", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const firstProject = page.locator("#work [data-work-project]").first();
  const portfolio = page.locator("#work [data-work-project]").nth(1);
  await expect(firstProject.getByRole("heading", { name: "Velo" })).toBeVisible();
  await page.evaluate(() => {
    document.querySelector("#work [data-work-project]")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(500);

  const initial = await firstProject.evaluate((article) => {
    const frame = article.querySelector("[data-work-frame]");
    const stage = frame?.closest("[class*='projectStage']");
    const rect = frame?.getBoundingClientRect();
    return {
      position: stage ? getComputedStyle(stage).position : null,
      width: rect?.width ?? 0,
      right: rect?.right ?? 0,
    };
  });
  expect(initial.position).toBe("sticky");
  expect(initial.right).toBeLessThan(1440 - 100);

  const firstCta = firstProject.getByRole("link", { name: "Read the case study" });
  await expect(firstCta).toBeVisible();
  const ctaBox = await firstCta.boundingBox();
  expect(ctaBox).not.toBeNull();
  expect(ctaBox!.y).toBeGreaterThanOrEqual(0);
  expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(900);
  await expect(firstCta).toHaveCSS("opacity", "1");

  const trackEnd = await firstProject.evaluate((article) => {
    const rect = article.getBoundingClientRect();
    return rect.top + window.scrollY + rect.height - window.innerHeight;
  });
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), trackEnd);
  await page.waitForTimeout(650);

  const final = await firstProject.evaluate((article) => {
    const frame = article.querySelector("[data-work-frame]");
    const details = article.querySelector("[data-work-copy]");
    const imageBox = frame?.getBoundingClientRect();
    const detailsBox = details?.getBoundingClientRect();
    return {
      imageWidth: imageBox?.width ?? 0,
      imageRight: imageBox ? imageBox.right : 0,
      detailsLeft: detailsBox ? detailsBox.left : 0,
      detailsRight: detailsBox ? detailsBox.right : 0,
    };
  });

  expect(final.imageWidth).toBeGreaterThan(initial.width + 100);
  expect(final.imageRight).toBeLessThanOrEqual(final.detailsLeft);
  expect(final.detailsRight).toBeLessThanOrEqual(1440 - 100);
  await expect(firstCta).toHaveAttribute(
    "href",
    "/work/velo"
  );
  await expect(firstProject.getByRole("link", { name: "View project source" })).toHaveAttribute(
    "href",
    "https://github.com/k2ocabhinav/Velo"
  );

  const portfolioState = await portfolio.evaluate((article) => {
    const stage = article.querySelector("[data-work-frame]")?.closest("[class*='projectStage']");
    const frame = article.querySelector("[data-work-frame]");
    return {
      position: stage ? getComputedStyle(stage).position : null,
      transform: frame ? getComputedStyle(frame).transform : null,
    };
  });
  expect(portfolioState.position).not.toBe("sticky");
  expect(portfolioState.transform).toBe("none");
  await expect(portfolio.getByRole("link", { name: "Read the case study" })).toBeVisible();
});

test("How I work uses a vertical sequence on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await freezeHeroAmbientForSnapshot(page);
  await page.evaluate(() => {
    document.querySelector("#work aside[aria-labelledby='work-method-title']")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await expect(method).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText([
    "1 Scope",
    "2 Assign",
    "3 Review",
    "4 Verify",
  ]);
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

test("About statement and services keep a static composition on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const about = page.locator("#about");
  await page.evaluate(() => {
    document.querySelector("#about")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);
  await expect(about.getByRole("heading", { level: 2, name: "What I do" })).toBeVisible();
  await expect(about.locator("[data-scrub] p")).toHaveCount(4);
  for (const name of ["Backend and APIs", "Full-stack products", "AI-assisted delivery"]) {
    await expect(about.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: '[data-site-chrome], .skip-link { display: none !important; }',
  });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  const screenshot = await page.screenshot({
    animations: "disabled",
    scale: "css",
  });

  expect(screenshot).toMatchSnapshot("home-about-reduced-desktop.png", {
    maxDiffPixelRatio: 0.025,
  });
});

test("About statement and services keep a static composition on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await freezeHeroAmbientForSnapshot(page);

  const about = page.locator("#about");
  await page.evaluate(() => {
    document.querySelector("#about")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(420);
  await expect(about.getByRole("heading", { level: 2, name: "What I do" })).toBeVisible();
  await expect(about.locator("[data-scrub] p")).toHaveCount(4);
  for (const name of ["Backend and APIs", "Full-stack products", "AI-assisted delivery"]) {
    await expect(about.getByRole("heading", { level: 3, name })).toBeVisible();
  }
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: '[data-site-chrome], .skip-link { display: none !important; }',
  });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  const screenshot = await page.screenshot({
    animations: "disabled",
    scale: "css",
  });

  expect(screenshot).toMatchSnapshot("home-about-reduced-mobile.png", {
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

  const screenshot = await page.locator('[data-home-hero-heading="true"]').screenshot({
    animations: "disabled",
  });

  expect(screenshot).toMatchSnapshot("home-hero-wordmark-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("hero keeps a minimal scroll cue and removes the crop marks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/");

  const strip = page.locator("[data-hero-scroll-cue='true']");
  await expect(strip).toBeVisible();
  await expect(strip).toHaveAttribute("href", "#about");
  await expect(strip).toHaveCSS("min-height", "48px");
  await expect(page.locator("[data-pressrun-crop-mark='true']")).toHaveCount(0);
});

test("the scroll cue links to What I do", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.locator("[data-hero-scroll-cue='true']").click();

  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator("#about")).toBeInViewport();
  await expect(page.locator("#about h2")).toHaveText("What I do");
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
