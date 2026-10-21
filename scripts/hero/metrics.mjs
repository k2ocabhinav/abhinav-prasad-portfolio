#!/usr/bin/env node
/**
 * Generic hero performance harness.
 *
 *   node scripts/hero/metrics.mjs --url http://localhost:3000 --out DIR
 *   node scripts/hero/metrics.mjs --url ... --out DIR --compare baseline/metrics.json
 *
 * Measures LCP/FCP/CLS, hero image bytes, first-load JS bytes, and rAF frame
 * health during a pointer sweep and a wheel scroll. No hero-specific markup is
 * assumed beyond [data-hero] and [data-hero-wordmark].
 */
import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  ensureDir,
  formatBytes,
  parseArgs,
  requireOption,
  sleep,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const url = requireOption(args, "url");
const outDir = ensureDir(requireOption(args, "out"));

const POINTER_STEPS = 30;
const POINTER_STEP_MS = 50;
const SCROLL_STEPS = 10;
const SCROLL_STEP_MS = 120;
const MOBILE_CPU_THROTTLE = 4;

const RUNS = [
  {
    name: "desktop",
    label: "Desktop 1440×900",
    context: {
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: "light",
      locale: "en-US",
    },
    cpuThrottle: 1,
  },
  {
    name: "mobile",
    label: "Mobile 390×844 (4× CPU)",
    context: {
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
      colorScheme: "light",
      locale: "en-US",
    },
    cpuThrottle: MOBILE_CPU_THROTTLE,
  },
];

const notes = [];

/** Runs before page scripts: records paint timings and layout shift. */
function installPerformanceObservers() {
  const store = { lcp: [], cls: 0, fcp: null };
  window.__heroPerf = store;

  const selectorFor = (element) => {
    const parts = [];
    let node = element;
    while (node && node.nodeType === 1 && parts.length < 4) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        part += `#${node.id}`;
      } else {
        const firstClass = (node.getAttribute("class") ?? "")
          .split(/\s+/)
          .filter(Boolean)[0];
        if (firstClass) {
          part += `.${firstClass}`;
        }
      }
      parts.unshift(part);
      node = node.parentElement;
    }
    return parts.join(" > ");
  };

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const element = entry.element ?? null;
        const wordmark = document.querySelector("[data-hero-wordmark]");
        store.lcp.push({
          startTime: entry.startTime,
          size: entry.size ?? 0,
          tag: element ? element.tagName.toLowerCase() : null,
          text: element ? (element.textContent ?? "").trim().slice(0, 100) : null,
          selector: element ? selectorFor(element) : null,
          insideHero: Boolean(element && element.closest("[data-hero]")),
          insideWordmark: Boolean(
            element &&
              (element === wordmark ||
                element.closest("[data-hero-wordmark]") !== null)
          ),
          isWordmarkText: Boolean(
            element &&
              wordmark &&
              (element.textContent ?? "").trim() ===
                (wordmark.textContent ?? "").trim()
          ),
        });
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // Browser without LCP support: the run reports it as unavailable.
  }

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          store.cls += entry.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    // CLS unsupported.
  }

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          store.fcp = entry.startTime;
        }
      }
    }).observe({ type: "paint", buffered: true });
  } catch {
    // Paint observer unsupported.
  }
}

function collectPerformance() {
  const store = window.__heroPerf ?? { lcp: [], cls: 0, fcp: null };
  const resources = performance.getEntriesByType("resource").map((entry) => ({
    name: entry.name,
    initiatorType: entry.initiatorType,
    transferSize: entry.transferSize || 0,
    encodedBodySize: entry.encodedBodySize || 0,
  }));

  const hero = document.querySelector("[data-hero]");
  const heroImages = hero
    ? Array.from(hero.querySelectorAll("img")).map((image) => ({
        src: image.currentSrc || image.src,
        renderedWidth: image.getBoundingClientRect().width,
        renderedHeight: image.getBoundingClientRect().height,
        naturalWidth: image.naturalWidth,
      }))
    : [];

  const paintEntries = performance.getEntriesByType("paint");
  const fcpEntry = paintEntries.find(
    (entry) => entry.name === "first-contentful-paint"
  );

  return {
    lcp: store.lcp.length > 0 ? store.lcp[store.lcp.length - 1] : null,
    cls: store.cls,
    fcp: store.fcp ?? fcpEntry?.startTime ?? null,
    heroFound: Boolean(hero),
    heroImages,
    resources,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio,
    },
  };
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

async function pointerSweep(page) {
  const box = await getHeroBox(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const left = Math.max(box.x + box.width * 0.5, viewport.width * 0.5);
  const right = Math.min(box.x + box.width - 32, viewport.width - 16);
  const centreY = Math.min(box.y + box.height * 0.55, viewport.height * 0.62);
  const amplitude = Math.min(72, box.height * 0.12);

  for (let step = 0; step <= POINTER_STEPS; step += 1) {
    const progress = step / POINTER_STEPS;
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    await page.mouse.move(
      left + (right - left) * eased,
      centreY + Math.sin(progress * Math.PI * 2) * amplitude
    );
    await sleep(POINTER_STEP_MS);
  }
}

async function wheelScroll(page) {
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const delta = Math.max(1, Math.round(viewport.height / SCROLL_STEPS));
  await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5);

  for (let index = 0; index < SCROLL_STEPS; index += 1) {
    await page.mouse.wheel(0, delta);
    await sleep(SCROLL_STEP_MS);
  }
}

function summariseFrames(times) {
  const deltas = [];
  for (let index = 1; index < times.length; index += 1) {
    const delta = times[index] - times[index - 1];
    if (Number.isFinite(delta) && delta > 0 && delta < 2000) {
      deltas.push(delta);
    }
  }

  if (deltas.length === 0) {
    return {
      frames: times.length,
      durationMs: 0,
      medianFrameMs: null,
      medianFps: null,
      over20msShare: null,
    };
  }

  const sorted = [...deltas].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    frames: times.length,
    durationMs: Math.round(times[times.length - 1] - times[0]),
    medianFrameMs: Number(median.toFixed(2)),
    medianFps: Number((1000 / median).toFixed(1)),
    over20msShare: Number(
      (deltas.filter((delta) => delta > 20).length / deltas.length).toFixed(4)
    ),
  };
}

async function measureFps(page, action) {
  await page.evaluate(() => {
    const state = { times: [], active: true };
    window.__heroFps = state;
    const loop = (time) => {
      if (!state.active) {
        return;
      }
      state.times.push(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  await action();

  const times = await page.evaluate(() => {
    const state = window.__heroFps;
    if (!state) {
      return [];
    }
    state.active = false;
    return state.times;
  });

  return summariseFrames(times);
}

function bytesForImage(image, resourcesByUrl) {
  if (image.src.startsWith("data:")) {
    const comma = image.src.indexOf(",");
    const base64 = comma >= 0 ? image.src.slice(comma + 1) : "";
    return Math.floor((base64.length * 3) / 4);
  }

  const resource = resourcesByUrl.get(image.src);
  if (!resource) {
    return 0;
  }
  return resource.transferSize || resource.encodedBodySize || 0;
}

function summariseBytes(collected) {
  const resourcesByUrl = new Map(
    collected.resources.map((resource) => [resource.name, resource])
  );

  const heroImages = collected.heroImages.map((image) => ({
    src: image.src,
    bytes: bytesForImage(image, resourcesByUrl),
    renderedWidth: Math.round(image.renderedWidth),
    naturalWidth: image.naturalWidth,
  }));
  const heroImageBytes = heroImages.reduce((sum, image) => sum + image.bytes, 0);

  const jsResources = collected.resources.filter(
    (resource) =>
      resource.initiatorType === "script" ||
      /\.m?js(?:[?#]|$)/.test(resource.name)
  );
  const jsBytes = jsResources.reduce(
    (sum, resource) =>
      sum + (resource.transferSize || resource.encodedBodySize || 0),
    0
  );

  return { heroImages, heroImageBytes, jsBytes };
}

function round(value, digits = 1) {
  return typeof value === "number" && Number.isFinite(value)
    ? Number(value.toFixed(digits))
    : null;
}

async function measureRun(browser, run) {
  const context = await browser.newContext(run.context);
  await context.addInitScript(installPerformanceObservers);

  const page = await context.newPage();
  try {
    if (run.cpuThrottle > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", {
        rate: run.cpuThrottle,
      });
    }

    await page.goto(url, { waitUntil: "load", timeout: 90_000 });
    await page.evaluate(() => document.fonts.ready);
    await sleep(2500);

    const collected = await page.evaluate(collectPerformance);
    const bytes = summariseBytes(collected);

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    const pointer = await measureFps(page, () => pointerSweep(page));

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    const scroll = await measureFps(page, () => wheelScroll(page));

    if (!collected.lcp) {
      notes.push(
        `${run.name}: no largest-contentful-paint entry was observed.`
      );
    }
    if (!collected.heroFound) {
      notes.push(
        `${run.name}: [data-hero] was not present, so hero image bytes are 0.`
      );
    }
    if (collected.heroImages.length > 0 && bytes.heroImageBytes === 0) {
      notes.push(
        `${run.name}: hero images had no matching resource timing entries (cached or data URLs).`
      );
    }

    return {
      viewport: collected.viewport,
      cpuThrottle: run.cpuThrottle,
      heroFound: collected.heroFound,
      lcp: collected.lcp
        ? {
            ...collected.lcp,
            startTime: round(collected.lcp.startTime),
          }
        : null,
      fcpMs: round(collected.fcp),
      cls: round(collected.cls, 4),
      hero: {
        found: collected.heroFound,
        imageCount: bytes.heroImages.length,
        bytes: bytes.heroImageBytes,
        images: bytes.heroImages,
      },
      jsBytes: bytes.jsBytes,
      fps: { pointer, scroll },
    };
  } finally {
    await context.close();
  }
}

function describeLcp(lcp) {
  if (!lcp) {
    return "not observed";
  }
  const text = (lcp.text ?? "").replace(/\s+/g, " ").trim();
  const snippet = text.length > 48 ? `${text.slice(0, 48)}…` : text;
  const flags = [];
  if (lcp.insideWordmark) {
    flags.push("wordmark");
  } else if (lcp.isWordmarkText) {
    flags.push("wordmark text");
  }
  if (!flags.length && lcp.insideHero) {
    flags.push("hero");
  }
  const suffix = flags.length > 0 ? ` (${flags.join(", ")})` : "";
  return `${lcp.tag ?? "element"}${snippet ? ` “${snippet}”` : ""}${suffix}`;
}

function writeMarkdown(runs) {
  const lines = [
    "# Hero metrics",
    "",
    `Source: ${url}`,
    "",
    "| Metric | Desktop 1440×900 | Mobile 390×844 (4× CPU) |",
    "| --- | ---: | ---: |",
  ];

  const cell = (value, suffix = "") =>
    value === null || value === undefined ? "—" : `${value}${suffix}`;

  const desktop = runs.desktop;
  const mobile = runs.mobile;
  const share = (value) =>
    value === null || value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;

  lines.push(
    `| LCP | ${cell(desktop.lcp?.startTime, " ms")} | ${cell(mobile.lcp?.startTime, " ms")} |`
  );
  lines.push(
    `| LCP element | ${describeLcp(desktop.lcp)} | ${describeLcp(mobile.lcp)} |`
  );
  lines.push(`| FCP | ${cell(desktop.fcpMs, " ms")} | ${cell(mobile.fcpMs, " ms")} |`);
  lines.push(`| CLS | ${cell(desktop.cls)} | ${cell(mobile.cls)} |`);
  lines.push(
    `| Hero image bytes | ${formatBytes(desktop.hero.bytes)} (${desktop.hero.imageCount}) | ${formatBytes(mobile.hero.bytes)} (${mobile.hero.imageCount}) |`
  );
  lines.push(
    `| JS bytes transferred | ${formatBytes(desktop.jsBytes)} | ${formatBytes(mobile.jsBytes)} |`
  );
  lines.push(
    `| Pointer median fps | ${cell(desktop.fps.pointer.medianFps)} | ${cell(mobile.fps.pointer.medianFps)} |`
  );
  lines.push(
    `| Pointer frames >20 ms | ${share(desktop.fps.pointer.over20msShare)} | ${share(mobile.fps.pointer.over20msShare)} |`
  );
  lines.push(
    `| Scroll median fps | ${cell(desktop.fps.scroll.medianFps)} | ${cell(mobile.fps.scroll.medianFps)} |`
  );
  lines.push(
    `| Scroll frames >20 ms | ${share(desktop.fps.scroll.over20msShare)} | ${share(mobile.fps.scroll.over20msShare)} |`
  );

  if (notes.length > 0) {
    lines.push("", "## Notes", "");
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

function flattenNumbers(value, prefix = "", target = {}) {
  if (typeof value === "number" && Number.isFinite(value)) {
    target[prefix] = value;
    return target;
  }
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    return target;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "generatedAt") {
      continue;
    }
    flattenNumbers(child, prefix ? `${prefix}.${key}` : key, target);
  }
  return target;
}

function printComparison(baseline, current) {
  const baseFlat = flattenNumbers(baseline);
  const currentFlat = flattenNumbers(current);
  const keys = [...new Set([...Object.keys(baseFlat), ...Object.keys(currentFlat)])]
    .filter((key) => !key.startsWith("hero.images"))
    .sort();

  const rows = [];
  for (const key of keys) {
    const before = baseFlat[key];
    const after = currentFlat[key];
    if (before === undefined || after === undefined) {
      rows.push({ metric: key, baseline: before ?? "—", current: after ?? "—", delta: "—" });
      continue;
    }
    if (before === after) {
      continue;
    }
    const delta = after - before;
    const percent = before === 0 ? "—" : `${((delta / before) * 100).toFixed(1)}%`;
    rows.push({
      metric: key,
      baseline: Number(before.toFixed(2)),
      current: Number(after.toFixed(2)),
      delta: `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`,
      change: percent,
    });
  }

  if (rows.length === 0) {
    console.log("[metrics] compare: no numeric differences");
    return [];
  }

  const header = ["metric", "baseline", "current", "delta", "change"];
  const widths = header.map((name) =>
    Math.max(
      name.length,
      ...rows.map((row) => String(row[name] ?? "").length)
    )
  );
  const line = (cells) =>
    cells.map((cell, index) => String(cell).padEnd(widths[index])).join("  ");

  console.log("\n[metrics] compare");
  console.log(line(header));
  console.log(line(widths.map((width) => "-".repeat(width))));
  for (const row of rows) {
    console.log(
      line([row.metric, row.baseline, row.current, row.delta, row.change ?? ""])
    );
  }
  return rows;
}

function writeComparisonMarkdown(rows) {
  if (rows.length === 0) {
    return "# Hero metrics comparison\n\nNo numeric differences.\n";
  }
  const lines = [
    "# Hero metrics comparison",
    "",
    "| Metric | Baseline | Current | Delta | Change |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.metric} | ${row.baseline} | ${row.current} | ${row.delta} | ${row.change ?? "—"} |`
    );
  }
  lines.push("");
  return lines.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

const browser = await chromium.launch({ headless: true });
let exitCode = 0;

try {
  const runs = {};
  for (const run of RUNS) {
    const startedAt = Date.now();
    runs[run.name] = await measureRun(browser, run);
    console.log(
      `[metrics] ${run.name} measured in ${Date.now() - startedAt}ms`
    );
  }

  const metrics = {
    generatedAt: new Date().toISOString(),
    url,
    runs,
    notes,
  };

  fs.writeFileSync(
    path.join(outDir, "metrics.json"),
    JSON.stringify(metrics, null, 2)
  );
  fs.writeFileSync(path.join(outDir, "metrics.md"), writeMarkdown(runs));

  console.log(`[metrics] wrote ${path.join(outDir, "metrics.json")}`);
  console.log(`[metrics] wrote ${path.join(outDir, "metrics.md")}`);
  console.log(writeMarkdown(runs));

  if (typeof args.compare === "string") {
    const baselinePath = path.resolve(args.compare);
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    const rows = printComparison(baseline, metrics);
    fs.writeFileSync(
      path.join(outDir, "metrics-compare.md"),
      writeComparisonMarkdown(rows)
    );
  }
} catch (error) {
  exitCode = 1;
  console.error("[metrics] failed:", error);
} finally {
  await browser.close();
}

process.exit(exitCode);
