import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseUrl = process.env.PORTFOLIO_CAPTURE_URL ?? "http://127.0.0.1:3000";
const projectOutput = path.join(root, "public/projects/portfolio-platform");
const publicOgOutput = path.join(root, "public/og-image.jpg");
const appOgOutput = path.join(root, "src/app/opengraph-image.jpg");

const captures = [
  { file: "01-hero-wordmark.webp", route: "/", target: "#hero" },
  { file: "02-about-philosophy.webp", route: "/", target: "#about" },
  { file: "03-works-case-study.webp", route: "/", target: "#work" },
  { file: "04-stack-riso.webp", route: "/", target: "#stack" },
  { file: "05-contact-espresso.webp", route: "/", target: "#contact" },
  { file: "06-velo-case-study.webp", route: "/work/velo" },
];

fs.mkdirSync(projectOutput, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  locale: "en-US",
  timezoneId: "Asia/Kolkata",
  reducedMotion: "reduce",
});

await context.addInitScript(() => {
  document.documentElement.dataset.e2eFreezeArtifacts = "true";
  document.documentElement.dataset.e2eStaticHero = "true";
});

const page = await context.newPage();
await page.clock.setFixedTime(new Date("2026-07-10T06:00:00.000Z"));

async function settlePage() {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.bottom >= 0 && rect.top <= window.innerHeight;
        })
        .map((image) =>
          image.complete ? Promise.resolve() : image.decode().catch(() => undefined),
        ),
    );
  });
  await page.waitForTimeout(180);
}

async function writeWebpScreenshot(outputPath) {
  const png = await page.screenshot({
    animations: "disabled",
    scale: "css",
  });
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

    return canvas.toDataURL("image/webp", 0.9);
  }, png.toString("base64"));

  const [mime, encoded] = webpDataUrl.split(",", 2);
  if (!mime?.startsWith("data:image/webp") || !encoded) {
    throw new Error(`WebP capture failed for ${outputPath}`);
  }
  fs.writeFileSync(outputPath, Buffer.from(encoded, "base64"));
}

for (const capture of captures) {
  await page.goto(new URL(capture.route, baseUrl).toString(), {
    waitUntil: "domcontentloaded",
  });

  if (capture.target) {
    await page.locator(capture.target).first().scrollIntoViewIfNeeded();
    await page.evaluate((selector) => {
      document.querySelector(selector)?.scrollIntoView({ block: "start", behavior: "auto" });
    }, capture.target);
    await page.waitForTimeout(120);
  }
  await settlePage();

  await writeWebpScreenshot(path.join(projectOutput, capture.file));
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "domcontentloaded" });
await settlePage();
const ogImage = await page.screenshot({
  animations: "disabled",
  scale: "css",
  type: "jpeg",
  quality: 85,
});
fs.writeFileSync(publicOgOutput, ogImage);
fs.writeFileSync(appOgOutput, ogImage);

await browser.close();

console.log(`[capture:portfolio] wrote ${captures.length} gallery images and OG metadata assets`);
