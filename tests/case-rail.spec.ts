import { expect, test } from "@playwright/test";

test("the case-study contact rail only takes clicks on its icons", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop rail geometry");

  for (const width of [768, 1024, 1099, 1280, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/work/velo");

    const links = page.locator('[aria-label="Contact navigation"] a');
    await expect(links).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const box = await links.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(48);
    }

    const hero = await page.locator("main figure img").first().boundingBox();
    expect(hero).not.toBeNull();
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href") ?? null,
      [hero!.x + hero!.width - 6, hero!.y + hero!.height / 2]
    );
    expect(hit).toBeNull();

    if (width < 1100) {
      const main = page.locator("main");
      const reserved = await main.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingRight));
      const gutter = Math.max(148, width * 0.1);
      expect(reserved).toBeGreaterThanOrEqual(gutter - 1);
      const offenders = await main.evaluate((element) => {
        const limit = innerWidth - Math.max(148, innerWidth * 0.1);
        return Array.from(element.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p,li,figure,figcaption,img,a,button"))
          .map((child) => ({ child, right: child.getBoundingClientRect().right }))
          .filter(({ child, right }) => getComputedStyle(child).display !== "none" && right > limit + 1)
          .map(({ child, right }) => ({ tag: child.tagName, right, text: child.textContent?.trim().slice(0, 40) }));
      });
      expect(offenders).toEqual([]);
    }
  }
});

test("work pages keep the quality panel padded and close with the home heading", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Work page layout contract");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/velo");
  const quality = page.locator("[data-quality-panel]");
  const architecture = page.locator("[data-architecture-card]").first();
  const [qualityPadding, architecturePadding] = await Promise.all([
    quality.evaluate((element) => getComputedStyle(element).paddingInlineStart),
    architecture.evaluate((element) => getComputedStyle(element).paddingInlineStart),
  ]);
  expect(qualityPadding).toBe(architecturePadding);
  await expect(page.locator("#detail-contact-title")).toHaveText("Let's build.");

  await page.goto("/work/portfolio-platform");
  await expect(page.locator("#detail-contact-title")).toHaveText("Let's build.");
});
