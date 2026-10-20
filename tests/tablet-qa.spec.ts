import { expect, test } from "@playwright/test";

test.describe("tablet QA regressions", () => {
  test("a short section is highlighted once it reaches the top of the viewport", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.locator("#stack").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expect(
      page.locator('nav[aria-label="Section navigation"] [aria-current="location"]')
    ).toHaveAttribute("href", /#stack$/);
  });

  test("the last section is highlighted at the bottom of the page", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(
      page.locator('nav[aria-label="Section navigation"] [aria-current="location"]')
    ).toHaveAttribute("href", /#contact$/);
  });

  test("the home footer paints above the fixed paper backdrop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Geometry checks in one engine");
    await page.goto("/");
    const footer = page.locator("footer").last();
    await footer.scrollIntoViewIfNeeded();
    const layer = await footer.evaluate((element) => {
      const style = getComputedStyle(element);
      return { position: style.position, zIndex: Number(style.zIndex) };
    });
    expect(layer.position).not.toBe("static");
    expect(layer.zIndex).toBeGreaterThanOrEqual(1);
  });
});
