import { expect, test, type Page } from "@playwright/test";

const serviceTiles = (page: Page) => page.locator("#about [data-featured]");

test.describe("service tile transitions", () => {
  test("reveals the staggered tiles from below the fold", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.waitForFunction(
      () => document.documentElement.dataset.hydrated === "1"
    );

    const tiles = serviceTiles(page);
    await expect(tiles).toHaveCount(3);
    const initial = await tiles.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { opacity: Number(style.opacity), transform: style.transform };
      })
    );
    for (const tile of initial) {
      expect(tile.opacity).toBe(0);
      expect(tile.transform).not.toBe("none");
    }

    await page.evaluate(() => {
      const grid = document.querySelector("#about [data-featured]")?.parentElement;
      if (!grid) throw new Error("Service tile grid was not found");
      const top = grid.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight * 0.75, behavior: "instant" });
    });

    const opacitySamples: number[][] = [];
    for (let sample = 0; sample <= 24; sample += 1) {
      opacitySamples.push(
        await tiles.evaluateAll((elements) =>
          elements.map((element) => Number(getComputedStyle(element).opacity))
        )
      );
      if (sample < 24) await page.waitForTimeout(50);
    }

    expect(
      opacitySamples.some((sample) => sample.some((opacity) => opacity > 0 && opacity < 1))
    ).toBe(true);
    for (const opacity of opacitySamples.at(-1) ?? []) {
      expect(opacity).toBeGreaterThan(0.99);
    }
  });

  test("keeps every tile visible with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const tiles = serviceTiles(page);
    await expect(tiles).toHaveCount(3);
    await expect
      .poll(() =>
        tiles.evaluateAll((elements) =>
          elements.map((element) => Number(getComputedStyle(element).opacity))
        )
      )
      .toEqual([1, 1, 1]);
    const transforms = await tiles.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).transform)
    );
    expect(transforms).toEqual(["none", "none", "none"]);
  });
});

test.describe("service tiles without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("stay visible in the server rendered page", async ({ page }) => {
    await page.goto("/");
    const tiles = serviceTiles(page);
    await expect(tiles).toHaveCount(3);

    const styles = await tiles.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { opacity: Number(style.opacity), transform: style.transform };
      })
    );
    expect(styles).toEqual([
      { opacity: 1, transform: "none" },
      { opacity: 1, transform: "none" },
      { opacity: 1, transform: "none" },
    ]);
  });
});
