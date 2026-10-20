import { expect, test } from "@playwright/test";

test("the case-study contact rail only takes clicks on its icons", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop rail geometry");

  for (const width of [1024, 1280, 1440]) {
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
  }
});
