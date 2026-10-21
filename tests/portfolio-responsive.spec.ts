import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page, TestInfo } from "@playwright/test";

const workstreamNames = [
  "Database engineering",
  "Release and delivery",
  "Tooling and analytics",
  "Ownership and collaboration",
] as const;

const stackGroups = [
  ["AI-assisted engineering", "Part of my workflow"],
  ["Backend systems and APIs", "Built in projects"],
  ["Cloud delivery and reporting", "Used at work"],
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
    "#contact",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect(page.locator(selector)).toBeVisible();
    await settleFrame(page);
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
    await settleFrame(page);

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

test("shows the Ostrum summary and opens the full technical experience", async ({ page }) => {
  await openHome(page, true);

  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();
  await expect(experience.getByRole("heading", { level: 3, name: "Ostrum Tech Limited" })).toBeVisible();
  await expect(experience.getByRole("heading", { level: 4, name: "Database Engineer" })).toBeVisible();
  await expect(experience.getByText("May 2024 to present", { exact: true })).toBeVisible();
  await expect(experience.getByText("September 2024 to present", { exact: true })).toBeVisible();
  const employmentNote = experience.getByText(
    "Started as an intern in May 2024; full-time Database Engineer since September 2024.",
    { exact: true }
  );
  const roleScope = experience.getByText(/Develop MySQL-backed business logic for API workflows/);
  const disclosure = experience.locator("#experience-full-toggle");
  const panel = experience.locator("#experience-full");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(panel).toHaveAttribute("inert", "");
  await expect(panel).toHaveCSS("height", "0px");
  await expect(panel).toHaveCSS("overflow", "hidden");

  const summaryPoints = experience.getByRole("list").first().getByRole("listitem");
  await expect(summaryPoints).toHaveCount(3);
  await expect(summaryPoints.nth(0)).toContainText("MySQL stored procedures, functions, triggers, views, and schema changes");
  await expect(summaryPoints.nth(1)).toContainText("version-controlled Flyway migrations");
  await expect(summaryPoints.nth(2)).toContainText("Designed and built Database Toolkit, a Python and Qt desktop app");

  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await expect(disclosure).toHaveAttribute("aria-controls", "experience-full");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(disclosure).toContainText("FULL EXPERIENCE");
  expect(await panel.textContent()).toContain("Work with senior engineers and technical managers");

  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(employmentNote).toBeVisible();
  await expect(roleScope).toBeVisible();
  for (const phrase of ["Design relational schemas and indexes", "Trace defects across API requests", "AWS-integrated database delivery"]) {
    await expect(panel.getByText(new RegExp(phrase))).toBeVisible();
  }
  for (const name of workstreamNames) {
    await expect(panel.getByRole("heading", { level: 4, name, exact: true })).toBeVisible();
  }
  const toolkitImages = panel.getByRole("img");
  await expect(toolkitImages).toHaveCount(2);
  await expect(toolkitImages.nth(0)).toHaveAttribute("alt", /Table Compare results/);
  await expect(toolkitImages.nth(1)).toHaveAttribute("alt", /INSERT Consolidator/);
  for (const image of await toolkitImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }

  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("aria-hidden", "true");

  const stack = page.locator("#stack");
  await stack.scrollIntoViewIfNeeded();
  for (const [label, context] of stackGroups) {
    const group = stack.locator("li").filter({ hasText: label });
    await expect(group).toHaveCount(1);
    await expect(group).toContainText(context);
  }
});

test("full experience disclosure supports Enter, Space, and its deep link", async ({ page }) => {
  await openHome(page, true);
  const button = page.locator("#experience-full-toggle");

  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(button).toBeFocused();

  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("aria-expanded", "false");

  await page.goto("/#experience-full");
  const deepLinkButton = page.locator("#experience-full-toggle");
  await expect(deepLinkButton).toHaveAttribute("aria-expanded", "true");
  await expect(deepLinkButton).toContainText("FULL EXPERIENCE");
  await expect(page.locator("#experience-full")).toBeVisible();
});

test("uses the approved marquee and contact copy", async ({ page }) => {
  await openHome(page, true);
  const marquee = await page.locator('[data-marquee] [aria-hidden="true"]').textContent();
  for (const phrase of [
    "Backend systems",
    "Database design",
    "API and data contracts",
    "Reliable releases",
    "Internal developer tools",
    "Product interfaces",
    "End-to-end builds",
    "AI-assisted engineering",
  ]) {
    expect(marquee).toContain(phrase);
  }

  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  await expect(contact.getByRole("heading", { name: "Let's build." })).toBeVisible();
  await expect(contact.getByText("Full-time roles, contract work or a scoped project: all welcome.", { exact: true })).toBeVisible();
  await expect(contact.getByRole("link", { name: "abhinavp0304@gmail.com" })).toBeVisible();
  const email = contact.getByRole("link", { name: "abhinavp0304@gmail.com" });
  await email.focus();
  await expect(email).toHaveCSS("outline-style", "solid");
  await expect(email).toHaveCSS("outline-width", "2px");
  await expect(email).toHaveCSS("outline-color", "rgb(237, 230, 218)");
  await expect(email).toHaveCSS("outline-offset", "3px");
  await expect(contact.getByRole("link", { name: "Download résumé" })).toBeVisible();
  const linkedin = contact.getByRole("link", { name: "Connect on LinkedIn" });
  await expect(linkedin).toBeVisible();
  await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/k2ocabhinav22");
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
  await expect(contact.getByRole("link", { name: "GitHub" })).toHaveCount(0);
});

test("hyphenated service titles wrap only between words", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width title probes");

  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);

    const title = page.locator('#about [data-service-id="developer-tooling"] h3');
    await expect(title).toHaveText("AI-assisted delivery");
    const geometry = await title.evaluate((element) => {
      const hyphenatedWord = element.querySelector<HTMLElement>("span");
      const deliveryNode = [...element.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes("delivery")
      );
      if (!hyphenatedWord || !(deliveryNode instanceof Text)) {
        throw new Error("Service title words are missing");
      }
      const range = document.createRange();
      const start = deliveryNode.data.indexOf("delivery");
      range.setStart(deliveryNode, start);
      range.setEnd(deliveryNode, start + "delivery".length);
      const deliveryRect = range.getBoundingClientRect();
      const wordRect = hyphenatedWord.getBoundingClientRect();
      const tileRect = element.closest("article")?.getBoundingClientRect();
      return {
        wordLines: hyphenatedWord.getClientRects().length,
        wordRight: wordRect.right,
        deliveryTop: deliveryRect.top,
        wordTop: wordRect.top,
        tileRight: tileRect?.right ?? 0,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    expect(geometry.wordLines).toBe(1);
    expect(geometry.wordRight).toBeLessThanOrEqual(geometry.tileRight);
    expect(geometry.documentWidth).toBe(geometry.viewportWidth);
    if (width <= 390) expect(geometry.deliveryTop).toBeGreaterThan(geometry.wordTop);
  }
});

test("LinkedIn is one tap away from the rail, phone menu, and case study", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");
  const linkedinHref = "https://www.linkedin.com/in/k2ocabhinav22";
  const accessibleName = "Abhinav Prasad on LinkedIn (opens in a new tab)";

  await openHome(page, true);
  const rail = page.getByRole("navigation", { name: "Section navigation" });
  const railLink = rail.getByRole("link", { name: accessibleName });
  await expect(railLink).toBeVisible();
  await expect(railLink).toHaveAttribute("href", linkedinHref);
  await expect(railLink).toHaveAttribute("target", "_blank");
  await expect(railLink).toHaveAttribute("rel", "noopener noreferrer");
  await railLink.focus();
  await expect(railLink).toHaveCSS("outline-style", "solid");

  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page, true);
  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  const mobileLink = mobileNav.getByRole("link", { name: accessibleName });
  await expect(mobileLink).toBeVisible();
  await expect(mobileLink).toHaveAttribute("href", linkedinHref);
  await expect(mobileLink).toHaveAttribute("target", "_blank");
  await expect(mobileLink).toHaveAttribute("rel", "noopener noreferrer");
  const mobileBox = await mobileLink.boundingBox();
  expect(mobileBox).not.toBeNull();
  expect(mobileBox!.height).toBeGreaterThanOrEqual(44);
  for (const name of [accessibleName, "Email", "Résumé"]) {
    await expect(mobileNav.getByRole("link", { name })).toHaveCount(1);
    await expect(mobileNav.getByRole("link", { name }).locator("svg")).toHaveCount(1);
  }

  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/work/velo");
  const caseStudyRail = page.getByRole("navigation", { name: "Contact navigation" });
  const caseStudyLink = caseStudyRail.getByRole("link", { name: accessibleName });
  await expect(caseStudyLink).toBeVisible();
  await expect(caseStudyLink).toHaveAttribute("href", linkedinHref);
  await expect(caseStudyLink).toHaveAttribute("target", "_blank");
  await expect(caseStudyLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("keeps hero facts separate and What I do specific", async ({ page }) => {
  await openHome(page, true);

  await expect(page.locator("[data-hero]")).toHaveCount(1);
  await expect(page.locator("[data-hero-text]")).toHaveCount(1);
  await expect(page.locator("[data-hero-wordmark]")).toHaveCount(1);
  await expect(page.locator('[data-hero-identity="true"]')).toHaveText("Full-stack engineer");
  await expect(page.getByText("I build products end to end, from the first conversation to release.", { exact: true })).toBeVisible();
  const atWork = page.locator('[data-hero-facts="true"] a').nth(0);
  const onMyOwn = page.locator('[data-hero-facts="true"] a').nth(1);
  await expect(atWork).toHaveAttribute("href", "#experience");
  await expect(atWork).toContainText("At work");
  await expect(atWork).toContainText("Database Engineer, Ostrum Tech Limited");
  await expect(atWork).not.toContainText(/Forward deployed/i);
  await expect(onMyOwn).toHaveAttribute("href", "#work");
  await expect(onMyOwn).toContainText("On my own");
  await expect(onMyOwn).toContainText("Forward deployed builds: Velo, this site, AI‑agent workflows");
  const whatIDo = page.locator("#about");
  await expect(whatIDo.getByRole("heading", { name: "What I do" })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "Backend and APIs" })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "Full-stack products" })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "AI-assisted delivery" })).toBeVisible();
  await expect(whatIDo).toContainText("Java and Spring Boot services, REST APIs, authentication, realtime messaging and the relational models underneath.");
  await expect(whatIDo).toContainText("I scope work for AI coding agents, run independent pieces in parallel and review every change before it ships.");
  await expect(whatIDo.locator("[data-service-id]")).toHaveCount(3);
  const aboutSpec = page.locator("#about-spec");
  await expect(aboutSpec.getByText("I design backends first: the services, the APIs and the data behind them, then carry the product through to the interface.", { exact: true })).toBeVisible();
  await expect(aboutSpec.getByText("At Ostrum, I work on MySQL-backed API behaviour and versioned database releases.", { exact: true })).toBeVisible();
  await expect(aboutSpec.getByText("On my own, I take products from the backend to the interface, with AI coding agents doing scoped work under my review.", { exact: true })).toBeVisible();
  await expect(aboutSpec.getByText("Open to full-time roles, contract work and scoped projects.", { exact: true })).toBeVisible();
  expect((await page.locator("body").innerText()).match(/forward deployed/gi)).toHaveLength(1);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.getByText("On my own builds, I choose the coding tool and model for each task, run independent pieces in parallel, and review every change before it ships.", { exact: true })).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText([
    "Scope",
    "Assign",
    "Review",
    "Verify",
  ]);
  await expect(method.locator("ol > li p")).toHaveText([
    "Define the change and what done means.",
    "Pick the coding tool and model that suits the task; run independent pieces in parallel, each in isolation.",
    "Read every change against the task and the existing code.",
    "Run the checks and walk the real flow in a browser.",
  ]);
  await expect(method.locator("ol > li span")).toHaveText(["01", "02", "03", "04"]);
  await expect(method.locator("svg[viewBox='0 0 420 500']")).toBeVisible();
  await expect(method).toHaveCSS("background-color", "rgb(53, 30, 40)");
  const stepColumns = await method.locator("ol").evaluate(
    (list) => getComputedStyle(list).gridTemplateColumns.trim().split(/\s+/).length
  );
  expect(stepColumns).toBe(page.viewportSize()!.width <= 900 ? 2 : 4);
  await expect(page.locator("#stack p")).toHaveText("Tools I use across work and projects");
});

test("home content shares the rail-safe inset and hides rail labels under 1100px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer layout contract");

  for (const width of [768, 1024, 1099]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    const tiles = page.locator("#about [data-service-id]");
    await expect(tiles).toHaveCount(3);
    await settleFrame(page);
    const rail = page.getByRole("navigation", { name: "Section navigation" });
    const labels = rail.locator("a > span");
    const boxes = await tiles.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right };
    }));
    const expectedLeft = Math.max(20, Math.min(78, width * 0.054));
    const rightInset = Math.max(148, width * 0.1);
    expect(boxes[0]?.left).toBeGreaterThanOrEqual(expectedLeft - 1);
    for (const box of boxes) expect(box.right).toBeLessThanOrEqual(width - rightInset + 1);
    await expect.poll(() => labels.evaluateAll((elements) => elements.every(
      (element) => getComputedStyle(element).opacity === "0"
    ))).toBe(true);
    await expect(rail.locator("a[aria-label='Experience']")).toHaveCount(1);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page, true);
  const rail = page.getByRole("navigation", { name: "Section navigation" });
  const marquee = page.locator('[data-marquee="true"]');
  await marquee.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2, behavior: "instant" });
  });
  await expect(rail).toHaveAttribute("data-marquee-under-rail", "true");
  await expect.poll(() => rail.locator("a > span").evaluateAll((elements) => elements.every(
    (element) => getComputedStyle(element).opacity === "0"
  ))).toBe(true);
  await expect(rail.locator('a[href="#contact"] [data-rail-dot]')).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(rail).not.toHaveAttribute("data-marquee-under-rail", "true");
});

test("Stack chips wrap beneath the heading and How I work keeps a clear tablet gutter", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width layout contract");
  await page.setViewportSize({ width: 768, height: 1024 });
  await openHome(page, true);

  const stack = page.locator("#stack");
  await stack.scrollIntoViewIfNeeded();
  const stackGeometry = await stack.evaluate((section) => {
    const heading = section.querySelector("h2")!.getBoundingClientRect();
    const chips = Array.from(section.querySelectorAll("[data-stack-strip] li"), (item) => item.getBoundingClientRect());
    return {
      headingBottom: heading.bottom,
      firstChipTop: chips[0]?.top ?? 0,
      chipRows: new Set(chips.map((rect) => Math.round(rect.top))).size,
    };
  });
  expect(stackGeometry.firstChipTop).toBeGreaterThan(stackGeometry.headingBottom);
  expect(stackGeometry.chipRows).toBeGreaterThan(1);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  const columnGap = await method.locator("ol").evaluate((list) => Number.parseFloat(getComputedStyle(list).columnGap));
  expect(columnGap).toBeGreaterThanOrEqual(24);
});

test("project cards keep their numerals, artwork, copy alignment, and current copy", async ({ page }) => {
  await openHome(page, true);

  const cards = page.locator("#work [data-work-card='true']");
  await expect(cards).toHaveCount(2);
  const velo = cards.nth(0);
  const portfolio = cards.nth(1);

  await expect(velo.getByRole("heading", { level: 3, name: "Velo, a white-label dispatch prototype" })).toBeVisible();
  await expect(velo.getByText("Case 01", { exact: true })).toBeVisible();
  await expect(velo.locator("svg[viewBox='0 0 116 92']")).toBeVisible();
  await expect(velo.locator("svg[viewBox='0 0 680 120']")).toBeVisible();
  await expect(velo.getByText("A pre-launch dispatch prototype for rider bookings, admin dispatch, and driver trip controls.", { exact: true })).toBeVisible();

  await expect(portfolio.getByRole("heading", { level: 3, name: "Portfolio publishing system" })).toBeVisible();
  await expect(portfolio.getByText("Case 02", { exact: true })).toBeVisible();
  await expect(portfolio.locator("svg[viewBox='0 0 116 92']")).toBeVisible();
  await expect(portfolio.locator("[data-work-media] img")).toHaveAttribute(
    "alt",
    "A diagram showing typed project content feeding the homepage and project pages"
  );
  await expect(portfolio.locator("[data-work-media] img")).toHaveCSS("object-fit", "contain");

  const alignment = await velo.evaluate((card) => {
    const copy = card.querySelector<HTMLElement>("[data-work-copy='true']");
    const title = copy?.querySelector<HTMLElement>("h3");
    if (!copy || !title) throw new Error("Velo card copy is missing");
    return Math.abs(copy.getBoundingClientRect().left - title.getBoundingClientRect().left);
  });
  expect(alignment).toBeLessThanOrEqual(1);
});

test("work cards stack artwork first and keep their labels on one line below 900px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width card geometry");

  for (const width of [320, 390, 768, 900]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const cards = page.locator("#work [data-work-card]");

    for (let index = 0; index < await cards.count(); index += 1) {
      const card = cards.nth(index);
      const art = card.locator("[data-work-media]");
      const copy = card.locator("[data-work-copy]");
      await art.scrollIntoViewIfNeeded();
      const [artBox, copyBox] = await Promise.all([art.boundingBox(), copy.boundingBox()]);
      expect(artBox).not.toBeNull();
      expect(copyBox).not.toBeNull();
      expect(artBox!.y + artBox!.height).toBeLessThanOrEqual(copyBox!.y + 1);
      const caseNumber = card.getByText(new RegExp(`^Case 0${index + 1}$`));
      await expect(caseNumber).toHaveCSS("white-space", "nowrap");
    }

    const cta = page.locator("#work [data-work-card] [data-work-copy] a[href^='/work/']").first();
    const ctaState = await cta.evaluate((element) => ({
      whiteSpace: getComputedStyle(element).whiteSpace,
      overflow: element.scrollWidth - element.clientWidth,
      right: element.getBoundingClientRect().right,
    }));
    if (width >= 768) {
      expect(ctaState.whiteSpace).toBe("nowrap");
    } else {
      expect(ctaState.right).toBeLessThanOrEqual(width + 1);
    }
    expect(ctaState.overflow).toBeLessThanOrEqual(1);
  }
});

test("case captions sit below their frames on narrow phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width caption geometry");

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await openHome(page, true);
    for (const card of await page.locator("#work [data-work-card]").all()) {
      const frame = card.locator("[data-work-frame]");
      const caption = card.locator("[data-media-caption]");
      const [frameBox, captionBox] = await Promise.all([frame.boundingBox(), caption.boundingBox()]);
      expect(frameBox).not.toBeNull();
      expect(captionBox).not.toBeNull();
      expect(captionBox!.y).toBeGreaterThanOrEqual(frameBox!.y + frameBox!.height - 1);
    }
  }
});

test("selected projects overprint follows the heading wrap", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width heading geometry");

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const heading = page.locator("#work h2[data-overprint]");
    await heading.scrollIntoViewIfNeeded();
    const geometry = await heading.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const text = element.querySelector<HTMLElement>("[role='img']");
      const textRect = text?.getBoundingClientRect();
      const overprint = getComputedStyle(element, "::after");
      const transform = new DOMMatrixReadOnly(overprint.transform);
      return {
        rectWidth: rect.width,
        textWidth: textRect?.width ?? 0,
        content: overprint.content,
        offsetX: transform.m41,
        offsetY: transform.m42,
        textWrap: overprint.textWrap,
      };
    });
    expect(geometry.content).toBe('"Selected projects"');
    expect(geometry.textWidth).toBeGreaterThan(0);
    expect(geometry.textWidth).toBeLessThanOrEqual(geometry.rectWidth + 1);
    expect(geometry.offsetX).toBeGreaterThanOrEqual(1);
    expect(geometry.offsetX).toBeLessThanOrEqual(3);
    expect(geometry.offsetY).toBeGreaterThanOrEqual(1);
    expect(geometry.offsetY).toBeLessThanOrEqual(3);
    expect(geometry.textWrap).toBe("balance");
    await expect(page.getByText("Dispatch prototype, publishing platform, and the method behind both.", { exact: true }))
      .toHaveCSS("text-wrap", "balance");
  }
});

test("project cards tilt on fine pointers without hiding the native cursor", async ({
  page,
}, testInfo) => {
  test.skip(isTouchProject(testInfo), "Fine-pointer interaction contract");
  await openHome(page);

  const media = page.locator("#work [data-work-media]").first();
  await media.scrollIntoViewIfNeeded();
  const before = await media.evaluate((element) => getComputedStyle(element).transform);
  await media.hover({ position: { x: 2, y: 180 } });
  await expect.poll(() => media.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);

  const nativeCursor = await page.locator("#work").evaluate(
    (section) => getComputedStyle(section).cursor
  );
  expect(nativeCursor).not.toBe("none");
});

test("registration cursor changes ink over panels and stays off for reduced motion", async ({
  page,
}, testInfo) => {
  test.skip(isTouchProject(testInfo), "Fine-pointer interaction contract");
  await openHome(page);

  const cursor = page.locator('[data-site-chrome="cursor-orb"]');
  await page.mouse.move(200, 200);
  await expect(cursor).toHaveAttribute("data-visible", "true");
  await expect(cursor).toHaveCSS("opacity", "1");

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.hover();
  await expect(cursor).toHaveAttribute("data-theme", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cursor).toHaveCSS("display", "none");
  await expect(cursor).toHaveAttribute("data-visible", "false");
});

test("server-rendered hero facts stay visible before hydration", async ({ page }) => {
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const facts = page.locator('[data-hero-facts="true"] a');
  await expect(page.getByText("Full-stack engineer", { exact: true })).toBeVisible();
  await expect(facts).toHaveCount(2);
  await expect(facts.nth(0)).toContainText("Database Engineer, Ostrum Tech Limited");
  await expect(facts.nth(1)).toContainText("Forward deployed builds: Velo, this site, AI‑agent workflows");

  for (let index = 0; index < 2; index += 1) {
    const row = facts.nth(index);
    const box = await row.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(row).toHaveCSS("opacity", "1");
  }
});

test("hero facts use ink on hover and keyboard focus, with a static reduced-motion path", async ({ page }, testInfo) => {
  test.skip(isTouchProject(testInfo), "Hover and keyboard focus states need a fine pointer");
  await openHome(page);
  const rows = page.locator('[data-hero-facts="true"] a');

  await rows.nth(0).hover();
  await expect(rows.nth(0)).toHaveCSS("color", "rgb(237, 230, 218)");
  await expect(rows.nth(0)).toHaveCSS("box-shadow", "rgba(53, 30, 40, 0.22) 2px 2px 0px 0px");

  await page.keyboard.press("Tab");
  await rows.nth(1).focus();
  await expect(rows.nth(1)).toHaveCSS("color", "rgb(237, 230, 218)");
  await expect(rows.nth(1)).toHaveCSS("outline-style", "solid");

  await openHome(page, true);
  const label = page.locator('[data-hero-facts="true"] a').first().locator("span").first();
  const state = await label.evaluate((element) => ({
    opacity: getComputedStyle(element).opacity,
    transform: getComputedStyle(element).transform,
    animationName: getComputedStyle(element).animationName,
  }));
  expect(state).toEqual({ opacity: "1", transform: "none", animationName: "none" });
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
  const callout = experience.locator("[data-experience-callout]");
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

  const disclosure = experience.locator("#experience-full-toggle");
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const workstreams = experience.locator("#experience-full section");
  await expect(workstreams).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const workstream = workstreams.nth(index);
    await expect(workstream).toBeVisible();
    await expect.poll(
      () => workstream.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
      { timeout: 250 }
    ).toBe(1);
    await expect.poll(
      () => workstream.evaluate((element) => getComputedStyle(element).transform),
      { timeout: 250 }
    ).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  }
});

test("the scroll-linked arc draws during the Experience heading transit", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One deterministic motion probe is sufficient");
  await openHome(page);

  const header = page.locator("[data-experience-header]");
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
  await toggle.focus();
  await expect(page.locator('[data-site-chrome="navigation-toggle"]')).toHaveAttribute(
    "data-hamburger-hidden",
    "false"
  );
  await expect(toggle).toBeInViewport();
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
    "Experience",
    "Work",
    "Stack",
    "Contact",
    "LinkedIn",
    "Email",
    "Résumé",
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
  const contact = page.locator("#contact");
  await expectMinimumTargetSize(contact.locator('a[href^="mailto:"]'));
  await expectMinimumTargetSize(contact.getByRole("link", { name: "Connect on LinkedIn" }));
  await expectMinimumTargetSize(contact.getByRole("link", { name: "Download résumé" }));
});

test("phone tab order reaches the menu before the page content", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "One phone keyboard contract");
  await openHome(page, true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("the phone menu trigger clears the reading column and returns on scroll up", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "One phone scroll contract");
  await openHome(page, true);

  const trigger = page.locator('[data-site-chrome="navigation-toggle"]');
  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(trigger).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "auto" }));
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollBy({ top: 24, behavior: "auto" }));
      return trigger.getAttribute("data-hamburger-hidden");
    })
    .toBe("true");
  await expect.poll(() => trigger.evaluate((element) => getComputedStyle(element).opacity)).toBe("0");

  await toggle.focus();
  await expect(trigger).toHaveAttribute("data-hamburger-hidden", "false");
  await expect(trigger).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollBy({ top: -600, behavior: "auto" }));
  await expect(trigger).toHaveAttribute("data-hamburger-hidden", "false");
  await expect(trigger).toHaveCSS("opacity", "1");

  await toggle.click();
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();
  await expect(trigger).toHaveAttribute("data-hamburger-hidden", "false");
  await page.keyboard.press("Escape");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await expect.poll(() => trigger.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" }));
  await expect.poll(() => trigger.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
});

test("a phone menu choice moves focus into the chosen section", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-safari", "One phone keyboard contract");
  await openHome(page, true);

  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await mobileNav.getByRole("link", { name: "Stack", exact: true }).click();

  await expect(mobileNav).toBeHidden();
  await expect(page.locator("#stack h2")).toBeFocused();
  const settled = await page.evaluate(() => window.scrollY);
  await settleFrame(page);
  await settleFrame(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(settled);
});

test("case study skip link moves focus to the project content", async ({ page }) => {
  await page.goto("/work/velo");
  const skip = page.getByRole("link", { name: "Skip to project content" });
  await expect(skip).toBeAttached();
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#project-content")).toBeFocused();
});

test("the footer follows Contact in normal flow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One deterministic geometry probe");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openHome(page);

  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  expect(await page.locator("main footer").count()).toBe(0);

  const geometry = await page.evaluate(() => {
    const contact = document.querySelector<HTMLElement>("#contact");
    const footerElement = document.querySelector<HTMLElement>("footer");
    if (!contact || !footerElement) {
      throw new Error("Missing contact or footer");
    }
    const contactRect = contact.getBoundingClientRect();
    const footerRect = footerElement.getBoundingClientRect();
    return {
      contactBottom: contactRect.bottom + window.scrollY,
      footerTop: footerRect.top + window.scrollY,
      position: getComputedStyle(footerElement).position,
    };
  });

  expect(geometry.position).toBe("relative");
  expect(geometry.footerTop).toBeGreaterThanOrEqual(geometry.contactBottom - 2);
});

test("touch layouts do not retain hover movement on project cards", async ({ page }, testInfo) => {
  test.skip(!isTouchProject(testInfo), "Touch-only interaction contract");
  await openHome(page, true);
  expect(
    await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)
  ).toBe(false);

  const card = page.locator("#work [data-work-card] [data-work-media]").first();
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
  const experienceToggle = page.locator("#experience-full-toggle");
  await experienceToggle.click();
  const experienceImages = page.locator("#experience-full img");
  for (const image of await experienceImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
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

test("the contact email keeps one line at phone, tablet, and small desktop widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");

  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const link = page.locator("#contact [data-contact-email]");
    await link.scrollIntoViewIfNeeded();
    const state = await link.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rect = element.getBoundingClientRect();
      const tops = Array.from(
        new Set(
          Array.from(range.getClientRects())
            .filter((fragment) => fragment.width > 0)
            .map((fragment) => Math.round(fragment.top))
        )
      ).sort((a, b) => a - b);
      return {
        text: element.textContent ?? "",
        lines: tops.length,
        overflow: element.scrollWidth - element.clientWidth,
        height: rect.height,
      };
    });

    expect(state.text).toContain("@");
    expect(state.lines, `email lines at ${width}px`).toBe(1);
    expect(state.overflow, `email overflow at ${width}px`).toBeLessThanOrEqual(1);
    expect(state.height, `email height at ${width}px`).toBeLessThan(60);
  }
});

test("contact actions stay equal width and their labels do not wrap", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const contact = page.locator("#contact");
    const heading = contact.getByRole("heading", { name: "Let's build." });
    await heading.scrollIntoViewIfNeeded();

    const headingState = await heading.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        left: rect.left,
        right: rect.right,
      };
    });
    expect(headingState.scrollWidth, `heading overflow at ${width}px`).toBeLessThanOrEqual(
      headingState.clientWidth + 1
    );
    expect(headingState.left, `heading left at ${width}px`).toBeGreaterThanOrEqual(-1);
    expect(headingState.right, `heading right at ${width}px`).toBeLessThanOrEqual(
      width + 1
    );

    const actions = contact.locator("[data-contact-actions] a");
    await expect(actions).toHaveCount(2);
    const actionStates = await actions.evaluateAll((elements) => elements.map((element) => ({
      width: element.getBoundingClientRect().width,
      overflow: element.scrollWidth - element.clientWidth,
      height: element.getBoundingClientRect().height,
      whiteSpace: getComputedStyle(element).whiteSpace,
    })));
    expect(actionStates[0]?.width).toBeCloseTo(actionStates[1]?.width ?? 0, 1);
    for (const action of actionStates) {
      expect(action.whiteSpace).toBe("nowrap");
      expect(action.overflow, `button text overflow at ${width}px`).toBeLessThanOrEqual(1);
      expect(action.height, `button height at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(action.height, `button height at ${width}px`).toBeLessThan(96);
    }
    await expect(contact.locator("[data-contact-tagline]")).toHaveCSS("text-wrap", "balance");
  }
});

test("Contact actions use the same inversion on the dark panel", async ({ page }, testInfo) => {
  test.skip(isTouchProject(testInfo), "Hover state requires a fine pointer");
  await openHome(page, true);
  const contact = page.locator("#contact");
  await contact.scrollIntoViewIfNeeded();
  const actions = contact.locator("[data-contact-actions] a");

  for (const action of await actions.all()) {
    await action.hover();
    await expect(action).toHaveCSS("background-color", "rgb(237, 230, 218)");
    await expect(action).toHaveCSS("color", "rgb(53, 30, 40)");
  }
});

test("restored sections stay within the viewport from phone to desktop widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width sweep");

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 920 });
    await openHome(page, true);
    await expectSectionsWithinViewport(page, [
      "#about",
      "#experience",
      "#work",
      "#stack",
      "#contact",
    ]);
  }
});

test("the About heading keeps a readable measure on tablets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");

  for (const width of [768, 900, 1023]) {
    await page.setViewportSize({ width, height: 1000 });
    await openHome(page, true);
    const heading = page.locator("#about h2");
    await heading.scrollIntoViewIfNeeded();
    const state = await heading.evaluate((element) => {
      const style = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.textContent = "0".repeat(20);
      probe.style.cssText = [
        "position:absolute",
        "visibility:hidden",
        "white-space:nowrap",
        `font-family:${style.fontFamily}`,
        `font-size:${style.fontSize}`,
        `font-weight:${style.fontWeight}`,
        `letter-spacing:${style.letterSpacing}`,
      ].join(";");
      document.body.appendChild(probe);
      const twentyCharacters = probe.getBoundingClientRect().width;
      probe.remove();
      return {
        width: element.getBoundingClientRect().width,
        twentyCharacters,
        fontSize: Number.parseFloat(style.fontSize),
      };
    });

    expect(state.twentyCharacters).toBeGreaterThan(0);
    expect(state.width, `heading measure at ${width}px`).toBeGreaterThanOrEqual(
      state.twentyCharacters - 0.5
    );
  }
});

test("the marquee runs, pauses for hover, and has a visible transport control", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer contract");
  await openHome(page);
  const marquee = page.locator("[data-marquee]");
  await marquee.scrollIntoViewIfNeeded();
  const track = marquee.locator("[data-marquee-track]");
  const control = page.locator("[data-marquee-control]");
  const trackX = () =>
    track.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
    });

  await expectMinimumTargetSize(control);
  await expect(marquee).toHaveAttribute("data-marquee-running", "true");

  const movingStart = await trackX();
  await expect
    .poll(async () => Math.abs((await trackX()) - movingStart))
    .toBeGreaterThan(0.5);

  const box = await marquee.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(marquee).toHaveAttribute("data-marquee-running", "false");

  await page.mouse.move(10, 10);
  await expect(marquee).toHaveAttribute("data-marquee-running", "true");

  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(marquee).toHaveAttribute("data-marquee-running", "false");
  const pausedAt = await trackX();
  await settleFrame(page);
  expect(await trackX()).toBe(pausedAt);

  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "false");
  await expect(marquee).toHaveAttribute("data-marquee-running", "true");
});

test("Velo dispatch screens show the whole desk on phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probe");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/work/velo");
  const image = page
    .locator('img[alt="Velo Business admin dispatch screen with a live fleet map."]')
    .first();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const state = await image.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const imageElement = element as HTMLImageElement;
    return {
      fit: getComputedStyle(element).objectFit,
      width: rect.width,
      height: rect.height,
      naturalWidth: imageElement.naturalWidth,
      naturalHeight: imageElement.naturalHeight,
    };
  });

  expect(state.fit).toBe("contain");
  expect(state.naturalWidth).toBeGreaterThan(0);
  const renderedRatio = state.width / state.height;
  const naturalRatio = state.naturalWidth / state.naturalHeight;
  expect(Math.abs(renderedRatio - naturalRatio)).toBeLessThan(0.02);
});

test("hovering a project photograph paints nothing over the card copy", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer contract");
  await openHome(page);
  const card = page.locator("#work [data-work-card]").nth(1);
  await card.scrollIntoViewIfNeeded();
  const photo = card.locator("img").first();
  await expect
    .poll(() =>
      photo.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await settleFrame(page);

  const thinRules = await card.evaluate((element) =>
    Array.from(element.querySelectorAll<HTMLElement>("*")).filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.width <= 2 && rect.height >= 100;
    }).length
  );
  expect(thinRules).toBe(0);

  const copy = card.locator("[data-work-copy]");
  await page.mouse.move(10, 10);
  await expect
    .poll(() => photo.evaluate((element) => getComputedStyle(element).filter))
    .toContain("grayscale");
  const before = await copy.screenshot({ animations: "disabled" });

  const photoBox = await photo.boundingBox();
  expect(photoBox).not.toBeNull();
  await page.mouse.move(
    photoBox!.x + photoBox!.width / 2,
    photoBox!.y + photoBox!.height / 2
  );
  await expect
    .poll(() => photo.evaluate((element) => getComputedStyle(element).filter))
    .toBe("none");
  const after = await copy.screenshot({ animations: "disabled" });

  expect(after.equals(before)).toBe(true);
});

test("reduced motion jumps to a section without a smooth animation", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One native scroll probe");
  await openHome(page, true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await settleFrame(page);

  await page
    .locator('nav[aria-label="Section navigation"] a[href="#contact"]')
    .click();
  await settleFrame(page);
  const firstFrame = await page.evaluate(() => window.scrollY);

  expect(firstFrame).toBeGreaterThan(0);
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - firstFrame))
    .toBeLessThanOrEqual(1);
});

test("desktop rail targets clear 44px and dots keep a fixed layout box", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop rail contract");
  await openHome(page, true);

  const rail = page.getByRole("navigation", { name: "Section navigation" });
  const railTargets = rail.locator(":scope > a, :scope > button");
  await expectMinimumTargetSize(railTargets);

  const contactLink = rail.locator('a[href="#contact"]');
  const contactDot = contactLink.locator("[data-rail-dot]");
  const layoutBox = await contactDot.evaluate((dot) => ({
    width: (dot as HTMLElement).offsetWidth,
    height: (dot as HTMLElement).offsetHeight,
  }));
  expect(layoutBox).toEqual({ width: 8, height: 8 });

  await contactLink.hover();
  await expect(contactDot).toHaveCSS(
    "transform",
    "matrix(0.75, 0, 0, 0.75, 0, 0)"
  );
  const hoveredBox = await contactDot.evaluate((dot) => ({
    width: (dot as HTMLElement).offsetWidth,
    height: (dot as HTMLElement).offsetHeight,
  }));
  expect(hoveredBox).toEqual(layoutBox);

  await page.goto("/work/velo");
  const contactRail = page.getByRole("navigation", { name: "Contact navigation" });
  await expectMinimumTargetSize(
    contactRail.locator(":scope > a, :scope > button")
  );
});

test("Velo tenant switcher swaps the dispatch visual in one fixed frame", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One deterministic probe");
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/work/velo");

  const section = page.locator(
    'section[aria-labelledby="velo-tenant-views-title"]'
  );
  await section.scrollIntoViewIfNeeded();
  const business = section.getByRole("radio", { name: "Velo Business" });
  const saffron = section.getByRole("radio", {
    name: "Saffron Routes (demo tenant)",
  });
  await expect(business).toBeChecked();

  const image = section.locator("figure img");
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  const frame = section.locator("figure > div").first();
  const frameBox = await frame.boundingBox();
  expect(frameBox).not.toBeNull();

  await saffron.check();
  await expect(saffron).toBeChecked();
  await expect(image).toHaveAttribute(
    "alt",
    "Saffron Routes admin dispatch screen with a live fleet map."
  );
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await expect(section.getByText("Saffron Routes is a demo tenant.")).toBeVisible();

  const nextFrameBox = await frame.boundingBox();
  expect(nextFrameBox).not.toBeNull();
  expect(nextFrameBox!.width).toBeCloseTo(frameBox!.width, 0);
  expect(nextFrameBox!.height).toBeCloseTo(frameBox!.height, 0);
});
