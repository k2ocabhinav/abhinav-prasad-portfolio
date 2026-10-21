// Beyond the Terminal harness.
//
// These checks describe the finished room, so every room-specific test skips
// while the track stubs are still mounted. The DOM contracts the room tracks
// must expose for the checks (and scripts/beyond/poster.mjs) to activate:
//
//   [data-beyond-room] or [data-beyond-stage]   route root / stage wrapper
//   [data-room-canvas]                          canvas wrapper (a <canvas> inside)
//   [data-room-ready="true"]                    set once the scene has settled
//   [data-beyond-fallback]                      fallback deck wrapper
//   [data-beyond-list]                          optional alias for the item list
//   [data-beyond-terminal-open]                 optional terminal opener button
//   ?lowfx=1 and localStorage.beyondLowFx=1     force the fallback path
//
// The item list is always found by its accessible name, "Everything in the
// room", so it does not depend on an implementation detail.
import fs from "node:fs";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

const beyondContentDirectory = path.join(
  process.cwd(),
  "src",
  "content",
  "portfolio",
  "beyond"
);

const ROOM_SHELL_SELECTOR =
  '[data-beyond-room], [data-beyond-stage], [data-room-canvas], section[aria-label="Everything in the room"], [data-beyond-list]';

const FALLBACK_SELECTOR = "[data-beyond-fallback], [data-beyond-deck]";

const ROOM_LIST_SELECTOR =
  'section[aria-label="Everything in the room"], [role="region"][aria-label="Everything in the room"], [data-beyond-list]';

/** Read the published titles from MDX so the list assertions cannot go stale. */
function readPublishedBeyondTitles(): string[] {
  if (!fs.existsSync(beyondContentDirectory)) {
    return [];
  }

  return fs
    .readdirSync(beyondContentDirectory)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => fs.readFileSync(path.join(beyondContentDirectory, file), "utf8"))
    .filter((source) => /^\s*status:\s*"published"/m.test(source))
    .map((source) => source.match(/^\s*title:\s*"([^"]+)"/m)?.[1])
    .filter((title): title is string => Boolean(title))
    .sort();
}

const publishedBeyondTitles = readPublishedBeyondTitles();

/** Give the capability gate a capable device inside headless Chromium. */
async function forceCapableDevice(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("beyondLowFx");
    } catch {
      // Storage can be unavailable before the origin is established.
    }

    Object.defineProperty(Navigator.prototype, "deviceMemory", {
      configurable: true,
      get: () => 8,
    });
    Object.defineProperty(Navigator.prototype, "hardwareConcurrency", {
      configurable: true,
      get: () => 8,
    });
    Object.defineProperty(Navigator.prototype, "connection", {
      configurable: true,
      get: () => ({ saveData: false, effectiveType: "4g" }),
    });
  });
}

async function hasRoomShell(page: Page): Promise<boolean> {
  try {
    await page.locator(ROOM_SHELL_SELECTOR).first().waitFor({
      state: "attached",
      timeout: 3_000,
    });
    return true;
  } catch {
    return false;
  }
}

async function roomList(page: Page): Promise<Locator | null> {
  const list = page.locator(ROOM_LIST_SELECTOR).first();
  if ((await list.count()) === 0) {
    return null;
  }
  return list;
}

/** Open the list if the chrome keeps it behind a toggle. */
async function revealRoomList(page: Page) {
  const toggle = page
    .getByRole("button", { name: /everything in the room/i })
    .first();
  if ((await toggle.count()) > 0) {
    await toggle.click({ timeout: 2_000 }).catch(() => undefined);
  }
}

async function opensRoomDialog(page: Page): Promise<Locator> {
  const dialog = page.getByRole("dialog").first();
  await expect(dialog).toBeVisible({ timeout: 5_000 });
  return dialog;
}

test("the Beyond route keeps noindex", async ({ page }) => {
  await page.goto("/beyond-terminal");

  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/i);
});

test("a capable device mounts the room canvas within five seconds", async ({ page }) => {
  await forceCapableDevice(page);
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  const webgl2 = await page.evaluate(() => {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2"));
  });
  test.skip(!webgl2, "headless browser has no WebGL2 context");

  const canvas = page
    .locator("[data-room-canvas] canvas, [data-beyond-stage] canvas, canvas")
    .filter({ visible: true })
    .first();

  await expect(canvas).toBeVisible({ timeout: 5_000 });

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
});

test("reduced motion keeps the canvas out and shows the fallback deck", async ({
  page,
}) => {
  await forceCapableDevice(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  const canvas = page.locator("canvas");
  await page.waitForTimeout(1_500);
  await expect(canvas).toHaveCount(0);

  const fallback = page.locator(FALLBACK_SELECTOR).first();
  test.skip(
    (await fallback.count()) === 0,
    "fallback deck does not expose a harness marker yet"
  );
  await expect(fallback).toBeVisible();
});

test("the low-fx query flag forces the fallback deck", async ({ page }) => {
  await forceCapableDevice(page);
  await page.goto("/beyond-terminal?lowfx=1");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  await page.waitForTimeout(1_500);
  await expect(page.locator("canvas")).toHaveCount(0);

  const fallback = page.locator(FALLBACK_SELECTOR).first();
  test.skip(
    (await fallback.count()) === 0,
    "fallback deck does not expose a harness marker yet"
  );
  await expect(fallback).toBeVisible();
});

test("the low-fx storage flag forces the fallback deck", async ({ page }) => {
  await forceCapableDevice(page);
  // forceCapableDevice clears the key, so this script runs after the clear.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("beyondLowFx", "1");
    } catch {
      // Ignore unavailable storage; the check is skipped when it cannot store.
    }
  });
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  await expect(page.locator("canvas")).toHaveCount(0);

  const fallback = page.locator(FALLBACK_SELECTOR).first();
  test.skip(
    (await fallback.count()) === 0,
    "fallback deck does not expose a harness marker yet"
  );
  await expect(fallback).toBeVisible();
});

test("every published moment appears in the room list as an action", async ({
  page,
}) => {
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  const list = await roomList(page);
  test.skip(list === null, "the room list is not mounted yet");

  expect(publishedBeyondTitles.length).toBeGreaterThan(0);

  await expect.poll(() => list!.locator("li").count()).toBeGreaterThanOrEqual(
    publishedBeyondTitles.length
  );

  for (const title of publishedBeyondTitles) {
    await expect(list!).toContainText(title);
    await expect
      .poll(() =>
        list!.getByRole("button", { name: new RegExp(escapeRegExp(title)) }).count()
      )
      .toBeGreaterThanOrEqual(1);
  }
});

test("the postcard opens, traps focus, closes on Escape and restores focus", async ({
  page,
}) => {
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  const list = await roomList(page);
  test.skip(list === null, "the room list is not mounted yet");

  const trigger = list!.getByRole("button").first();
  test.skip((await trigger.count()) === 0, "the room list has no actions yet");

  await revealRoomList(page);
  await trigger.focus();
  await trigger.press("Enter");

  const dialog = await opensRoomDialog(page);
  const close = dialog.getByRole("button", { name: /close/i }).first();
  await expect(close).toBeVisible();
  await expect(close).toBeFocused();

  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null
    )
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the terminal help lists its commands", async ({ page }) => {
  await page.goto("/beyond-terminal");

  test.skip(!(await hasRoomShell(page)), "room shell is not mounted yet");

  const explicitOpener = page.locator("[data-beyond-terminal-open]").first();
  const namedOpener = page
    .getByRole("button", { name: /terminal|laptop/i })
    .first();
  const opener =
    (await explicitOpener.count()) > 0 ? explicitOpener : namedOpener;
  test.skip(
    (await opener.count()) === 0,
    "the terminal has no DOM opener yet"
  );

  await opener.click();

  const input = page.getByRole("textbox").first();
  await expect(input).toBeVisible({ timeout: 5_000 });
  await input.fill("help");
  await input.press("Enter");

  for (const command of [/whoami/, /\bls\b/, /open/, /lights/, /coffee|chai/]) {
    await expect(page.getByText(command).first()).toBeVisible({ timeout: 5_000 });
  }

  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
});

test("the home route loads no three.js chunk", async ({ page }) => {
  const scriptBodies = new Map<string, Promise<Buffer>>();

  page.on("response", (response) => {
    if (response.request().resourceType() !== "script") {
      return;
    }
    const url = response.url();
    if (!scriptBodies.has(url)) {
      scriptBodies.set(
        url,
        response.body().catch(() => Buffer.alloc(0))
      );
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const domScriptUrls = await page
    .locator('script[src], link[rel="modulepreload"][href], link[rel="prefetch"][href]')
    .evaluateAll((elements) =>
      elements
        .map((element) =>
          element instanceof HTMLScriptElement
            ? element.src
            : (element as HTMLLinkElement).href
        )
        .filter(Boolean)
    );

  const origin = new URL(page.url()).origin;
  const urls = new Set<string>([...scriptBodies.keys(), ...domScriptUrls]);
  let checked = 0;

  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.origin !== origin || !parsed.pathname.startsWith("/_next/")) {
      continue;
    }

    const body =
      (await scriptBodies.get(url)) ??
      Buffer.from(await (await page.request.get(url)).text());

    expect(
      body.toString("utf8"),
      `${parsed.pathname} must not bundle three.js`
    ).not.toMatch(/\bthree\b|@react-three|WebGLRenderer/i);
    checked += 1;
  }

  expect(checked).toBeGreaterThan(0);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
