import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseUrl = process.env.PORTFOLIO_CAPTURE_URL ?? "http://127.0.0.1:3000";
const projectOutput = path.join(root, "public/projects/portfolio-platform");
const projectOgOutput = path.join(projectOutput, "og.jpg");
const publicOgOutput = path.join(root, "public/og-image.jpg");
const appOgOutput = path.join(root, "src/app/opengraph-image.jpg");

const captures = [
  {
    file: "home-first-desktop.webp",
    route: "/",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  },
  {
    file: "home-first-phone.webp",
    route: "/",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    checkWordmark: true,
  },
  {
    file: "work-section-method.webp",
    route: "/",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    target: "#work",
    captureElement: true,
  },
];

fs.mkdirSync(projectOutput, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function settlePage(page, target) {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(180);

  if (target) {
    await page.locator(target).first().scrollIntoViewIfNeeded();
    await page.evaluate(async (selector) => {
      const section = document.querySelector(selector);
      if (!section) throw new Error(`Capture target not found: ${selector}`);

      const images = Array.from(section.querySelectorAll("img"));
      for (const image of images) {
        image.loading = "eager";
        image.scrollIntoView({ block: "center", behavior: "instant" });
        if (!image.currentSrc && image.getAttribute("src")) {
          image.src = image.getAttribute("src");
        }
        if (!image.complete) {
          await Promise.race([
            new Promise((resolve) => {
              const finish = () => resolve();
              image.addEventListener("load", finish, { once: true });
              image.addEventListener("error", finish, { once: true });
              if (image.complete) finish();
            }),
            new Promise((resolve) => window.setTimeout(resolve, 10000)),
          ]);
        }
        if (!image.naturalWidth) throw new Error(`Capture image failed to load: ${image.src}`);
        await image.decode().catch(() => undefined);
      }
      section.scrollIntoView({ block: "start", behavior: "instant" });
    }, target);
  }

  if (!target) {
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images)
          .filter((image) => {
            const rect = image.getBoundingClientRect();
            return rect.bottom >= 0 && rect.top <= window.innerHeight;
          })
          .map((image) => image.decode().catch(() => undefined)),
      );
    });
  }
  await page.waitForTimeout(180);
}

async function encodeWebp(page, png, outputPath) {
  const webpDataUrl = await page.evaluate(async (pngBase64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${pngBase64}`;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create a canvas context for WebP capture");
    context.drawImage(image, 0, 0);

    return canvas.toDataURL("image/webp", 0.82);
  }, png.toString("base64"));

  const [mime, encoded] = webpDataUrl.split(",", 2);
  if (!mime?.startsWith("data:image/webp") || !encoded) {
    throw new Error(`WebP capture failed for ${outputPath}`);
  }
  fs.writeFileSync(outputPath, Buffer.from(encoded, "base64"));
}

async function captureOne(capture) {
  console.log(`[capture:portfolio] capturing ${capture.file}`);
  const context = await browser.newContext({
    viewport: capture.viewport,
    deviceScaleFactor: capture.deviceScaleFactor,
    colorScheme: "light",
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
    reducedMotion: "reduce",
    ...(capture.isMobile ? { isMobile: true, hasTouch: true } : {}),
  });

  try {
    await context.addInitScript(() => {
      document.documentElement.dataset.e2eFreezeArtifacts = "true";
      document.documentElement.dataset.e2eStaticHero = "true";
    });

    const page = await context.newPage();
    await page.clock.setFixedTime(new Date("2026-07-10T06:00:00.000Z"));
    await page.goto(new URL(capture.route, baseUrl).toString(), {
      waitUntil: "domcontentloaded",
    });
    await settlePage(page, capture.target);

    if (capture.checkWordmark) {
      const wordmark = await page.locator("[data-hero-wordmark]").first().boundingBox();
      const viewport = page.viewportSize();
      if (!wordmark || !viewport ||
          wordmark.x < 0 || wordmark.y < 0 ||
          wordmark.x + wordmark.width > viewport.width ||
          wordmark.y + wordmark.height > viewport.height) {
        throw new Error("The phone capture would crop the Abhinav wordmark");
      }
    }

    const outputPath = path.join(projectOutput, capture.file);
    const screenshot = capture.captureElement
      ? await page.locator(capture.target).screenshot({
          animations: "disabled",
          scale: "css",
          timeout: 30000,
        })
      : await page.screenshot({ animations: "disabled", scale: "device" });
    await encodeWebp(page, screenshot, outputPath);
    console.log(`[capture:portfolio] saved ${capture.file}`);
  } finally {
    await context.close();
  }
}

for (const capture of captures) {
  await captureOne(capture);
}

const ogContext = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  locale: "en-US",
  timezoneId: "Asia/Kolkata",
  reducedMotion: "reduce",
});

try {
  await ogContext.addInitScript(() => {
    document.documentElement.dataset.e2eFreezeArtifacts = "true";
    document.documentElement.dataset.e2eStaticHero = "true";
  });
  const ogPage = await ogContext.newPage();
  await ogPage.clock.setFixedTime(new Date("2026-07-10T06:00:00.000Z"));
  await ogPage.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  await settlePage(ogPage);
  const ogImage = await ogPage.screenshot({
    animations: "disabled",
    scale: "css",
    type: "jpeg",
    quality: 85,
  });
  for (const output of [publicOgOutput, appOgOutput, projectOgOutput]) {
    fs.writeFileSync(output, ogImage);
  }
} finally {
  await ogContext.close();
  await browser.close();
}

console.log("[capture:portfolio] wrote 3 gallery images and 3 OG images");
