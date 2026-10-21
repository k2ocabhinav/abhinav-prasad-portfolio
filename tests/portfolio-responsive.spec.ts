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
  await expect(experience.getByText("Database Engineer", { exact: true })).toBeVisible();
  await expect(experience.getByText("May 2024 to present", { exact: true })).toBeVisible();
  await expect(experience.getByText(
    "Started as an intern in May 2024; full-time Database Engineer since September 2024.",
    { exact: true }
  )).toBeVisible();
  await expect(experience.getByText(/Develop MySQL-backed business logic for API workflows/)).toBeVisible();

  const summaryPoints = experience.locator('[aria-label="Role summary"] > li');
  await expect(summaryPoints).toHaveCount(6);
  await expect(summaryPoints.nth(0)).toContainText("MySQL stored procedures, functions, triggers, views, and schema changes");
  await expect(summaryPoints.nth(1)).toContainText("Design relational schemas and indexes");
  await expect(summaryPoints.nth(2)).toContainText("version-controlled Flyway migrations");
  const toolkitSummary = summaryPoints.nth(3).locator("p");
  await expect(toolkitSummary.locator("strong")).toHaveText("Designed and built Database Toolkit,");
  await expect(toolkitSummary).toContainText("a Python and Qt desktop app");
  await expect(summaryPoints.nth(4)).toContainText("Trace defects across API requests");
  await expect(summaryPoints.nth(5)).toContainText("AWS-integrated database delivery");

  const disclosure = experience.locator("#experience-full-toggle");
  const panel = experience.locator("#experience-full");
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await expect(disclosure).toHaveAttribute("aria-controls", "experience-full");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(disclosure).toContainText("4 sections, 14 points");
  expect(await panel.textContent()).toContain("Work with senior engineers and technical managers");

  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
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
  await expect(stack.locator("h3")).toHaveText([
    "Part of my workflow",
    "Built in projects",
    "Used at work",
  ]);
  await expect(stack.locator("[data-stack-evidence] li")).toHaveText([
    "AI-assisted engineering",
    "Backend systems and APIs",
    "Web product development",
    "Cloud delivery and reporting",
    "Database engineering",
  ]);
  for (const [label] of stackGroups) {
    await expect(stack.getByText(label, { exact: true })).toBeVisible();
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
  await expect(deepLinkButton).toContainText("Close full experience");
  await expect(page.locator("#experience-full")).toBeVisible();

  const workstreamId = "ostrum-database-engineer-workstream-release-delivery";
  await page.goto(`/#${workstreamId}`);
  await expect(page.locator("#experience-full-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#${workstreamId}`)).toBeInViewport();
});

test("the workstream index opens the disclosure and follows the selected section", async ({ page }) => {
  await openHome(page, true);

  const experience = page.locator("#experience");
  const navigation = experience.getByRole("navigation", { name: "Workstreams at Ostrum Tech Limited" });
  const link = navigation.getByRole("link", { name: "Tooling and analytics" });
  await link.click();

  const target = page.locator("#ostrum-database-engineer-workstream-tooling-analytics");
  await expect(page.locator("#experience-full-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(/#ostrum-database-engineer-workstream-tooling-analytics$/);
  await expect(target).toBeInViewport();
  await expect(link).toHaveAttribute("aria-current", "location");
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
  await expect(contact.getByRole("heading", { name: "Let's talk." })).toBeVisible();
  await expect(contact.getByText("Full-time roles, contract work or a scoped project: all welcome.", { exact: true })).toBeVisible();
  await expect(contact.getByRole("link", { name: "abhinavp0304@gmail.com" })).toBeVisible();
  await expect(contact.getByRole("link", { name: "Download résumé" })).toBeVisible();
  const linkedin = contact.getByRole("link", { name: "Connect on LinkedIn" });
  await expect(linkedin).toBeVisible();
  await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/k2ocabhinav22");
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
  await expect(contact.getByRole("link", { name: "GitHub" })).toHaveCount(0);
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
  await expect(page.locator('[data-hero-layer="maker"]')).toHaveAttribute(
    "aria-hidden",
    "true"
  );
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
  const statement = whatIDo.locator("[data-scrub]");
  await expect(statement.locator("p")).toHaveCount(4);
  await expect(statement.locator("p").nth(2).locator("span").first()).toHaveCSS("font-style", "italic");
  await expect(statement.getByText("I design backends first: the services, the APIs and the data behind them, then carry the product through to the interface.", { exact: true })).toBeVisible();
  await expect(whatIDo.getByText("At Ostrum, I work on MySQL-backed API behaviour and versioned database releases.", { exact: true })).toBeVisible();
  await expect(whatIDo.getByText("On my own, I take products from the backend to the interface, with AI coding agents doing scoped work under my review.", { exact: true })).toBeVisible();
  await expect(whatIDo.getByText("Open to full-time roles, contract work and scoped projects.", { exact: true })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "Backend and APIs" })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "Full-stack products" })).toBeVisible();
  await expect(whatIDo.getByRole("heading", { name: "AI-assisted delivery" })).toBeVisible();
  await expect(whatIDo).toContainText("Java and Spring Boot services, REST APIs, authentication, realtime messaging and the relational models underneath.");
  await expect(whatIDo).toContainText("Claude Code");
  const evidenceTable = whatIDo.getByRole("table", { name: "Engineering areas and evidence" });
  await expect(evidenceTable.getByRole("columnheader")).toHaveText([
    "Area",
    "Where it shows",
    "Evidence",
  ]);
  await expect(evidenceTable.locator("tbody > tr")).toHaveCount(3);
  await expect(whatIDo.locator("[data-service-number], [data-service-glyph]")).toHaveCount(0);
  expect((await page.locator("body").innerText()).match(/forward deployed/gi)).toHaveLength(1);

  const method = page.locator("#work aside[aria-labelledby='work-method-title']");
  await method.scrollIntoViewIfNeeded();
  await expect(method.getByRole("heading", { name: "How I work" })).toBeVisible();
  await expect(method.locator("ol > li h4")).toHaveText([
    "1 Scope",
    "2 Assign",
    "3 Review",
    "4 Verify",
  ]);
  await expect(method.locator("ol > li p")).toHaveText([
    "Define the change and what done means.",
    "Pick the coding tool and model that suits the task; run independent pieces in parallel, each in isolation.",
    "Read every change against the task and the existing code.",
    "Run the checks and walk the real flow in a browser.",
  ]);
});

test("About keeps the statement full width above the small monogram on narrow phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed 320px layout probe");
  await page.setViewportSize({ width: 320, height: 844 });
  await openHome(page, true);
  await page.locator("#about").scrollIntoViewIfNeeded();

  const geometry = await page.locator("#about").evaluate((section) => {
    const statement = section.querySelector<HTMLElement>("[data-scrub]");
    const aside = section.querySelector<HTMLElement>("[aria-label='Personal layer']");
    const monogram = aside?.querySelector("img");
    if (!statement || !aside || !monogram) throw new Error("About composition is incomplete");

    return {
      sectionWidth: section.getBoundingClientRect().width,
      statementWidth: statement.getBoundingClientRect().width,
      statementBottom: statement.getBoundingClientRect().bottom,
      asideTop: aside.getBoundingClientRect().top,
      monogramWidth: monogram.getBoundingClientRect().width,
      documentWidth: document.documentElement.scrollWidth,
    };
  });

  expect(geometry.statementWidth).toBeGreaterThan(geometry.sectionWidth * 0.8);
  expect(geometry.asideTop).toBeGreaterThanOrEqual(geometry.statementBottom);
  expect(geometry.monogramWidth).toBeLessThanOrEqual(73);
  expect(geometry.documentWidth).toBeLessThanOrEqual(320);
});

test("About keeps every ScrubText word at or above the readable ink floor", async ({ page }) => {
  await openHome(page);
  await page.locator("#about [data-scrub]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);

  const minimumOpacity = await page.locator("#about [data-scrub]").evaluate((statement) => {
    const words = [...statement.querySelectorAll<HTMLElement>("[style*='--i']")];
    return Math.min(...words.map((word) => Number.parseFloat(getComputedStyle(word).opacity)));
  });

  expect(minimumOpacity).toBeGreaterThanOrEqual(0.65);
});

test("Experience gives the 768px summary column room beside its index", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed tablet-width layout probe");
  await page.setViewportSize({ width: 768, height: 1024 });
  await openHome(page, true);
  await page.locator("#experience").scrollIntoViewIfNeeded();

  const widths = await page.locator("#experience article").evaluate((article) => {
    const sidebar = article.querySelector<HTMLElement>("aside");
    const content = article.querySelector<HTMLElement>("[data-experience-content]");
    if (!sidebar || !content) throw new Error("Experience columns are missing");
    return {
      sidebar: sidebar.getBoundingClientRect().width,
      content: content.getBoundingClientRect().width,
    };
  });

  expect(widths.content).toBeGreaterThan(widths.sidebar * 1.8);
});

test("server-rendered hero facts stay visible before hydration", async ({ page }) => {
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const facts = page.locator('[data-hero-facts="true"] a');
  await expect(page.locator('[data-hero-identity="true"]')).toHaveText("Full-stack engineer");
  await expect(facts).toHaveCount(2);
  await expect(facts.nth(0)).toContainText("Database Engineer, Ostrum Tech Limited");
  await expect(facts.nth(1)).toContainText("Forward deployed builds: Velo, this site, AI‑agent workflows");

  const work = page.locator("#work");
  const projects = work.locator("[data-work-project]");
  await expect(projects).toHaveCount(2);
  await expect(projects.nth(0).getByRole("heading", { name: "Velo" })).toBeVisible();
  await expect(projects.nth(1).getByRole("heading", { name: "Portfolio publishing system" })).toBeVisible();
  await expect(projects.nth(1).getByText(
    "A typed content pipeline publishes the homepage and reusable case-study routes.",
    { exact: true }
  )).toBeVisible();
  await expect(projects.nth(1).getByRole("link", { name: "Read the case study" })).toBeVisible();
  await expect(projects.nth(0).getByRole("link", { name: "Read the case study" })).toHaveAttribute(
    "href",
    "/work/velo"
  );
  const method = work.locator("aside[aria-labelledby='work-method-title']");
  await expect(method.locator("ol > li h4")).toHaveText([
    "1 Scope",
    "2 Assign",
    "3 Review",
    "4 Verify",
  ]);

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

test("keeps the sticky Experience index clear of its reading column", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop layout check");
  await openHome(page, true);
  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();

  const title = experience.getByRole("heading", { level: 2 });
  const sidebar = experience.locator('aside[aria-label="At work"]');
  const index = experience.getByRole("navigation", { name: "Workstreams at Ostrum Tech Limited" });
  const content = experience.locator("[data-experience-content]");
  await expect(title).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(index).toBeVisible();
  await expect(content).toBeVisible();

  const [sidebarBox, contentBox] = await Promise.all([
    sidebar.boundingBox(),
    content.boundingBox(),
  ]);
  expect(sidebarBox).not.toBeNull();
  expect(contentBox).not.toBeNull();
  expect(sidebarBox!.x + sidebarBox!.width).toBeLessThanOrEqual(contentBox!.x);
  await expect(sidebar).toHaveCSS("position", "sticky");
});

test("reduced motion renders Experience content and workstream index statically", async ({ page }) => {
  await openHome(page, true);
  const experience = page.locator("#experience");
  await experience.scrollIntoViewIfNeeded();

  const index = experience.getByRole("navigation", { name: "Workstreams at Ostrum Tech Limited" });
  const indexLinks = index.getByRole("link");
  await expect(indexLinks).toHaveCount(4);
  for (const link of await indexLinks.all()) {
    await expect(link).toBeVisible();
    await expect(link).toHaveCSS("opacity", "1");
    await expect(link).toHaveCSS("transform", "none");
  }

  const summaryPoints = experience.locator(
    '[data-experience-content] [aria-label="Role summary"] > li'
  );
  await expect(summaryPoints).toHaveCount(6);
  for (const point of await summaryPoints.all()) {
    await expect(point).toBeVisible();
    await expect(point.locator("strong")).toHaveCSS("opacity", "1");
  }

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
      { timeout: 1500 }
    ).toBe(1);
    await expect.poll(
      () => workstream.evaluate((element) => getComputedStyle(element).transform),
      { timeout: 1500 }
    ).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  }
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
  // The trigger tucks away on a downward scroll; keyboard focus (or an
  // upward scroll) brings it back without moving the page.
  await toggle.focus();
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
  // Re-fire a small downward step so the assertion survives a listener that
  // attaches after hydration lands.
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollBy({ top: 24, behavior: "auto" }));
      return trigger.getAttribute("data-hamburger-hidden");
    })
    .toBe("true");
  await expect.poll(() => trigger.evaluate((element) => getComputedStyle(element).opacity)).toBe("0");

  // It stays in the tab order; focus restores it immediately.
  await toggle.focus();
  await expect(trigger).toHaveAttribute("data-hamburger-hidden", "false");
  await expect(trigger).toHaveCSS("opacity", "1");

  await page.evaluate(() => window.scrollBy({ top: -600, behavior: "auto" }));
  await expect(trigger).toHaveAttribute("data-hamburger-hidden", "false");
  await expect(trigger).toHaveCSS("opacity", "1");

  // Opening the menu pins it visible.
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

test("Stack prints one static chip strip and the published evidence groups", async ({
  page,
}) => {
  await openHome(page, true);
  const stack = page.locator("#stack");
  await stack.scrollIntoViewIfNeeded();

  await expect(stack.locator("[data-stack-row]")).toHaveCount(0);

  const strip = stack.getByRole("list", { name: "Tools I use" });
  await expect(strip).toBeVisible();
  await expect(strip.getByRole("listitem")).toHaveText([
    "Java",
    "Spring",
    "PostgreSQL",
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "AWS",
    "Docker",
    "Agents",
  ]);
  expect(await strip.evaluate((element) => getComputedStyle(element).transform)).toBe(
    "none"
  );

  await expect(stack.locator("[data-stack-evidence] h3")).toHaveText([
    "Part of my workflow",
    "Built in projects",
    "Used at work",
  ]);
  await expect(stack.locator("[data-stack-evidence] li")).toHaveText([
    "AI-assisted engineering",
    "Backend systems and APIs",
    "Web product development",
    "Cloud delivery and reporting",
    "Database engineering",
  ]);
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

  const card = page.locator("#work [data-work-project] [data-work-frame]").first();
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
  const workImage = page.locator("#work img").last();
  await workImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() => workImage.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
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

  for (const width of [320, 375, 768, 1024]) {
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

test("the contact heading and actions fit the narrowest phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");

  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await openHome(page, true);
    const contact = page.locator("#contact");
    const heading = contact.getByRole("heading", { name: "Let's talk." });
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

    const linkedin = contact.getByRole("link", { name: "Connect on LinkedIn" });
    const actionState = await linkedin.evaluate((element) => ({
      overflow: element.scrollWidth - element.clientWidth,
      height: element.getBoundingClientRect().height,
      whiteSpace: getComputedStyle(element).whiteSpace,
    }));
    expect(actionState.whiteSpace).toBe("nowrap");
    expect(actionState.overflow, `LinkedIn overflow at ${width}px`).toBeLessThanOrEqual(1);
    expect(actionState.height, `LinkedIn height at ${width}px`).toBeLessThan(70);
  }
});

test("the About statement keeps its reading measure on tablets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width probes");

  for (const width of [768, 900, 1023]) {
    await page.setViewportSize({ width, height: 1000 });
    await openHome(page, true);
    const statement = page.locator("#about [data-scrub]");
    await statement.scrollIntoViewIfNeeded();
    const state = await statement.evaluate((element) => {
      const style = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.textContent = "0".repeat(24);
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
        twentyFourCharacters: twentyCharacters,
      };
    });

    expect(state.twentyFourCharacters).toBeGreaterThan(0);
    expect(state.width, `statement measure at ${width}px`).toBeGreaterThanOrEqual(
      state.twentyFourCharacters - 0.5
    );
  }
});

test("About and Experience stay within the viewport at package widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fixed-width sweep");

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 920 });
    await openHome(page, true);
    await expectSectionsWithinViewport(page, ["#about", "#experience"]);
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

test("project details stay clear of the screenshot", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer contract");
  await openHome(page);
  const card = page.locator("#work [data-work-project]").nth(1);
  await card.scrollIntoViewIfNeeded();
  const photo = card.locator("img").first();
  await expect
    .poll(() =>
      photo.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await settleFrame(page);

  const copy = card.locator("[data-work-copy]");
  const frameBox = await card.locator("[data-work-frame]").boundingBox();
  const detailsBox = await copy.boundingBox();
  expect(frameBox).not.toBeNull();
  expect(detailsBox).not.toBeNull();
  const imageAndCopyOverlap =
    frameBox!.x < detailsBox!.x + detailsBox!.width &&
    frameBox!.x + frameBox!.width > detailsBox!.x &&
    frameBox!.y < detailsBox!.y + detailsBox!.height &&
    frameBox!.y + frameBox!.height > detailsBox!.y;
  expect(imageAndCopyOverlap).toBe(false);
  await expect
    .poll(() => photo.evaluate((element) => getComputedStyle(element).filter))
    .toBe("none");
  const before = await copy.screenshot({ animations: "disabled" });

  const photoBox = await photo.boundingBox();
  expect(photoBox).not.toBeNull();
  await page.mouse.move(
    photoBox!.x + photoBox!.width / 2,
    photoBox!.y + photoBox!.height / 2
  );
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
