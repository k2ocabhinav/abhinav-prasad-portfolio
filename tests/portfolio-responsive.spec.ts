import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page, TestInfo } from "@playwright/test";

const workstreamNames = [
  "Backend & SQL Engineering",
  "Database Delivery & Automation",
  "Cloud Delivery & Operational Analytics",
  "AI-Assisted Developer Tooling",
] as const;

const stackGroups = [
  ["Database & SQL Engineering", "Used at work"],
  ["Backend Application Engineering", "Built with in projects"],
  ["Cloud, Delivery & Analytics", "Used at work"],
  ["AI-Assisted Engineering", "Part of my workflow"],
  ["Frontend & Product Engineering", "Built with in projects"],
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
    "#about",
    "#experience",
    "#work",
    "#stack",
    "#presence",
    "#contact",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
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

async function expectPortfolioContentWithinViewport(page: Page) {
  const result = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const documentWidth = document.documentElement.scrollWidth;
    const selectors = [
      "#experience h2",
      "#experience h3",
      "#experience h4",
      "#experience h5",
      "#experience p",
      "#experience li",
      "#experience strong",
      "#experience [data-experience-dossier]",
      "#stack h2",
      "#stack h3",
      "#stack p",
      "#stack li",
      "#stack [data-stack-card]",
    ];
    const offenders: Array<{ selector: string; left: number; right: number }> = [];

    for (const selector of selectors) {
      document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
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
          offenders.push({
            selector: `${selector}:nth(${index})`,
            left: rect.left,
            right: rect.right,
          });
        }
      });
    }

    const clipped = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#experience [data-experience-dossier], " +
          "#experience [data-experience-workstream], " +
          "#stack [data-stack-card]"
      )
    )
      .filter(
        (element) =>
          element.scrollWidth > element.clientWidth + 1 ||
          element.scrollHeight > element.clientHeight + 1
      )
      .map((element) =>
        element.getAttribute("data-experience-workstream") ??
        element.getAttribute("data-experience-dossier") ??
        element.getAttribute("data-stack-card") ??
        element.tagName
      );

    return { viewportWidth, documentWidth, offenders, clipped };
  });

  expect(result.documentWidth).toBeLessThanOrEqual(result.viewportWidth + 1);
  expect(result.offenders).toEqual([]);
  expect(result.clipped).toEqual([]);
}

async function getCardBoxes(page: Page) {
  return page.locator("#stack [data-stack-card]").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })
  );
}

function rowCounts(boxes: Array<{ y: number }>, tolerance = 8) {
  const rows: number[] = [];
  const tops: number[] = [];

  for (const box of boxes) {
    const rowIndex = tops.findIndex((top) => Math.abs(top - box.y) <= tolerance);
    if (rowIndex === -1) {
      tops.push(box.y);
      rows.push(1);
    } else {
      rows[rowIndex] += 1;
    }
  }

  return rows;
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

test("renders the approved Ostrum dossier and context-labelled stack", async ({ page }) => {
  await openHome(page, true);

  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();
  await expect(experience.locator("[data-experience-dossier]")).toHaveCount(1);
  await expect(
    experience.getByRole("heading", { level: 3, name: /Ostrum Tech Limited/i })
  ).toHaveCount(1);

  await expect(
    experience.getByRole("heading", { level: 5, name: "Software Engineer", exact: true })
  ).toHaveCount(1);
  await expect(
    experience.getByRole("heading", {
      level: 5,
      name: "Software Engineer Intern",
      exact: true,
    })
  ).toHaveCount(1);
  await expect(experience.getByText("Sep 2024 — Present", { exact: true })).toHaveCount(1);
  await expect(experience.getByText("May 2024 — Aug 2024", { exact: true })).toHaveCount(1);

  await expect(
    experience.getByText(
      "At Ostrum, the database is part of the backend execution layer—not just storage.",
      { exact: false }
    )
  ).toHaveCount(1);
  await expect(
    experience.getByText("My work has covered workflow orchestration", { exact: false })
  ).toHaveCount(1);

  await expect(experience.locator("[data-experience-workstream]")).toHaveCount(4);
  for (const name of workstreamNames) {
    await expect(
      experience.getByRole("heading", { level: 5, name, exact: true })
    ).toHaveCount(1);
  }
  expect(await experience.locator("[data-experience-workstream] strong").count()).toBeGreaterThan(7);

  const experienceHeadingLevels = await experience
    .locator("h2, h3, h4, h5, h6")
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
  expect(experienceHeadingLevels[0]).toBe(2);
  for (let index = 1; index < experienceHeadingLevels.length; index += 1) {
    expect(experienceHeadingLevels[index] - experienceHeadingLevels[index - 1]).toBeLessThanOrEqual(1);
  }

  const stack = page.locator("#stack");
  await stack.scrollIntoViewIfNeeded();
  await expect(stack.locator("[data-stack-card]")).toHaveCount(5);
  for (const [label, evidence] of stackGroups) {
    const card = stack.locator("[data-stack-card]").filter({ hasText: label });
    await expect(card).toHaveCount(1);
    await expect(card.getByText(evidence, { exact: true })).toHaveCount(1);
  }

  const aiCard = stack.locator('[data-stack-card="ai"]');
  await expect(aiCard).toContainText("Claude Code");
  await expect(aiCard).toContainText("OpenAI Codex");
  await expect(aiCard).toContainText("Context engineering");
  await expect(aiCard).toContainText("Guardrails");
  await expect(aiCard).toContainText("Human validation");
  await expect(aiCard).not.toContainText(
    /TypeScript|React(?: 19)?|Next\.js|CSS Modules|MDX|Motion|Lenis|Playwright|Tkinter/
  );

  const frontendCard = stack.locator('[data-stack-card="frontend"]');
  await expect(frontendCard).toContainText("TypeScript");
  await expect(frontendCard).toContainText("Next.js 16");
  await expect(frontendCard).toContainText("Playwright");
  await expect(stack.locator('[data-stack-card="development"]')).toContainText(
    "Data structures & algorithms"
  );
  await expect(stack.locator('[data-stack-card="cloud"]')).toContainText(
    "Python / Tkinter release tooling"
  );
});

test("keeps Experience and Stack reflow-safe at the project viewport", async ({
  page,
}, testInfo) => {
  await openHome(page, true);
  await sweepWholePage(page);

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (testInfo.project.name.includes("landscape")) {
    expect(viewport!.width).toBeGreaterThan(viewport!.height);
  }

  await expectPortfolioContentWithinViewport(page);

  const roleRail = page.locator("#experience [data-experience-role-rail]");
  const workstreams = page.locator("#experience [data-experience-workstreams]");
  const [roleBox, workBox] = await Promise.all([
    roleRail.boundingBox(),
    workstreams.boundingBox(),
  ]);
  expect(roleBox).not.toBeNull();
  expect(workBox).not.toBeNull();

  if (viewport!.width < 1024) {
    expect(workBox!.y).toBeGreaterThanOrEqual(roleBox!.y + roleBox!.height - 1);
  } else {
    expect(workBox!.x).toBeGreaterThanOrEqual(roleBox!.x + roleBox!.width - 1);
    expect(Math.abs(workBox!.y - roleBox!.y)).toBeLessThanOrEqual(1);
  }

  const cards = await getCardBoxes(page);
  expect(cards).toHaveLength(5);
  const rows = rowCounts(cards);
  if (viewport!.width < 768) {
    expect(rows).toEqual([1, 1, 1, 1, 1]);
  } else if (viewport!.width < 1200) {
    expect(rows).toEqual([2, 2, 1]);
  } else {
    expect(rows).toEqual([2, 3]);
    expect(cards[0].width).toBeGreaterThan(cards[2].width * 1.35);
    expect(Math.abs(cards[0].width - cards[1].width)).toBeLessThanOrEqual(2);
    expect(Math.abs(cards[2].width - cards[3].width)).toBeLessThanOrEqual(2);
    expect(Math.abs(cards[3].width - cards[4].width)).toBeLessThanOrEqual(2);
  }
});

test("aligns the cobalt arc with the Experience title without collisions", async ({ page }) => {
  await openHome(page, true);
  await page.locator("#experience [data-experience-header]").scrollIntoViewIfNeeded();

  const title = page.locator("#experience [data-experience-title]");
  const arc = page.locator("#experience [data-experience-arc]");
  const callout = page.locator("#experience [data-experience-header] > p");
  const dossier = page.locator("#experience [data-experience-dossier]");
  await expect(title).toBeVisible();
  await expect(arc).toBeVisible();

  const [titleBox, arcBox, calloutBox, dossierBox, viewport] = await Promise.all([
    title.boundingBox(),
    arc.boundingBox(),
    callout.boundingBox(),
    dossier.boundingBox(),
    Promise.resolve(page.viewportSize()),
  ]);
  expect(titleBox).not.toBeNull();
  expect(arcBox).not.toBeNull();
  expect(calloutBox).not.toBeNull();
  expect(dossierBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(
    Math.abs(titleBox!.y + titleBox!.height - (arcBox!.y + arcBox!.height))
  ).toBeLessThanOrEqual(8);
  expect(boxesIntersect(arcBox!, calloutBox!)).toBe(false);
  expect(boxesIntersect(arcBox!, dossierBox!)).toBe(false);

  if (viewport!.width < 768) {
    expect(arcBox!.width).toBeGreaterThanOrEqual(40);
    expect(arcBox!.width).toBeLessThanOrEqual(48);
  } else if (viewport!.width < 1024) {
    expect(arcBox!.width).toBeGreaterThanOrEqual(56);
    expect(arcBox!.width).toBeLessThanOrEqual(66);
  } else {
    expect(arcBox!.width).toBeGreaterThanOrEqual(76);
    expect(arcBox!.width).toBeLessThanOrEqual(92);
  }
});

test("reduced motion renders the settled dossier and complete arc immediately", async ({ page }) => {
  await openHome(page, true);
  await page.locator("#experience").scrollIntoViewIfNeeded();

  const arcPath = page.locator('#experience [data-riso-arc-path="true"]');
  await expect(arcPath).toBeVisible();
  const arcState = await arcPath.evaluate((path) => ({
    inlineStyle: path.getAttribute("style"),
    dashOffset: getComputedStyle(path).strokeDashoffset,
  }));
  expect(arcState.inlineStyle ?? "").not.toContain("stroke-dashoffset");
  expect(["0px", "0", "normal"]).toContain(arcState.dashOffset);

  const workstreams = page.locator("#experience [data-experience-workstream]");
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

  for (const target of [
    page.locator("#experience [data-experience-title]").locator(".."),
    page.locator("#experience [data-experience-header] > p"),
  ]) {
    const state = await target.evaluate((element) => ({
      opacity: Number.parseFloat(getComputedStyle(element).opacity),
      transform: getComputedStyle(element).transform,
    }));
    expect(state.opacity).toBe(1);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(state.transform);
  }
});

test("the scroll-linked arc draws monotonically and the title remains revealed", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One deterministic motion probe is sufficient");
  await openHome(page);

  const header = page.locator("#experience [data-experience-header]");
  const path = page.locator('#experience [data-riso-arc-path="true"]');
  const headerTop = await header.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY
  );
  const viewportHeight = page.viewportSize()!.height;

  const drawnLengthAt = async (viewportFraction: number) => {
    const targetY = Math.max(0, Math.round(headerTop - viewportHeight * viewportFraction));
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "auto" }), targetY);
    await settleFrame(page);
    return path.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).strokeDasharray.split(/[ ,]/)[0])
    );
  };

  const earlyLength = await drawnLengthAt(0.81);
  const middleLength = await drawnLengthAt(0.68);
  const settledLength = await drawnLengthAt(0.52);
  expect(Number.isFinite(earlyLength)).toBe(true);
  expect(middleLength).toBeGreaterThan(earlyLength);
  expect(settledLength).toBeGreaterThan(middleLength);
  expect(settledLength - earlyLength).toBeGreaterThan(0.35);

  await page.evaluate(
    ({ top, height }) => window.scrollTo({ top: top + height * 0.9, behavior: "auto" }),
    { top: headerTop, height: viewportHeight }
  );
  await settleFrame(page);
  const titleTokens = page.locator(
    "#experience [data-experience-title] [aria-label='Experience'] > span > span"
  );
  expect(await titleTokens.count()).toBeGreaterThan(0);
  await expect
    .poll(() =>
      titleTokens.evaluateAll((tokens) =>
        tokens.every(
          (token) => Number.parseFloat(getComputedStyle(token).opacity) >= 0.99
        )
      )
    )
    .toBe(true);
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
  await expect(mobileNav).toMatchAriaSnapshot(`
    - navigation "Mobile navigation":
      - link "Hero"
      - link "About"
      - link "Experience"
      - link "Works"
      - link "Tech"
      - link "Presence"
      - link "Contact"
  `);

  const menuPanelPadding = await mobileNav.locator("..").evaluate((panel) => {
    const style = getComputedStyle(panel);
    return {
      top: Number.parseFloat(style.paddingTop),
      right: Number.parseFloat(style.paddingRight),
      bottom: Number.parseFloat(style.paddingBottom),
    };
  });
  expect(menuPanelPadding.top).toBeGreaterThanOrEqual(16);
  expect(menuPanelPadding.right).toBeGreaterThanOrEqual(16);
  expect(menuPanelPadding.bottom).toBeGreaterThanOrEqual(16);

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
    .poll(async () =>
      Math.abs((await page.evaluate(() => window.scrollY)) - openingScrollY)
    )
    .toBeLessThanOrEqual(5);

  await toggle.click();
  await mobileNav.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(mobileNav).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await toggle.click();
  const backdrop = page.locator("[data-mobile-navigation-backdrop]");
  const backdropBox = await backdrop.boundingBox();
  expect(backdropBox).not.toBeNull();
  await backdrop.click({
    position: { x: 4, y: Math.min(100, backdropBox!.height / 2) },
  });
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toBeFocused();

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expectMinimumTargetSize(page.locator("#contact a[aria-label]"));
});

test("touch devices do not retain hover lift or card tilt", async ({ page }, testInfo) => {
  test.skip(!isTouchProject(testInfo), "Touch-only interaction contract");
  await openHome(page);
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(false);

  const card = page.locator("#stack [data-stack-card]").first();
  await card.scrollIntoViewIfNeeded();

  const isSettled = () =>
    card.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === "none") {
        return true;
      }
      const matrix = new DOMMatrixReadOnly(transform);
      return (
        Math.abs(matrix.m12) < 0.005 &&
        Math.abs(matrix.m13) < 0.005 &&
        Math.abs(matrix.m21) < 0.005 &&
        Math.abs(matrix.m23) < 0.005 &&
        Math.abs(matrix.m31) < 0.005 &&
        Math.abs(matrix.m32) < 0.005 &&
        Math.abs(matrix.m41) < 0.5 &&
        Math.abs(matrix.m42) < 0.5
      );
    });

  await expect.poll(isSettled).toBe(true);
  await card.tap();
  await page.locator("#stack h2").tap();
  await expect.poll(isSettled).toBe(true);
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow))
    .toBe("none");
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
