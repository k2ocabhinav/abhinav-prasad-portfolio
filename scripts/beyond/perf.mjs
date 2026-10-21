#!/usr/bin/env node
/**
 * Beyond the Terminal performance harness.
 *
 * Measures the finished route against a running server:
 *   - route JS transferred by `/` and `/beyond-terminal` (unique chunks, gz)
 *   - poster LCP and CLS on a simulated mid phone (4x CPU, Fast 3G)
 *   - idle and pointer-movement fps in the room scene (rAF sampling)
 *
 * Production numbers only mean something against a production build:
 *
 *   npm run build
 *   npm run beyond:perf -- --serve
 *
 * `--serve` starts `next start` on the URL's port and stops it again. Without
 * it, point `--url` at any already-running server. Evidence is written to
 * `--out` (default: the OS temp directory), never inside the repo.
 *
 *   node scripts/beyond/perf.mjs --url http://127.0.0.1:3931 --out DIR
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";

const ROUTE_JS_BUDGET_GZ = 320 * 1024;
const LCP_BUDGET_MS = 2_500;
const CLS_BUDGET = 0.01;
const DESKTOP_FPS_BUDGET = 55;
const MOBILE_FPS_BUDGET = 40;
const IDLE_SAMPLE_MS = 5_000;
const POINTER_SAMPLE_MS = 3_000;
const GPU_ARGS = process.platform === "darwin"
  ? ["--enable-gpu", "--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=metal"]
  : ["--enable-gpu", "--ignore-gpu-blocklist"];
const FAST_3G = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  connectionType: "cellular3g",
};

const { values } = parseArgs({
  options: {
    url: { type: "string", default: "http://127.0.0.1:3931" },
    out: { type: "string" },
    serve: { type: "boolean", default: false },
    timeout: { type: "string", default: "45000" },
  },
});

const baseUrl = new URL(values.url).toString().replace(/\/$/, "");
const outDir = values.out ?? path.join(os.tmpdir(), "beyond-perf");
const timeout = Number(values.timeout);

fs.mkdirSync(outDir, { recursive: true });

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio));
  return sorted[index];
}

function summariseFrames(intervals) {
  const frames = intervals.slice(1).filter((value) => value > 0);
  if (frames.length === 0) {
    return { available: true, frames: 0, fps: 0, p95FrameMs: 0, longFrames: 0 };
  }
  const total = frames.reduce((sum, value) => sum + value, 0);
  return {
    available: true,
    frames: frames.length,
    fps: Number((1000 / (total / frames.length)).toFixed(1)),
    p95FrameMs: Number(percentile(frames, 0.95).toFixed(1)),
    longFrames: frames.filter((value) => value > 32).length,
  };
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

async function measureRouteScripts(browser, route) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "no-preference",
  });

  try {
    const page = await context.newPage();
    await forceCapableDevice(page);
    const bodies = new Map();

    page.on("response", (response) => {
      if (response.request().resourceType() !== "script") return;
      const url = response.url();
      if (bodies.has(url)) return;
      bodies.set(
        url,
        response.body().catch(() => Buffer.alloc(0))
      );
    });

    await page.goto(`${baseUrl}${route}`, {
      waitUntil: "load",
      timeout,
    });
    await page.waitForLoadState("networkidle", { timeout }).catch(() => undefined);
    // Dynamic imports can wait for requestIdleCallback, so give the route a
    // deliberate settling window before the chunk set is considered final.
    await page.waitForTimeout(route === "/" ? 2_500 : 6_000);

    const files = [];
    for (const [url, pending] of bodies) {
      const body = await pending;
      files.push({
        url,
        bytes: body.length,
        gzipBytes: zlib.gzipSync(body, { level: 9 }).length,
      });
    }
    files.sort((left, right) => right.gzipBytes - left.gzipBytes);

    return {
      route,
      files: files.length,
      bytes: files.reduce((sum, file) => sum + file.bytes, 0),
      gzipBytes: files.reduce((sum, file) => sum + file.gzipBytes, 0),
      largest: files.slice(0, 8).map((file) => ({
        path: new URL(file.url).pathname,
        gzipBytes: file.gzipBytes,
      })),
    };
  } finally {
    await context.close();
  }
}

async function measureLoading(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });

  try {
    const page = await context.newPage();
    await forceCapableDevice(page);
    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", FAST_3G);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.addInitScript(() => {
      window.__beyondLoading = { lcp: [], cls: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const element = entry.element;
          window.__beyondLoading.lcp.push({
            startTime: entry.startTime,
            size: entry.size,
            url: entry.url,
            element: element
              ? {
                  tag: element.tagName,
                  id: element.id,
                  className:
                    typeof element.className === "string"
                      ? element.className
                      : "",
                }
              : null,
          });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__beyondLoading.cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(`${baseUrl}/beyond-terminal`, {
      waitUntil: "load",
      timeout: Math.max(timeout, 60_000),
    });
    await page.waitForTimeout(3_000);

    const loading = await page.evaluate(() => window.__beyondLoading);
    const lcp = loading.lcp.length > 0 ? loading.lcp.at(-1) : null;

    return {
      lcp: lcp
        ? {
            ms: Number(lcp.startTime.toFixed(0)),
            size: lcp.size,
            element: lcp.element,
            url: lcp.url,
          }
        : null,
      cls: Number(loading.cls.toFixed(4)),
    };
  } finally {
    await context.close();
  }
}

async function sampleFrames(page, duration) {
  return page.evaluate(
    (sampleDuration) =>
      new Promise((resolve) => {
        const frames = [];
        let last = performance.now();
        const start = last;
        const tick = (now) => {
          frames.push(now - last);
          last = now;
          if (now - start < sampleDuration) {
            requestAnimationFrame(tick);
          } else {
            resolve(frames);
          }
        };
        requestAnimationFrame(tick);
      }),
    duration
  );
}

async function measureFps(browser, device) {
  const context = await browser.newContext({
    ...device,
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

    const canvas = page
      .locator("canvas")
      .filter({ visible: true })
      .first();
    const mounted = await canvas
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!mounted) {
      return { available: false, reason: "no canvas mounted on this host" };
    }

    const renderer = await page.evaluate(() => {
      const context = document.querySelector("canvas")?.getContext("webgl2");
      if (!context) return "unavailable";
      const extension = context.getExtension("WEBGL_debug_renderer_info");
      const value = extension
        ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : context.getParameter(context.RENDERER);
      return typeof value === "string" ? value : "unknown";
    });

    await page
      .locator('[data-room-ready="true"]')
      .first()
      .waitFor({ state: "attached", timeout: 10_000 })
      .catch(() => undefined);
    await page.waitForTimeout(1_000);

    const idle = summariseFrames(await sampleFrames(page, IDLE_SAMPLE_MS));

    const box = await canvas.boundingBox();
    const center = {
      x: (box?.x ?? 0) + (box?.width ?? 1440) / 2,
      y: (box?.y ?? 0) + (box?.height ?? 900) / 2,
    };
    const radius = Math.min(240, Math.max(60, (box?.width ?? 1440) / 5));

    const pointerSample = sampleFrames(page, POINTER_SAMPLE_MS);
    const startedAt = Date.now();
    let step = 0;
    while (Date.now() - startedAt < POINTER_SAMPLE_MS) {
      const angle = (step / 48) * Math.PI * 2;
      await page.mouse.move(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius * 0.6
      );
      await page.waitForTimeout(50);
      step += 1;
    }
    const movement = summariseFrames(await pointerSample);

    return { available: true, renderer, idle, movement };
  } finally {
    await context.close();
  }
}

function verdict(value, budget, comparison) {
  if (value === null || value === undefined) return "n/a";
  const passes = comparison === "max" ? value <= budget : value >= budget;
  return passes ? "pass" : "fail";
}

async function startServer() {
  const port = new URL(baseUrl).port || "3000";
  if (!fs.existsSync(path.join(process.cwd(), ".next", "BUILD_ID"))) {
    throw new Error(
      "No production build found. Run `npm run build` before `--serve`."
    );
  }

  const child = spawn(
    "npm",
    [
      "run",
      "start",
      "--",
      "--hostname",
      "127.0.0.1",
      "--port",
      port,
    ],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      detached: true,
    }
  );

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { method: "HEAD" });
      if (response.ok) return child;
    } catch {
      // Server is still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  stopServer(child);
  throw new Error(`Server on ${baseUrl} did not become ready.`);
}

function stopServer(child) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

async function main() {
  let server = null;
  const browser = await chromium.launch({
    headless: true,
    args: [
      ...GPU_ARGS,
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  try {
    if (values.serve) {
      server = await startServer();
    }

    console.log(`[beyond:perf] measuring ${baseUrl}`);
    const home = await measureRouteScripts(browser, "/");
    const beyond = await measureRouteScripts(browser, "/beyond-terminal");
    const loading = await measureLoading(browser);
    const fps = {
      desktop: await measureFps(browser, { viewport: { width: 1440, height: 900 } }),
      mobile: await measureFps(browser, {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      }),
    };

    const result = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      note: "Route JS is the gzip level 9 size of each unique script the route loaded. Measure against a production build.",
      routes: { home, beyond },
      loading,
      fps,
      budgets: {
        beyondRouteJsGzipBytes: ROUTE_JS_BUDGET_GZ,
        lcpMs: LCP_BUDGET_MS,
        desktopFps: DESKTOP_FPS_BUDGET,
        mobileFps: MOBILE_FPS_BUDGET,
        cls: CLS_BUDGET,
      },
      checks: {
        beyondRouteJs: verdict(
          beyond.gzipBytes,
          ROUTE_JS_BUDGET_GZ,
          "max"
        ),
        lcp: verdict(loading.lcp?.ms ?? null, LCP_BUDGET_MS, "max"),
        desktopFps: verdict(
          fps.desktop.available ? fps.desktop.movement.fps : null,
          DESKTOP_FPS_BUDGET,
          "min"
        ),
        mobileFps: verdict(
          fps.mobile.available ? fps.mobile.movement.fps : null,
          MOBILE_FPS_BUDGET,
          "min"
        ),
        cls: verdict(loading.cls, CLS_BUDGET, "max"),
      },
    };

    fs.writeFileSync(
      path.join(outDir, "perf.json"),
      `${JSON.stringify(result, null, 2)}\n`
    );
    fs.writeFileSync(
      path.join(outDir, "perf.md"),
      renderMarkdown(result)
    );

    console.log(`[beyond:perf] wrote ${path.join(outDir, "perf.json")}`);
    console.log(`[beyond:perf] wrote ${path.join(outDir, "perf.md")}`);
    console.log(
      `[beyond:perf] / gz ${formatBytes(home.gzipBytes)}, /beyond-terminal gz ${formatBytes(beyond.gzipBytes)}`
    );
  } finally {
    await browser.close();
    stopServer(server);
  }
}

function renderMarkdown(result) {
  const { home, beyond } = result.routes;
  const fps = result.fps;
  const lcp = result.loading.lcp;

  return [
    "# Beyond the Terminal performance",
    "",
    `- Measured: ${result.generatedAt}`,
    `- URL: ${result.baseUrl}`,
    "- Route JS: gzip level 9 of every unique script the route requested.",
    "- Loading: mid phone (390x844, DPR 3), 4x CPU, Fast 3G.",
    "",
    "## Route JS",
    "",
    "| Route | Scripts | Raw | Gzip | Budget | Verdict |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    `| \`/\` | ${home.files} | ${formatBytes(home.bytes)} | ${formatBytes(home.gzipBytes)} | n/a | n/a |`,
    `| \`/beyond-terminal\` | ${beyond.files} | ${formatBytes(beyond.bytes)} | ${formatBytes(beyond.gzipBytes)} | ${formatBytes(ROUTE_JS_BUDGET_GZ)} | ${result.checks.beyondRouteJs} |`,
    "",
    "Largest Beyond chunks:",
    "",
    ...beyond.largest.map(
      (file) => `- \`${file.path}\` ${formatBytes(file.gzipBytes)} gz`
    ),
    "",
    "## Loading",
    "",
    "| Metric | Value | Budget | Verdict |",
    "| --- | ---: | ---: | --- |",
    `| LCP | ${lcp ? `${lcp.ms} ms (${lcp.element?.tag ?? "unknown"}${lcp.element?.id ? `#${lcp.element.id}` : ""})` : "not observed"} | ${LCP_BUDGET_MS} ms | ${result.checks.lcp} |`,
    `| CLS | ${result.loading.cls} | ${CLS_BUDGET} | ${result.checks.cls} |`,
    "",
    "## Scene fps",
    "",
    [
      `Desktop renderer: ${fps.desktop.renderer ?? fps.desktop.reason}.`,
      `Mobile viewport renderer: ${fps.mobile.renderer ?? fps.mobile.reason}.`,
      `GPU flags: ${GPU_ARGS.join(" ")}.`,
      "",
      "| Viewport | Phase | Frames | FPS | p95 frame | > 32 ms |",
      "| --- | --- | ---: | ---: | ---: | ---: |",
      ...[
        ["Desktop", fps.desktop],
        ["390x844, DPR 3", fps.mobile],
      ].flatMap(([label, sample]) => sample.available
        ? [
            `| ${label} | Idle 5 s | ${sample.idle.frames} | ${sample.idle.fps} | ${sample.idle.p95FrameMs} ms | ${sample.idle.longFrames} |`,
            `| ${label} | Pointer 3 s | ${sample.movement.frames} | ${sample.movement.fps} | ${sample.movement.p95FrameMs} ms | ${sample.movement.longFrames} |`,
          ]
        : [`| ${label} | n/a | 0 | n/a | n/a | n/a |`]),
      "",
      `Budgets are ${DESKTOP_FPS_BUDGET} fps desktop and ${MOBILE_FPS_BUDGET} fps mid-phone. The mobile sample uses a 390x844 viewport at DPR 3 on the same Apple M5 GPU, so it is responsive-viewport emulation and not a physical mid-phone GPU measurement. Idle fps includes the harness rAF loop and is not a draw-call count.`,
    ].join("\n"),
    "",
    "## Verdict",
    "",
    `- Beyond route JS: ${result.checks.beyondRouteJs}`,
    `- LCP: ${result.checks.lcp}`,
    `- Desktop fps while pointing: ${result.checks.desktopFps}`,
    `- Mobile viewport fps while pointing: ${result.checks.mobileFps}`,
    `- CLS: ${result.checks.cls}`,
    "",
  ].join("\n");
}

await main();
