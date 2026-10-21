#!/usr/bin/env node
/**
 * Generic hero capture harness.
 *
 *   node scripts/hero/capture.mjs --url http://localhost:3000 --out DIR
 *
 * Reads only the generic hero contract:
 *   [data-hero], [data-hero-text], [data-hero-wordmark], [data-hero-layer]
 * plus the existing site rail ([data-site-chrome="navigation-rail"]).
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  detectMontageTool,
  ensureDir,
  formatBytes,
  frameDir,
  montage,
  parseArgs,
  requireOption,
  sleep,
  writeIndexHtml,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const url = requireOption(args, "url");
const outDir = ensureDir(requireOption(args, "out"));

const REST_VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
];

const REDUCED_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

const LOAD_SAMPLE_MS = 100;
const LOAD_DURATION_MS = 2000;
const POINTER_SAMPLE_MS = 150;
const POINTER_TRAVEL_MS = 1500;
const HOVER_MS = 400;
const SCROLL_STEPS = 10;
const SCROLL_STEP_WAIT_MS = 120;

const montageTool = detectMontageTool();
const notes = [];

function viewportContextOptions({ width, height }, overrides = {}) {
  const mobile = width <= 480;
  return {
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: "light",
    locale: "en-US",
    isMobile: mobile,
    hasTouch: mobile,
    ...overrides,
  };
}

async function openPage(context, targetUrl) {
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function settleAndTop(page, delayMs = 2500) {
  await sleep(delayMs);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(80);
}

async function captureViewport(page, filePath) {
  await page.screenshot({ path: filePath, caret: "hide" });
}

async function writeJpegFrame(page, filePath) {
  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 85,
    caret: "hide",
  });
  fs.writeFileSync(filePath, buffer);
}

function labelFor(elapsedMs) {
  return `t=${String(Math.round(elapsedMs)).padStart(4, "0")}ms`;
}

async function getHeroBox(page) {
  for (const selector of ["[data-hero]", "#hero"]) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) {
      continue;
    }
    const box = await locator.boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      return box;
    }
  }
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  return { x: 0, y: 0, width: viewport.width, height: viewport.height };
}

/* -------------------------------------------------------------------------- */
/* Rest screenshots                                                            */
/* -------------------------------------------------------------------------- */

async function captureRest(browser) {
  const files = [];

  for (const viewport of REST_VIEWPORTS) {
    const context = await browser.newContext(viewportContextOptions(viewport));
    try {
      const page = await openPage(context, url);
      await settleAndTop(page);
      const file = path.join(
        outDir,
        `rest-${viewport.width}x${viewport.height}.png`
      );
      await captureViewport(page, file);
      files.push({
        path: file,
        label: `${viewport.width}x${viewport.height}`,
        viewport,
      });
      console.log(`[capture] rest ${viewport.width}x${viewport.height}`);
    } finally {
      await context.close();
    }
  }

  return files;
}

async function captureReduced(browser) {
  const files = [];

  for (const viewport of REDUCED_VIEWPORTS) {
    const context = await browser.newContext(
      viewportContextOptions(viewport, { reducedMotion: "reduce" })
    );
    try {
      const page = await openPage(context, url);
      await settleAndTop(page);
      const file = path.join(outDir, `reduced-${viewport.width}.png`);
      await captureViewport(page, file);
      files.push(file);
      console.log(`[capture] reduced ${viewport.width}x${viewport.height}`);
    } finally {
      await context.close();
    }
  }

  return files;
}

/* -------------------------------------------------------------------------- */
/* Load strip (CDP screencast, repeated screenshots as fallback)               */
/* -------------------------------------------------------------------------- */

async function captureLoadWithScreencast(browser) {
  const context = await browser.newContext(
    viewportContextOptions({ width: 1440, height: 900 })
  );
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const raw = [];

  await cdp.send("Page.enable");
  cdp.on("Page.screencastFrame", (frame) => {
    raw.push({ data: frame.data, at: Date.now() });
    cdp
      .send("Page.screencastFrameAck", { sessionId: frame.sessionId })
      .catch(() => undefined);
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 80,
    maxWidth: 1440,
    maxHeight: 900,
    everyNthFrame: 1,
  });

  const startedAt = Date.now();
  const navigation = page.goto(url, { waitUntil: "load" }).catch(() => undefined);
  await sleep(LOAD_DURATION_MS);
  await navigation;
  await cdp.send("Page.stopScreencast").catch(() => undefined);
  await context.close();

  return { raw, startedAt };
}

async function captureLoadWithScreenshots(browser) {
  const context = await browser.newContext(
    viewportContextOptions({ width: 1440, height: 900 })
  );
  const page = await context.newPage();
  const startedAt = Date.now();
  const navigation = page.goto(url, { waitUntil: "load" }).catch(() => undefined);
  const raw = [];

  while (Date.now() - startedAt < LOAD_DURATION_MS) {
    const tick = Date.now();
    try {
      const buffer = await page.screenshot({ type: "jpeg", quality: 80 });
      raw.push({ buffer, at: Date.now() });
    } catch {
      // The document can be replaced mid-navigation; skip that sample.
    }
    const remaining = LOAD_SAMPLE_MS - (Date.now() - tick);
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  await navigation;
  await context.close();
  return { raw, startedAt };
}

async function captureLoadStrip(browser) {
  const loadDir = frameDir(outDir, "load");
  let result = await captureLoadWithScreencast(browser);
  let source = "cdp-screencast";

  if (result.raw.length < 3) {
    notes.push(
      "CDP screencast returned too few frames; the load strip used repeated screenshots."
    );
    source = "screenshots";
    result = await captureLoadWithScreenshots(browser);
  }

  const targets = Array.from(
    { length: Math.floor(LOAD_DURATION_MS / LOAD_SAMPLE_MS) + 1 },
    (_, index) => index * LOAD_SAMPLE_MS
  );
  const raw = result.raw.map((frame) => ({
    ...frame,
    at: frame.at - result.startedAt,
  }));

  const frames = [];
  for (const target of targets) {
    let best = raw[0];
    for (const frame of raw) {
      if (Math.abs(frame.at - target) < Math.abs(best.at - target)) {
        best = frame;
      }
    }
    if (!best) {
      break;
    }
    const file = path.join(
      loadDir,
      `load-${String(target).padStart(4, "0")}.jpg`
    );
    if (best.buffer) {
      fs.writeFileSync(file, best.buffer);
    } else {
      fs.writeFileSync(file, Buffer.from(best.data, "base64"));
    }
    frames.push({ path: file, label: labelFor(target) });
  }

  notes.push(
    `Load strip: ${frames.length} frames sampled from ${raw.length} ${source} frames.`
  );
  console.log(`[capture] load strip source=${source} frames=${frames.length}`);
  return frames;
}

/* -------------------------------------------------------------------------- */
/* Pointer strip                                                               */
/* -------------------------------------------------------------------------- */

async function moveAcrossHero(page, box, durationMs) {
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const left = Math.max(box.x + box.width * 0.5, viewport.width * 0.5);
  const right = Math.min(box.x + box.width - 32, viewport.width - 16);
  const centreY = Math.min(
    box.y + box.height * 0.55,
    viewport.height * 0.62
  );
  const amplitude = Math.min(72, box.height * 0.12);
  const steps = Math.max(24, Math.round(durationMs / 50));

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const x = left + (right - left) * eased;
    const y = centreY + Math.sin(progress * Math.PI * 2) * amplitude;
    await page.mouse.move(x, y);
    await sleep(Math.max(8, Math.round(durationMs / steps)));
  }
}

async function captureFramesWhile(page, durationMs, prefix, directory) {
  const frames = [];
  const startedAt = Date.now();
  let index = 0;

  while (Date.now() - startedAt < durationMs) {
    const tick = Date.now();
    const file = path.join(
      directory,
      `${prefix}-${String(index).padStart(3, "0")}.jpg`
    );
    await writeJpegFrame(page, file);
    const elapsed = Date.now() - startedAt;
    frames.push({ path: file, label: labelFor(elapsed) });
    index += 1;

    const remaining = POINTER_SAMPLE_MS - (Date.now() - tick);
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  return frames;
}

async function hoverHeroLayers(page, { capture, directory, prefix, frames }) {
  const layer = page.locator("[data-hero-layer]");
  const count = await layer.count();

  for (let index = 0; index < count; index += 1) {
    const box = await layer.nth(index).boundingBox();
    if (!box || box.width < 1 || box.height < 1) {
      continue;
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    for (let step = 0; step < 3; step += 1) {
      if (step > 0) {
        await sleep(150);
      }
      if (capture) {
        const file = path.join(
          directory,
          `${prefix}-layer-${String(index).padStart(2, "0")}-${step}.jpg`
        );
        await writeJpegFrame(page, file);
        frames.push({
          path: file,
          label: `layer ${index} · t=${String(step * 150).padStart(4, "0")}ms`,
        });
      }
    }
    await sleep(Math.max(0, HOVER_MS - 300));
  }

  return { layers: count };
}

async function capturePointerStrip(browser) {
  const pointerDir = frameDir(outDir, "pointer");
  const context = await browser.newContext(
    viewportContextOptions({ width: 1440, height: 900 })
  );

  try {
    const page = await openPage(context, url);
    await settleAndTop(page);
    await page.mouse.move(8, 8);

    const box = await getHeroBox(page);
    const startedAt = Date.now();
    const movement = moveAcrossHero(page, box, POINTER_TRAVEL_MS);
    const frames = await captureFramesWhile(
      page,
      POINTER_TRAVEL_MS,
      "pointer",
      pointerDir
    );
    await movement;

    const hover = await hoverHeroLayers(page, {
      capture: true,
      directory: pointerDir,
      prefix: "pointer",
      frames,
    });

    if (hover.layers === 0) {
      notes.push(
        "No [data-hero-layer] elements were present; the pointer strip covers the open sweep only."
      );
    }

    console.log(
      `[capture] pointer strip frames=${frames.length} layers=${hover.layers} elapsed=${Date.now() - startedAt}ms`
    );
    return frames;
  } finally {
    await context.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Scroll strip                                                                */
/* -------------------------------------------------------------------------- */

async function wheelScroll(page, steps, stepWaitMs) {
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const delta = Math.max(1, Math.round(viewport.height / steps));
  await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5);

  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, delta);
    await sleep(stepWaitMs);
  }
}

async function captureScrollStrip(browser) {
  const scrollDir = frameDir(outDir, "scroll");
  const context = await browser.newContext(
    viewportContextOptions({ width: 1440, height: 900 })
  );

  try {
    const page = await openPage(context, url);
    await settleAndTop(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    const frames = [];
    const startedAt = Date.now();
    const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
    const delta = Math.max(1, Math.round(viewport.height / SCROLL_STEPS));

    await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5);

    for (let index = 1; index <= SCROLL_STEPS; index += 1) {
      await page.mouse.wheel(0, delta);
      await sleep(SCROLL_STEP_WAIT_MS);
      const file = path.join(
        scrollDir,
        `scroll-${String(index).padStart(2, "0")}.jpg`
      );
      await writeJpegFrame(page, file);
      frames.push({
        path: file,
        label: `${index * SCROLL_STEP_WAIT_MS}ms`,
      });
    }

    console.log(
      `[capture] scroll strip frames=${frames.length} elapsed=${Date.now() - startedAt}ms`
    );
    return frames;
  } finally {
    await context.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Video                                                                       */
/* -------------------------------------------------------------------------- */

async function captureVideo(browser) {
  const videoDir = ensureDir(path.join(outDir, "video-source"));
  const context = await browser.newContext({
    ...viewportContextOptions({ width: 1440, height: 900 }),
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });

  try {
    const page = await openPage(context, url);
    await settleAndTop(page);
    await page.mouse.move(8, 8);

    const box = await getHeroBox(page);
    await moveAcrossHero(page, box, POINTER_TRAVEL_MS);
    await hoverHeroLayers(page, { capture: false });
    await wheelScroll(page, SCROLL_STEPS, SCROLL_STEP_WAIT_MS);
    await sleep(400);
  } finally {
    await context.close();
  }

  const candidates = fs
    .readdirSync(videoDir)
    .filter((file) => file.endsWith(".webm"))
    .map((file) => path.join(videoDir, file));
  if (candidates.length === 0) {
    notes.push("Playwright did not produce a video for the pointer/scroll sequence.");
    console.warn("[capture] no video produced");
    return null;
  }

  const target = path.join(outDir, "hero-1440.webm");
  fs.copyFileSync(candidates[0], target);
  console.log(`[capture] video ${formatBytes(fs.statSync(target).size)}`);
  return target;
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

const browser = await chromium.launch({ headless: true });
let exitCode = 0;

try {
  fs.writeFileSync(
    path.join(outDir, "run.json"),
    JSON.stringify(
      {
        startedAt: new Date().toISOString(),
        url,
        outDir,
        montageTool,
      },
      null,
      2
    )
  );

  const rest = await captureRest(browser);
  const reduced = await captureReduced(browser);
  const loadFrames = await captureLoadStrip(browser);
  const pointerFrames = await capturePointerStrip(browser);
  const scrollFrames = await captureScrollStrip(browser);
  const video = await captureVideo(browser);

  const montages = [];
  const sheetPath = path.join(outDir, "sheet.jpg");
  montages.push(
    await montage({
      browser,
      outPath: sheetPath,
      frames: rest.map(({ path: framePath, label }) => ({
        path: framePath,
        label,
      })),
      columns: 4,
      cellHeight: 360,
      title: `Rest screenshots · ${url}`,
      tool: montageTool,
    })
  );

  const loadStrip = path.join(outDir, "strip-load-1440.jpg");
  montages.push(
    await montage({
      browser,
      outPath: loadStrip,
      frames: loadFrames,
      columns: 5,
      cellWidth: 480,
      title: "Load · every 100 ms to 2000 ms · 1440×900",
      tool: montageTool,
    })
  );

  const pointerStrip = path.join(outDir, "strip-pointer-1440.jpg");
  montages.push(
    await montage({
      browser,
      outPath: pointerStrip,
      frames: pointerFrames,
      columns: 5,
      cellWidth: 480,
      title: "Pointer sweep and layer hovers · 1440×900",
      tool: montageTool,
    })
  );

  const scrollStrip = path.join(outDir, "strip-scroll-1440.jpg");
  montages.push(
    await montage({
      browser,
      outPath: scrollStrip,
      frames: scrollFrames,
      columns: 5,
      cellWidth: 480,
      title: "Scroll · one viewport in 10 wheel steps · 1440×900",
      tool: montageTool,
    })
  );

  writeIndexHtml(outDir, [
    {
      title: "Rest screenshots",
      columns: 4,
      frames: rest.map(({ path: framePath, label }) => ({
        relativePath: path.relative(outDir, framePath),
        label,
      })),
    },
    { title: "Load strip", columns: 5, frames: loadFrames.map((frame) => ({
      relativePath: path.relative(outDir, frame.path),
      label: frame.label,
    })) },
    { title: "Pointer strip", columns: 5, frames: pointerFrames.map((frame) => ({
      relativePath: path.relative(outDir, frame.path),
      label: frame.label,
    })) },
    { title: "Scroll strip", columns: 5, frames: scrollFrames.map((frame) => ({
      relativePath: path.relative(outDir, frame.path),
      label: frame.label,
    })) },
  ]);

  if (montageTool === "browser") {
    notes.push(
      "Pillow and ImageMagick were unavailable; montages were rendered through Chromium and index.html was written as the browsable frame grid."
    );
  }

  const manifest = {
    url,
    generatedAt: new Date().toISOString(),
    montageTool: [...new Set(montages)],
    rest: rest.map(({ path: framePath, label, viewport }) => ({
      file: path.basename(framePath),
      label,
      viewport,
    })),
    reduced: reduced.map((file) => path.basename(file)),
    strips: {
      load: { file: path.basename(loadStrip), frames: loadFrames.length },
      pointer: { file: path.basename(pointerStrip), frames: pointerFrames.length },
      scroll: { file: path.basename(scrollStrip), frames: scrollFrames.length },
    },
    sheet: path.basename(sheetPath),
    video: video ? path.basename(video) : null,
    notes,
  };
  fs.writeFileSync(
    path.join(outDir, "capture.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(
    `[capture] done · ${outDir} · montage=${manifest.montageTool.join(", ")}`
  );
  for (const note of notes) {
    console.log(`[capture] note: ${note}`);
  }
} catch (error) {
  exitCode = 1;
  console.error("[capture] failed:", error);
} finally {
  await browser.close();
}

process.exit(exitCode);
