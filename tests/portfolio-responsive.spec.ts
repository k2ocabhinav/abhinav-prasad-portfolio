import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page, TestInfo } from "@playwright/test";

const workstreamNames = [
  "Stakeholder delivery and release tooling",
  "Cloud delivery and operational reports",
  "Backend and SQL foundations",
  "AI coding tools for database work",
] as const;

const stackGroups = [
  ["AI coding agent workflows", "Part of my workflow"],
  ["Backend systems and APIs", "Built in projects"],
  ["Cloud delivery and release checks", "Used at work"],
] as const;

const screenshotProjects = new Set([
  "desktop-chromium",
  "mobile-webkit-narrow",
  "mobile-safari",
  "mobile-chrome",
  "tablet-safari",
]);

const isTouchProject = (testInfo: TestInfo) =>
  testInfo.project.name !== "desktop-chromium";

async function settleFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

async function openHome(page: Page, reducedMotion = false) {
  if (reducedMotion) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await settleFrame(page);
}

async function sweepWholePage(page: Page) {
  await page.evaluate(async () => {
    const settle = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    const step = Math.max(240, Math.floor(window.innerHeight * 0.7));

    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "auto" });
      await settle();
    }

    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
    await settle();
  });
}

async function revealAndSettleHomepage(page: Page) {
  for (const selector of [
    "#services",
    "#about",
    "#experience",
    "#work",
    "#stack",
    "#contact",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
  }
}

async function scrollToElementTop(page: Page, selector: string) {
  let stableChecks = 0;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.evaluate((targetSelector) => {
      const target = document.querySelector(targetSelector);
      if (!target) {
        throw new Error(`Missing scroll target: ${targetSelector}`);
      }
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "auto" });
    }, selector);
    await page.waitForTimeout(50);

    const distance = await page.locator(selector).evaluate(
      (target) => target.getBoundingClientRect().top
    );

    if (Math.abs(distance) <= 1) {
      stableChecks += 1;
      if (stableChecks >= 2) {
        break;
      }
    } else {
      stableChecks = 0;
    }
  }
  await settleFrame(page);
}

function boxesIntersect(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number }
) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function expectMinimumTargetSize(locator: Locator, minimum = 44) {
  const count = await locator.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const target = locator.nth(index);
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box, `target ${index + 1} should have layout`).not.toBeNull();
    expect(box!.width, `target ${index + 1} width`).toBeGreaterThanOrEqual(minimum);
    expect(box!.height, `target ${index + 1} height`).toBeGreaterThanOrEqual(minimum);
  }
}

async function expectSectionsWithinViewport(
  page: Page,
  sections: readonly string[] = ["#experience", "#stack"]
) {
  const result = await page.evaluate((sectionSelectors) => {
    const viewportWidth = window.innerWidth;
    const documentWidth = document.documentElement.scrollWidth;
    const offenders: Array<{ selector: string; left: number; right: number }> = [];

    for (const selector of sectionSelectors) {
      const root = document.querySelector<HTMLElement>(selector);
      if (!root) {
        offenders.push({ selector, left: -1, right: viewportWidth + 1 });
        continue;
      }

      if (root.getBoundingClientRect().width > viewportWidth + 1) {
        offenders.push({
          selector,
          left: root.getBoundingClientRect().left,
          right: root.getBoundingClientRect().right,
        });
      }

      root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, li, a, button").forEach(
        (element, index) => {
          if (element.closest('[aria-hidden="true"]')) {
            return;
          }
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            (rect.left < -1 || rect.right > viewportWidth + 1)
          ) {
            offenders.push({ selector: `${selector} text ${index}`, left: rect.left, right: rect.right });
          }
        }
      );
    }

    return { viewportWidth, documentWidth, offenders };
  }, sections);

  expect(result.documentWidth).toBeLessThanOrEqual(result.viewportWidth + 1);
  expect(result.offenders).toEqual([]);
}

function formatAxeViolations(
  violations: Array<{ id: string; impact?: string | null; nodes: unknown[] }>
) {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact ?? "unknown"}): ${violation.nodes.length} node(s)`
    )
    .join("\n");
}

test("shows the approved Ostrum role, work, and context-labelled stack", async ({ page }) => {
  await openHome(page, true);

  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();
  await expect(experience.getByRole("heading", { level: 3, name: "Ostrum Tech Limited" })).toBeVisible();
  await expect(experience.getByRole("heading", { level: 4, name: "Database Engineer" })).toBeVisible();
  await expect(experience.getByText("September 2024 to present", { exact: true })).toBeVisible();

  const workDisclosure = experience.getByText("Selected engineering work", { exact: true });
  await workDisclosure.click();
  await expect(experience.getByText(/stakeholder needs into database-backed changes/)).toBeVisible();
  for (const name of workstreamNames) {
    await expect(experience.getByRole("heading", { level: 4, name, exact: true })).toBeVisible();
  }
  await expect(experience.getByText("Software Engineer Intern", { exact: true })).toBeVisible();
  const sqlToolsProof = experience.getByText(
    /I built SQL Tools in Python and Tkinter\./
  );
  await expect(sqlToolsProof).toHaveCount(1);
  await expect(sqlToolsProof).toBeVisible();
  await expect(experience.getByText(/I traced a state-transition defect/)).toBeVisible();

  const stack = page.locator("#stack");
  await stack.scrollIntoViewIfNeeded();
  for (const [label, context] of stackGroups) {
    const group = stack.locator("li").filter({ hasText: label });
    await expect(group).toHaveCount(1);
    await expect(group).toContainText(context);
  }
});

test("keeps the profile proof and agent method specific", async ({ page }) => {
  await openHome(page, true);

  await expect(page.getByText("Forward deployed engineering", { exact: true })).toBeVisible();
  await expect(page.getByText("Currently: Database Engineer at Ostrum Tech Limited", { exact: true })).toBeVisible();
  await expect(page.locator("#about").getByText(/Velo is a pre-launch dispatch prototype/)).toBeVisible();
  await expect(page.locator("#about").getByText(/As Database Engineer at Ostrum Tech Limited/)).toBeVisible();
  await expect(page.locator("#about").getByText(/I scope coding-agent tasks/)).toBeVisible();
  await expect(page.locator("#about").getByText(/I clarify requested behavior with stakeholders/)).toBeVisible();

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  await expect(method.getByRole("heading", { name: "How I orchestrate AI agents" })).toBeVisible();
  await expect(method.getByText(/45 rated agent runs/)).toBeVisible();
  await expect(method.getByText(/Velo’s build record/)).toBeVisible();
  await expect(method.getByText(/first live rehearsal exposed flows the automated tests missed/)).toBeVisible();
  await expect(method.locator('ol[aria-label="Four method lanes"] li')).toHaveText([
    "Plan",
    "Build",
    "Review",
    "Ship",
  ]);
  const posterLabels = await method.locator("svg text").allTextContents();
  expect(posterLabels.filter((label) => label === "Before merge")).toHaveLength(1);
  expect(posterLabels).not.toContain("Review before merge");
});

test("keeps Experience and Stack content inside the project viewport", async ({
  page,
}, testInfo) => {
  await openHome(page, true);
  await sweepWholePage(page);

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (testInfo.project.name.includes("landscape")) {
    expect(viewport!.width).toBeGreaterThan(viewport!.height);
  }

  await expectSectionsWithinViewport(page);
  await expect(page.locator("#experience article")).toHaveCount(1);
  await expect(page.locator('#work a[href^="/work/"]')).toHaveCount(2);
  for (const [label] of stackGroups) {
    await expect(page.locator("#stack").getByText(label, { exact: true })).toBeVisible();
  }
});

test("aligns the arc with the Experience heading without collisions", async ({ page }) => {
  await openHome(page, true);
  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();

  const title = experience.getByRole("heading", { level: 2 });
  const arc = experience.locator('[data-riso-mark="arc"]');
  const callout = page.locator("#experience > div > div > header > p");
  const dossier = experience.locator("article");
  await expect(title).toBeVisible();
  await expect(arc).toBeVisible();

  const [titleBox, arcBox, calloutBox, dossierBox] = await Promise.all([
    title.boundingBox(),
    arc.boundingBox(),
    callout.boundingBox(),
    dossier.boundingBox(),
  ]);
  expect(titleBox).not.toBeNull();
  expect(arcBox).not.toBeNull();
  expect(calloutBox).not.toBeNull();
  expect(dossierBox).not.toBeNull();

  expect(Math.abs(titleBox!.y + titleBox!.height - (arcBox!.y + arcBox!.height))).toBeLessThanOrEqual(12);
  expect(boxesIntersect(arcBox!, calloutBox!)).toBe(false);
  expect(boxesIntersect(arcBox!, dossierBox!)).toBe(false);
});

test("reduced motion renders the Experience mark and work content statically", async ({ page }) => {
  await openHome(page, true);
  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();

  const arcPath = experience.locator('[data-riso-arc-path="true"]');
  await expect(arcPath).toBeVisible();
  await expect(arcPath).not.toHaveAttribute("style", /stroke-dashoffset|pathLength/);

  await experience.getByText("Selected engineering work", { exact: true }).click();
  const workstreams = experience.locator("details[open] section");
  await expect(workstreams).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await expect(workstreams.nth(index)).toBeVisible();
    const state = await workstreams.nth(index).evaluate((element) => ({
      opacity: Number.parseFloat(getComputedStyle(element).opacity),
      transform: getComputedStyle(element).transform,
    }));
    expect(state.opacity).toBe(1);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(state.transform);
  }
});

test("the scroll-linked arc draws during the Experience heading transit", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One deterministic motion probe is sufficient");
  await openHome(page);

  const header = page.locator("#experience > div > div > header");
  const path = page.locator('#experience [data-riso-arc-path="true"]');
  const headerTop = await header.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY
  );
  const viewportHeight = page.viewportSize()!.height;

  const drawStateAt = async (viewportFraction: number) => {
    const targetY = Math.max(0, Math.round(headerTop - viewportHeight * viewportFraction));
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "auto" }), targetY);
    await settleFrame(page);
    return path.evaluate((element) => getComputedStyle(element).strokeDasharray);
  };

  const early = await drawStateAt(0.81);
  const middle = await drawStateAt(0.68);
  const settled = await drawStateAt(0.52);
  expect(early).not.toBe(middle);
  expect(middle).not.toBe(settled);
});

test("touch navigation is operable, sized safely, and restores focus", async ({
  page,
}, testInfo) => {
  test.skip(!isTouchProject(testInfo), "Touch-only navigation contract");
  await openHome(page, true);

  await page.evaluate(() => window.scrollTo({ top: 360, behavior: "auto" }));
  const openingScrollY = await page.evaluate(() => window.scrollY);
  const toggle = page.locator('button[aria-controls="mobile-navigation-panel"]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAccessibleName("Open menu");
  await expectMinimumTargetSize(toggle);
  await toggle.click();

  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  const dialog = page.getByRole("dialog", { name: "Site navigation" });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(mobileNav).toBeVisible();
  const closeButton = dialog.getByRole("button", { name: "Close menu" });
  await expectMinimumTargetSize(closeButton);
  await expect(page.locator("#site-content")).toHaveAttribute("inert", "");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expectMinimumTargetSize(mobileNav.getByRole("link"));
  await expect(closeButton).toBeFocused();
  await expect(mobileNav.getByRole("link")).toHaveText([
    "Hero",
    "What I do",
    "About",
    "Experience",
    "Work",
    "Stack",
    "Contact",
    "Résumé",
    "Email",
  ]);

  const menuLinks = mobileNav.getByRole("link");
  await menuLinks.last().focus();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(menuLinks.last()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.locator("#site-content")).not.toHaveAttribute("inert", "");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - openingScrollY))
    .toBeLessThanOrEqual(5);

  await toggle.click();
  await mobileNav.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(mobileNav).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expectMinimumTargetSize(page.locator("#contact a[aria-label]"));
});

test("touch layouts do not retain hover movement on project cards", async ({ page }, testInfo) => {
  test.skip(!isTouchProject(testInfo), "Touch-only interaction contract");
  await openHome(page, true);
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(false);

  const workCard = page
    .locator('#work a[href^="/work/"]')
    .first()
    .locator("..")
    .locator("..")
    .locator("..");
  const card = workCard.locator(":scope > div").first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.evaluate((element) => getComputedStyle(element).transform);
  await card.tap();
  await settleFrame(page);
  const after = await card.evaluate((element) => getComputedStyle(element).transform);
  expect(after).toBe(before);
});

test("full-page sweep has no runtime, network, ID, or image failures", async ({
  page,
  baseURL,
}) => {
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];
  const homeOrigin = baseURL ? new URL(baseURL).origin : null;
  const isHomeRequest = (url: string) =>
    homeOrigin !== null && new URL(url).origin === homeOrigin;

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      runtimeErrors.push(message.text());
    }
  });
  page.on("requestfailed", (request) => {
    if (isHomeRequest(request.url())) {
      failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
    }
  });
  page.on("response", (response) => {
    if (isHomeRequest(response.url()) && response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });

  await openHome(page);
  await sweepWholePage(page);

  const integrity = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>("[id]"), (element) =>
      element.id
    );
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const brokenImages = Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt);
    return { duplicates: [...new Set(duplicates)], brokenImages };
  });

  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(integrity.duplicates).toEqual([]);
  expect(integrity.brokenImages).toEqual([]);
});

test("revealed homepage passes automated WCAG A/AA checks", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the full-page scan once");
  await openHome(page, true);
  await revealAndSettleHomepage(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, formatAxeViolations(results.violations)).toEqual([]);
});

test("open mobile navigation passes automated WCAG A/AA checks", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-safari", "One representative touch scan is sufficient");
  await openHome(page, true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include("#mobile-navigation-panel")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, formatAxeViolations(results.violations)).toEqual([]);
});

test("Experience and Stack keep focused reduced-motion visual baselines", async ({
  page,
}, testInfo) => {
  test.skip(!screenshotProjects.has(testInfo.project.name), "Focused baseline set only");
  await openHome(page, true);
  await page.addStyleTag({
    content: `[data-site-chrome] { visibility: hidden !important; }`,
  });

  await scrollToElementTop(page, "#experience");
  const experienceScreenshot = await page.screenshot({
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
  expect(experienceScreenshot).toMatchSnapshot("experience.png", {
    maxDiffPixelRatio: 0.015,
  });

  await scrollToElementTop(page, "#stack");
  const stackScreenshot = await page.screenshot({
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
  expect(stackScreenshot).toMatchSnapshot("stack.png", {
    maxDiffPixelRatio: 0.015,
  });
});
