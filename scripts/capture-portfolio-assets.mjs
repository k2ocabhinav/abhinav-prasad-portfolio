import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const baseUrl = process.env.PORTFOLIO_CAPTURE_URL ?? "http://127.0.0.1:3000";
const projectOutput = path.join(root, "public/projects/portfolio-platform");
const publicOgOutput = path.join(root, "public/og-image.jpg");
const appOgOutput = path.join(root, "src/app/opengraph-image.jpg");

const captures = [
  { file: "01-hero-wordmark.png", route: "/", target: "#hero" },
  { file: "02-about-philosophy.png", route: "/", target: "#about" },
  { file: "03-works-case-study.png", route: "/", target: "#work" },
  { file: "04-stack-riso.png", route: "/", target: "#stack" },
  { file: "05-contact-espresso.png", route: "/", target: "#contact" },
  { file: "06-velo-case-study.png", route: "/work/velo" },
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

  await page.screenshot({
    path: path.join(projectOutput, capture.file),
    animations: "disabled",
    scale: "css",
  });
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
