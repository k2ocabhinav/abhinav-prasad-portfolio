import { expect, test } from "@playwright/test";

const wordmarkViewports = [
  [320, 640],
  [375, 667],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1024, 1366],
  [1199, 800],
  [1200, 800],
  [1280, 800],
  [1366, 1024],
  [1440, 900],
  [1920, 1080],
  [1920, 1440],
] as const;

test.describe("F11 tablet and tall viewport regressions", () => {
  test("hero wordmark ink fits inside the frame from phone to wide desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    for (const [width, height] of wordmarkViewports) {
      await page.setViewportSize({ width, height });
      const metrics = await page.evaluate(() => {
        const frame = document.querySelector<HTMLElement>("[data-home-hero-frame]");
        const heading = document.querySelector<HTMLElement>("[data-home-hero-heading='true']");
        const text = document.querySelector<HTMLElement>("[data-home-hero-text]");
        const mask = document.querySelector<HTMLElement>("[data-home-hero-wordmark] span");
        if (!frame || !heading || !text || !mask) throw new Error("Hero elements are missing");
        const frameRect = frame.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const textRect = text.getBoundingClientRect();
        const cue = document.querySelector<HTMLElement>("[data-hero-scroll-cue='true']");
        if (!cue) throw new Error("Hero cue is missing");
        const overhang = Number.parseFloat(getComputedStyle(heading).fontSize) * 0.22;
        const visibleContentBottom = window.innerWidth < 768
          ? cue.getBoundingClientRect().bottom
          : textRect.bottom;
        return {
          frameTop: frameRect.top,
          frameBottom: frameRect.bottom,
          paintedTop: headingRect.top - overhang,
          paintedBottom: headingRect.bottom + overhang,
          textBottom: visibleContentBottom,
          maskOverflow: getComputedStyle(mask).overflow,
        };
      });
      const label = `${width}x${height}`;
      expect(metrics.maskOverflow, label).toBe("visible");
      expect(metrics.paintedTop, label).toBeGreaterThanOrEqual(metrics.frameTop - 1);
      expect(metrics.paintedBottom, label).toBeLessThanOrEqual(metrics.frameBottom + 1);
      expect(metrics.paintedTop, label).toBeGreaterThan(metrics.textBottom - 1);
    }
  });

  test("coarse-pointer tablet section gutters align without a hidden rail gap", async ({ browser }) => {
    for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
      });
      try {
        const page = await context.newPage();
        await page.goto("/");
        const result = await page.evaluate(() => {
          const selectors = ["about", "experience", "work", "stack", "contact"];
          const edges = selectors.map((id) => {
            const content = document.querySelector<HTMLElement>(`#${id} .content-container`);
            if (!content) throw new Error(`Missing content container for ${id}`);
            return content.getBoundingClientRect().right;
          });
          return {
            coarse: matchMedia("(hover: none) and (pointer: coarse)").matches,
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            edges,
          };
        });
        expect(result.coarse).toBeTruthy();
        expect(result.documentWidth).toBe(result.viewportWidth);
        expect(Math.max(...result.edges) - Math.min(...result.edges)).toBeLessThanOrEqual(1);
      } finally {
        await context.close();
      }
    }
  });

  test("portrait tablet layouts release the pinned work stages", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-js"));

    for (const viewport of [
      { width: 1024, height: 768, pinned: true },
      { width: 1024, height: 1366, pinned: false },
    ]) {
      await page.setViewportSize(viewport);
      const positions = await page.evaluate(() => {
        const veloStage = document.querySelector<HTMLElement>("[data-work-project='velo'] [class*='projectStage']");
        const methodStage = document.querySelector<HTMLElement>("[data-work-method-stage='true']");
        if (!veloStage || !methodStage) throw new Error("Work stages are missing");
        return {
          velo: getComputedStyle(veloStage).position,
          method: getComputedStyle(methodStage).position,
        };
      });
      expect(positions.velo).toBe(viewport.pinned ? "sticky" : "relative");
      expect(positions.method).toBe(viewport.pinned ? "sticky" : "relative");
    }
  });

  test("Experience workstream index advances through all four sections at tablet widths", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.locator("#experience").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: /Read full experience/ }).click();

      const sections = page.locator("#experience-full [data-workstream]");
      await expect(sections).toHaveCount(4);
      for (const section of await sections.all()) {
        const id = await section.getAttribute("id");
        const title = (await section.locator("h4").innerText()).trim();
        if (!id) throw new Error("Workstream is missing its id");
        await section.evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
        await expect(page.getByRole("navigation", { name: /Workstreams/ }).getByRole("link", { name: title }))
          .toHaveAttribute("aria-current", "location");
      }
    }
  });

  test("work method labels align to the four route stations in the pinned stage", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    for (const viewport of [
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const method = page.locator("[data-work-method='true']");
      await method.evaluate((element) => element.scrollIntoView({ block: "start", behavior: "instant" }));
      const metrics = await method.evaluate((element) => {
        const stage = element.querySelector<HTMLElement>("[data-work-method-stage='true']");
        const route = element.querySelector<SVGSVGElement>("svg[viewBox='0 0 1000 200']");
        const labels = Array.from(element.querySelectorAll<HTMLElement>("ol > li h4"));
        if (!stage || !route) throw new Error("Pinned method elements are missing");
        const stageRect = stage.getBoundingClientRect();
        const anchors = Array.from(route.querySelectorAll<SVGCircleElement>("circle"));
        const labelPositions = labels.map((label) => label.getBoundingClientRect().left);
        const stationPositions = anchors.map((anchor) => {
          const rect = anchor.getBoundingClientRect();
          return rect.left + rect.width / 2;
        });
        const lastParagraph = element.querySelector<HTMLElement>("ol > li:last-child p");
        const header = element.querySelector<HTMLElement>("header");
        if (!lastParagraph || !header) throw new Error("Method copy is missing");
        return {
          labelPositions,
          stationPositions,
          contentCenter: (header.getBoundingClientRect().top + lastParagraph.getBoundingClientRect().bottom) / 2,
          stageCenter: stageRect.top + stageRect.height / 2,
          routeWidth: route.getBoundingClientRect().width,
        };
      });
      expect(metrics.routeWidth).toBeGreaterThan(0);
      expect(metrics.labelPositions).toHaveLength(4);
      expect(metrics.stationPositions).toHaveLength(4);
      metrics.labelPositions.forEach((x, index) => expect(Math.abs(x - metrics.stationPositions[index])).toBeLessThanOrEqual(3));
      expect(Math.abs(metrics.contentCenter - metrics.stageCenter)).toBeLessThanOrEqual(70);
    }
  });

  test("work method route draws once and stays complete with reduced motion", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Motion check in one engine");
    await page.goto("/");
    const route = page.locator("[data-work-method='true'] [data-route-reveal='true']");
    await expect(route).toHaveCSS("clip-path", "inset(0px 100% 0px 0px)");
    await expect(page.locator("[data-work-method='true'] ol > li h4")).toHaveCount(4);

    await page.locator("[data-work-method='true']").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await expect(route).not.toHaveCSS("clip-path", "inset(0px 100% 0px 0px)");
    await expect(route).toHaveCSS("clip-path", "inset(0px)", { timeout: 2_000 });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator("[data-work-method='true'] [data-route-reveal='true']")).toHaveCSS("clip-path", "none");
  });

  test("the marquee switches rail ink as it crosses the full rail height", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer rail geometry");
    for (const viewport of [
      { width: 1440, height: 900, bandTops: [580, 440, 280] },
      { width: 1024, height: 768, bandTops: [500, 350, 200] },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      const marquee = page.locator("[data-marquee='true']");
      const rail = page.getByRole("navigation", { name: "Section navigation" });
      await expect(rail).toBeVisible();
      for (const bandTop of viewport.bandTops) {
        await page.evaluate((desiredTop) => {
          const element = document.querySelector<HTMLElement>("[data-marquee='true']");
          if (!element) throw new Error("Marquee is missing");
          const documentTop = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: documentTop - desiredTop, behavior: "instant" });
        }, bandTop);
        await expect.poll(() => rail.getAttribute("data-nav-tone")).toBe("dark");
        await expect(marquee).toBeVisible();
      }
    }
  });

  test("tablet gallery frames use two columns and the final frame spans both", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Tablet gallery geometry");
    for (const width of [768, 1024]) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto("/work/portfolio-platform");
      const gallery = page.locator("section[aria-labelledby='gallery-title'] [data-count='3']");
      const frames = gallery.locator("div[class*='legacyFrame']");
      await expect(frames).toHaveCount(3);
      const widths = await frames.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
      const thirdColumn = await gallery.locator("figure").nth(2).evaluate((item) => getComputedStyle(item).gridColumnEnd);
      expect(widths[0]).toBeGreaterThanOrEqual(280);
      expect(widths[1]).toBeGreaterThanOrEqual(280);
      expect(widths[2]).toBeGreaterThan(widths[0]);
      expect(thirdColumn).toBe("-1");
    }
  });

  test("case-study hero media clears the compact rail at 1024px", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Compact rail geometry");
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/work/velo");
    const figure = page.locator("[class*='heroFigure']");
    const rail = page.getByRole("navigation", { name: "Contact navigation" });
    const [figureBox, railBox] = await Promise.all([figure.boundingBox(), rail.boundingBox()]);
    expect(figureBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(figureBox!.x + figureBox!.width).toBeLessThanOrEqual(railBox!.x - 8);
  });
});
