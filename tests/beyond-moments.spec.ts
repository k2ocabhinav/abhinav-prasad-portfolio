import AxeBuilder from "@axe-core/playwright";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const previewPath = "/beyond-moments-dev";
const previewDirectory = join(process.cwd(), "src/app/beyond-moments-dev");
const productionRun = process.env.PLAYWRIGHT_PROD === "1";

const previewSources = {
  "page.tsx": `import { getBeyondAlbumItems } from "@/lib/portfolioContent";
import DevRoom from "./DevRoom";

export default function BeyondMomentsDevPage() {
  const previewRenditions = [
    { width: 480, src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA2MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjM0ZBOUY1Ii8+PC9zdmc+" },
    { width: 960, src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA2MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY3QTNEIi8+PC9zdmc+" },
    { width: 1600, src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA2MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjN0VFMEI1Ii8+PC9zdmc+" },
  ];
  const items = getBeyondAlbumItems().map((item) => item.id === "seminar-room"
    ? { ...item, renditions: previewRenditions, image: { src: previewRenditions[0].src, alt: item.image?.alt ?? item.title } }
    : item
  );
  return (
    <main style={{ minHeight: "100vh", padding: "28px clamp(16px, 5vw, 72px) 48px", background: "#B9A3FF", color: "#16131A", fontFamily: "sans-serif" }}>
      <header style={{ width: "min(100%, 1120px)", margin: "0 auto" }}>
        <p style={{ margin: "0 0 5px", fontSize: 12 }}>Beyond the terminal · component preview</p>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(24px, 4vw, 40px)" }}>Room moments preview</h1>
        <DevRoom items={items} />
      </header>
    </main>
  );
}
`,
  "DevRoom.tsx": `"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { BeyondAlbumItem } from "@/types";
import { CameraRigContext, RoomAnchorsContext, type RoomAnchor } from "@/components/beyond/room/contracts";
import { roomStore } from "@/components/beyond/room/roomStore";
import MomentsLayer from "@/components/beyond/room/moments/MomentsLayer";
import MomentOverlays from "@/components/beyond/room/moments/MomentOverlays";

const positions = [
  [-3.15, 1.25, 0], [-1.05, 1.25, 0], [1.05, 1.25, 0], [3.15, 1.25, 0],
  [-3.15, -1.25, 0], [-1.05, -1.25, 0], [1.05, -1.25, 0], [3.15, -1.25, 0],
] as const;

export default function DevRoom({ items }: { items: BeyondAlbumItem[] }) {
  const anchors = useMemo<RoomAnchor[]>(() => positions.map((position, index) => ({
    id: "preview-" + index,
    kind: index === 7 ? "laptop-lid" : "corkboard",
    position: [...position] as [number, number, number],
    rotation: [0, 0, 0],
    maxSize: [1.5, 1.35],
  })), []);
  const cameraRig = useMemo(() => ({ focus: () => {}, reset: () => {} }), []);

  return (
    <>
      <div style={{ height: "min(62vh, 580px)", minHeight: 420, overflow: "hidden", border: "2px solid #16131A", borderRadius: 18, background: "#E7DCFF" }}>
        <Canvas camera={{ position: [0, 0, 8.5], fov: 44 }} dpr={[1, 1.5]}>
          <ambientLight intensity={2.2} />
          <RoomAnchorsContext.Provider value={anchors}>
            <CameraRigContext.Provider value={cameraRig}>
              <MomentsLayer items={items} />
            </CameraRigContext.Provider>
          </RoomAnchorsContext.Provider>
        </Canvas>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
        <button type="button" style={{ minHeight: 44, padding: "0 16px", border: "2px solid #16131A", borderRadius: 999, background: "#FFE05A", color: "#16131A", font: "inherit", fontWeight: 700, cursor: "pointer" }} onClick={() => roomStore.set({ focus: { type: "laptop" } })}>
          Open laptop terminal toy
        </button>
      </div>
      <MomentOverlays items={items} />
    </>
  );
}
`,
};

test.beforeAll(async () => {
  if (productionRun) return;
  await mkdir(previewDirectory, { recursive: true });
  await Promise.all(
    Object.entries(previewSources).map(([filename, source]) =>
      writeFile(join(previewDirectory, filename), source)
    )
  );
});

test.afterAll(async () => {
  if (!productionRun) await rm(previewDirectory, { recursive: true, force: true });
});

async function saveEvidence(page: Page, name: string): Promise<void> {
  const directory = process.env.BEYOND_MOMENTS_SHOT_DIR;
  if (!directory) return;
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: join(directory, name),
    animations: "disabled",
    fullPage: true,
  });
}

test("the anchored moments render and respond to hover", async ({ page }) => {
  test.skip(productionRun, "The component preview is created only for the dev test run.");
  const subsetFont = page.waitForResponse(
    (response) =>
      response.url().endsWith("/beyond-terminal/fonts/space-mono-subset.woff") &&
      response.ok()
  );
  await page.goto(previewPath);
  await subsetFont;
  await page.waitForTimeout(120);
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("heading", { name: "Room moments preview" })).toBeVisible();
  await saveEvidence(page, "objects.png");

  const canvasBounds = await canvas.boundingBox();
  expect(canvasBounds).not.toBeNull();
  if (!canvasBounds) return;
  await page.mouse.move(
    canvasBounds.x + canvasBounds.width * 0.26,
    canvasBounds.y + canvasBounds.height * 0.32
  );
  await expect.poll(() => page.evaluate(() => document.body.style.cursor)).toBe("pointer");
  await page.waitForTimeout(180);
  await saveEvidence(page, "hover.png");

  await page.getByRole("button", { name: "Everything in the room" }).click();

  const itemTitles = [
    "48-hour build sprint",
    "Room full of signals",
    "Borrowed fire",
    "People I learn from",
    "Demo table energy",
    "Meetup afterglow",
    "The big room moment",
    "Tiny trick, saved",
  ];
  for (const title of itemTitles) {
    await expect(page.getByRole("button", { name: `Open ${title}` })).toBeVisible();
  }

});

test("the moments list opens postcards with keyboard containment and focus restoration", async ({ page }) => {
  test.skip(productionRun, "The component preview is created only for the dev test run.");
  await page.goto(previewPath);
  await page.getByRole("button", { name: "Everything in the room" }).click();
  const trigger = page.getByRole("button", { name: "Open Room full of signals" });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Postcard for Room full of signals" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close postcard" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Turn over postcard" })).toBeVisible();

  const frontAccessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(frontAccessibility.violations).toEqual([]);
  await saveEvidence(page, "postcard-front.png");

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Turn over postcard" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close postcard" })).toBeFocused();

  const photoTrigger = page.getByRole("button", { name: "Open full-size photo for Room full of signals" });
  await photoTrigger.click();
  const photoDialog = page.getByRole("dialog", { name: "Full-size photo for Room full of signals" });
  await expect(photoDialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close full-size photo" })).toBeFocused();
  const photoAccessibility = await new AxeBuilder({ page })
    .include('[role="dialog"][aria-label="Full-size photo for Room full of signals"]')
    .analyze();
  expect(photoAccessibility.violations).toEqual([]);
  await saveEvidence(page, "postcard-photo.png");
  await page.keyboard.press("Escape");
  await expect(photoDialog).toHaveCount(0);
  await expect(photoTrigger).toBeFocused();

  await page.getByRole("button", { name: "Turn over postcard" }).click();
  await expect(page.getByText("A note from the room")).toBeVisible();
  const backAccessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(backAccessibility.violations).toEqual([]);
  await saveEvidence(page, "postcard-back.png");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.getByTestId("postcard-backdrop").click({ position: { x: 12, y: 12 } });
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the laptop terminal runs local commands and can open a moment", async ({ page }) => {
  test.skip(productionRun, "The component preview is created only for the dev test run.");
  await page.goto(previewPath);
  const openTerminal = page.getByRole("button", { name: "Open laptop terminal toy" });
  await openTerminal.click();

  const dialog = page.getByRole("dialog", { name: "Laptop terminal" });
  const input = page.getByLabel("$");
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await page.getByRole("button", { name: "Close terminal" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Run" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close terminal" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  const terminalAccessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze();
  expect(terminalAccessibility.violations).toEqual([]);

  await input.fill("help");
  await input.press("Enter");
  await expect(dialog.getByText(/help, whoami, ls/)).toBeVisible();
  await input.fill("ls");
  await input.press("Enter");
  await expect(dialog.getByText(/hackathon-sprint/)).toBeVisible();
  await saveEvidence(page, "terminal-session.png");

  for (const command of ["whoami", "coffee", "chai", "sudo", "dance", "42"]) {
    await input.fill(command);
    await input.press("Enter");
    await expect(input).toBeFocused();
  }

  await input.fill("lights");
  await input.press("Enter");
  await expect(dialog.getByText("night", { exact: true })).toBeVisible();

  await input.fill("open seminar-room");
  await input.press("Enter");
  await expect(page.getByRole("dialog", { name: "Postcard for Room full of signals" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await openTerminal.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Laptop terminal" })).toHaveCount(0);
  await expect(openTerminal).toBeFocused();

  await openTerminal.click();
  await page.getByLabel("$").fill("exit");
  await page.getByLabel("$").press("Enter");
  await expect(page.getByRole("dialog", { name: "Laptop terminal" })).toHaveCount(0);
});
