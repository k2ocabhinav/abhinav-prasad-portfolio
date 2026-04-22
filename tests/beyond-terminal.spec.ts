import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const artifactPath = (filename: string) =>
  path.join(process.cwd(), "test-artifacts", filename);

test.beforeAll(() => {
  fs.mkdirSync(path.join(process.cwd(), "test-artifacts"), { recursive: true });
});

test("easter egg entry transitions into the Beyond route", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /open beyond the terminal/i }).click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-variant",
    "portal-bloom"
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-skin",
    "beyond-pastel-mist"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
});

test("desktop nav uses the shared portal transition to reach Beyond", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open Beyond", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-variant",
    "portal-bloom"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
});

test("reduced motion falls back to the accessible fade variant", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(150);

  await page.getByRole("button", { name: /open beyond the terminal/i }).click();

  await expect(page.locator('[data-portal-variant="accessible-fade"]')).toBeVisible();
  await expect(page).toHaveURL(/\/beyond-terminal$/);
});

test("journal archive and article routes render cleanly", async ({ page }) => {
  await page.goto("/beyond-terminal/journal");

  await expect(
    page.getByRole("heading", {
      name: /Local essays framed like the same system, just quieter/i,
    })
  ).toBeVisible();
  await page.getByRole("link", { name: /Training for Quiet Judgment/i }).click();

  await expect(page).toHaveURL(/\/beyond-terminal\/journal\/training-for-quiet-judgment$/);
  await expect(
    page.getByRole("heading", { name: /Training for Quiet Judgment/i })
  ).toBeVisible();
});

test("desktop Beyond shell matches the pastel grid layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/beyond-terminal");

  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-desktop.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-desktop.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("keyboard entry uses the centered trigger mode and restores focus", async ({
  page,
}) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: /open beyond the terminal/i });
  await trigger.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveAttribute(
    "data-last-portal-trigger-mode",
    "keyboard"
  );
  await expect(page).toHaveURL(/\/beyond-terminal$/);
  await expect(page.locator("#beyond-hero-title")).toBeFocused();
});

test("mobile Beyond shell matches the pastel grid layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/beyond-terminal");

  await expect(
    page.getByRole("heading", {
      name: /The route narrows the noise and lets the larger ideas breathe/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(900);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-home-mobile.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-home-mobile.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("journal archive layout matches the supporting strip design", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/beyond-terminal/journal");

  await expect(
    page.getByRole("heading", {
      name: /Local essays framed like the same system, just quieter/i,
    })
  ).toBeVisible();
  await page.waitForTimeout(700);

  const screenshot = await page.screenshot({
    path: artifactPath("beyond-journal-archive.png"),
    fullPage: true,
  });

  expect(screenshot).toMatchSnapshot("beyond-journal-archive.png");
});
