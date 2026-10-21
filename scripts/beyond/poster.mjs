#!/usr/bin/env node
/**
 * Capture the Beyond the Terminal poster from the live room.
 *
 *   npm run beyond:poster -- --url http://127.0.0.1:3931
 *
 * The room must expose `[data-room-ready="true"]` once the scene has settled
 * (on the canvas wrapper or any ancestor). The script hides the DOM chrome,
 * pins the canvas to the viewport, and captures 1440x900 and 390x844 stills.
 * Encoded files are content-hashed and written to
 * `public/beyond-terminal/poster/`, with the paths printed for wiring into the
 * route's <picture> element.
 *
 * AVIF uses the first available encoder: sips, avifenc, or ffmpeg. WebP uses
 * cwebp, then sips. Pass `--prune` to delete older generated posters.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const { values } = parseArgs({
  options: {
    url: { type: "string", default: "http://127.0.0.1:3931" },
    out: { type: "string" },
    timeout: { type: "string", default: "45000" },
    prune: { type: "boolean", default: false },
  },
});

const baseUrl = new URL(values.url).toString().replace(/\/$/, "");
const outDir = path.resolve(
  values.out ?? path.join(process.cwd(), "public", "beyond-terminal", "poster")
);
const timeout = Number(values.timeout);

function run(command, args) {
  return execFileSync(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
}

function hasCommand(command) {
  try {
    run(process.platform === "win32" ? "where" : "which", [command]);
    return true;
  } catch {
    return false;
  }
}

function encodeWebp(pngPath, webpPath) {
  if (hasCommand("cwebp")) {
    run("cwebp", ["-quiet", "-q", "82", pngPath, "-o", webpPath]);
    return "cwebp";
  }
  if (hasCommand("sips")) {
    run("sips", ["-s", "format", "webp", "-s", "formatOptions", "82", pngPath, "--out", webpPath]);
    return "sips";
  }
  throw new Error("No WebP encoder found (install cwebp or use macOS sips).");
}

function encodeAvif(pngPath, avifPath) {
  if (hasCommand("sips")) {
    run("sips", ["-s", "format", "avif", "-s", "formatOptions", "70", pngPath, "--out", avifPath]);
    return "sips";
  }
  if (hasCommand("avifenc")) {
    run("avifenc", ["-q", "60", pngPath, avifPath]);
    return "avifenc";
  }
  if (hasCommand("ffmpeg")) {
    run("ffmpeg", [
      "-y",
      "-i",
      pngPath,
      "-frames:v",
      "1",
      "-c:v",
      "libaom-av1",
      "-still-picture",
      "1",
      "-crf",
      "28",
      avifPath,
    ]);
    return "ffmpeg";
  }
  throw new Error("No AVIF encoder found (install sips, avifenc, or ffmpeg).");
}

function contentHash(filePath) {
  return createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex")
    .slice(0, 10);
}

function displayPath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith("..") ? filePath : relative;
}

async function forceCapableDevice(page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("beyondLowFx");
    } catch {
      // Storage may be unavailable before the origin exists.
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

async function isolateRoom(page) {
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("No room canvas found.");

    const stage =
      document.querySelector("[data-room-canvas], [data-beyond-stage]") ??
      canvas.parentElement;
    if (!stage) throw new Error("No room stage found.");

    stage.classList.add("beyond-poster-stage");

    for (const element of Array.from(document.body.querySelectorAll("*"))) {
      if (element.contains(canvas)) continue;
      const style = window.getComputedStyle(element);
      if (style.position === "fixed" || style.position === "sticky") {
        element.style.display = "none";
      }
    }

    document.body.classList.add("beyond-poster-body");
    document.documentElement.style.background = "#FFF8EC";
  });

  await page.addStyleTag({
    content: `
      html, body { margin: 0 !important; overflow: hidden !important; background: #FFF8EC !important; }
      .beyond-poster-body [data-beyond-chrome],
      .beyond-poster-body [data-beyond-overlays],
      .beyond-poster-body [data-beyond-list],
      .beyond-poster-body [data-beyond-fallback],
      .beyond-poster-body [data-beyond-terminal-open],
      .beyond-poster-body header,
      .beyond-poster-body nav,
      .beyond-poster-body footer,
      .beyond-poster-body [role="dialog"] { display: none !important; }
      .beyond-poster-stage {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483000 !important;
        background: #FFF8EC !important;
      }
      .beyond-poster-stage canvas {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  });

  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      })
  );
  await page.waitForTimeout(700);
}

async function capture(browser, viewport, tempDir) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });

  try {
    const page = await context.newPage();
    await forceCapableDevice(page);
    await page.goto(`${baseUrl}/beyond-terminal`, {
      waitUntil: "load",
      timeout,
    });

    await page.waitForFunction(
      () =>
        Boolean(
          document.querySelector(
            '[data-room-ready="true"], [data-beyond-room][data-ready="true"], html[data-room-ready="true"]'
          )
        ),
      undefined,
      { timeout }
    );

    await isolateRoom(page);

    const pngPath = path.join(tempDir, `${viewport.name}.png`);
    await page.screenshot({
      path: pngPath,
      type: "png",
      scale: "css",
      animations: "disabled",
    });

    return pngPath;
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "beyond-poster-"));

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  const outputs = [];

  try {
    for (const viewport of VIEWPORTS) {
      const pngPath = await capture(browser, viewport, tempDir);

      const base = `room-${viewport.width}x${viewport.height}`;
      const temporaryWebp = path.join(tempDir, `${viewport.name}.webp`);
      const temporaryAvif = path.join(tempDir, `${viewport.name}.avif`);

      const webpEncoder = encodeWebp(pngPath, temporaryWebp);
      const avifEncoder = encodeAvif(pngPath, temporaryAvif);

      const webpHash = contentHash(temporaryWebp);
      const avifHash = contentHash(temporaryAvif);
      const webpName = `${base}.${webpHash}.webp`;
      const avifName = `${base}.${avifHash}.avif`;

      fs.copyFileSync(temporaryWebp, path.join(outDir, webpName));
      fs.copyFileSync(temporaryAvif, path.join(outDir, avifName));

      outputs.push({
        viewport: `${viewport.width}x${viewport.height}`,
        webp: displayPath(path.join(outDir, webpName)),
        webpBytes: fs.statSync(path.join(outDir, webpName)).size,
        webpEncoder,
        avif: displayPath(path.join(outDir, avifName)),
        avifBytes: fs.statSync(path.join(outDir, avifName)).size,
        avifEncoder,
      });
    }

    if (values.prune) {
      const keep = new Set(outputs.flatMap((output) => [path.basename(output.webp), path.basename(output.avif)]));
      for (const file of fs.readdirSync(outDir)) {
        if (/^room-\d+x\d+\.[a-f0-9]{10}\.(avif|webp)$/.test(file) && !keep.has(file)) {
          fs.unlinkSync(path.join(outDir, file));
        }
      }
    }

    for (const output of outputs) {
      console.log(
        `[beyond:poster] ${output.viewport} webp -> ${output.webp} (${output.webpBytes} B, ${output.webpEncoder})`
      );
      console.log(
        `[beyond:poster] ${output.viewport} avif -> ${output.avif} (${output.avifBytes} B, ${output.avifEncoder})`
      );
    }
  } finally {
    await browser.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(
    `[beyond:poster] ${error instanceof Error ? error.message : String(error)}`
  );
  console.error(
    "[beyond:poster] The scene must set [data-room-ready=\"true\"] after it settles."
  );
  process.exitCode = 2;
}
