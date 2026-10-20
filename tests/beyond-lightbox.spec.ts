import { expect, test } from "@playwright/test";

test("the Beyond lightbox close control sits above the sticky header on phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Geometry check in one engine");

  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 667 });
    await page.goto("/beyond-terminal");
    await page.getByRole("button", { name: /^Open / }).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: /close/i });
    await expect(close).toBeVisible();
    const box = await close.boundingBox();
    expect(box).not.toBeNull();
    const topmostIsClose = await page.evaluate(
      ([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        return Boolean(hit?.closest('[role="dialog"] button'));
      },
      [box!.x + box!.width / 2, box!.y + box!.height / 2]
    );
    expect(topmostIsClose).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
