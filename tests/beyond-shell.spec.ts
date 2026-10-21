import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const screenshotDirectory = path.resolve(process.cwd(), "../../out/bt3-shell/shots");

function capture(name: string) {
  fs.mkdirSync(screenshotDirectory, { recursive: true });
  return path.join(screenshotDirectory, name);
}

async function forceWebGl2Probe(page: Page) {
  await page.addInitScript({
    content: `
      Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: 8 });
      Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: 8 });
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, attributes) {
        if (this.dataset.roomCapabilityProbe === "true" && type === "webgl2") {
          return { getExtension: () => ({ loseContext: () => {} }) };
        }
        return originalGetContext.call(this, type, attributes);
      };
    `,
  });
}

test("the reduced-motion fallback keeps the deck, list, and room controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/beyond-terminal");

  await expect(page.locator("[data-room-poster]")).toBeVisible();
  await page.screenshot({ path: capture("beyond-reduced-motion-390x844.png") });
  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-scene-active", "false");
  await expect(page.locator("[data-fallback-deck] button")).toHaveCount(8);

  const sound = page.getByRole("button", { name: "Sound off" });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Night mode" }).click();
  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-mode", "night");

  await page.getByRole("button", { name: "Everything in the room" }).click();
  const list = page.locator("[data-moments-list]");
  await expect(list).toBeFocused();
  await expect(list.getByRole("heading", { name: "Everything in the room" })).toBeVisible();

  await list.getByRole("button", { name: /The big room moment/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("[data-room-focus]")).toHaveAttribute(
    "data-room-focus",
    "moment:big-room-moment"
  );
});

test("the SSR room poster is the desktop first-paint surface", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/beyond-terminal");

  await expect(page.locator("[data-room-poster]")).toBeVisible();
  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-scene-active", "false");
  await page.screenshot({ path: capture("beyond-poster-1440x900.png") });
});

test("capable browsers pass the gate and mount the room canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await forceWebGl2Probe(page);
  await page.goto("/beyond-terminal");

  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-scene-active", "true");
  await expect(page.locator("[data-room-scene] canvas")).toBeVisible();
  await expect(page.locator("[data-room-poster]")).toBeAttached();
  await page.screenshot({ path: capture("beyond-canvas-1440x900.png") });
  await page.getByRole("button", { name: "Everything in the room" }).click();
  const list = page.locator("[data-moments-list]");
  await expect(list).toBeFocused();
  await list.getByRole("button", { name: /The big room moment/ }).click();
  await expect(page.locator("[data-room-focus]")).toHaveAttribute(
    "data-room-focus",
    "moment:big-room-moment"
  );
});

test("the final v arrival drops in after the room canvas is ready", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await forceWebGl2Probe(page);
  await page.goto("/");
  await page.locator('[data-animated-name="hero-trigger"]').click();
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-arrival-origin", "portal");
  await expect(page.locator("[data-room-scene] canvas")).toBeVisible();
  await expect(page.locator("[data-scene-active]")).toHaveAttribute("data-room-arrived", "true");
  const sticker = page.locator("[data-arrival-sticker]");
  await expect(sticker).toBeVisible();

  for (const elapsed of [0, 100, 200, 300]) {
    if (elapsed > 0) await page.waitForTimeout(100);
    await page.screenshot({
      path: capture(`beyond-arrival-${elapsed}ms-1440x900.png`),
    });
  }
});
