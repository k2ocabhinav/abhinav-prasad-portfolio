import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const HERO = "[data-hero]";
const HERO_TEXT = "[data-hero-text]";
const WORDMARK = "[data-hero-wordmark]";
const LAYER = "[data-hero-layer]";
const RAIL = '[data-site-chrome="navigation-rail"]';

const WIDTHS = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
] as const;

interface LcpRecord {
  startTime: number;
  size: number;
  tag: string | null;
  text: string | null;
  selector: string | null;
  insideHero: boolean;
  insideWordmark: boolean;
  isWordmarkText: boolean;
}

async function settleFrame(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

async function openHero(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await settleFrame(page);
}

async function requireHeroLayers(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "load" });
  const layerCount = await page.locator(LAYER).count();
  test.skip(
    layerCount === 0,
    "No [data-hero-layer] elements on this hero yet; the harness has nothing to verify."
  );
}

async function pixelDiffRatio(page: Page, first: Buffer, second: Buffer) {
  return page.evaluate(
    async ({ a, b }) => {
      const decode = (base64: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Could not decode screenshot"));
          image.src = `data:image/png;base64,${base64}`;
        });

      const [left, right] = await Promise.all([decode(a), decode(b)]);
      if (left.width !== right.width || left.height !== right.height) {
        return 1;
      }

      const canvasA = document.createElement("canvas");
      canvasA.width = left.width;
      canvasA.height = left.height;
      const canvasB = document.createElement("canvas");
      canvasB.width = right.width;
      canvasB.height = right.height;
      const contextA = canvasA.getContext("2d", { willReadFrequently: true });
      const contextB = canvasB.getContext("2d", { willReadFrequently: true });
      if (!contextA || !contextB) {
        return 1;
      }

      contextA.drawImage(left, 0, 0);
      contextB.drawImage(right, 0, 0);
      const dataA = contextA.getImageData(0, 0, left.width, left.height).data;
      const dataB = contextB.getImageData(0, 0, right.width, right.height).data;

      let differing = 0;
      for (let index = 0; index < dataA.length; index += 4) {
        if (
          dataA[index] !== dataB[index] ||
          dataA[index + 1] !== dataB[index + 1] ||
          dataA[index + 2] !== dataB[index + 2]
        ) {
          differing += 1;
        }
      }

      return differing / (left.width * left.height);
    },
    { a: first.toString("base64"), b: second.toString("base64") }
  );
}

test.describe("hero harness", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "The harness drives explicit viewports and runs once."
    );
  });

  test("letterpress copies are hidden from assistive technology and ink stays still", async ({
    page,
  }) => {
    await openHero(page);

    const heading = page.locator(WORDMARK);
    const bite = heading.locator('[data-hero-print-layer="bite"]');
    const lift = heading.locator('[data-hero-print-layer="lift"]');
    const ink = heading.locator('[data-hero-print-layer="ink"]');

    await expect(bite).toHaveAttribute("aria-hidden", "true");
    await expect(lift).toHaveAttribute("aria-hidden", "true");
    await expect(ink).toHaveAttribute("aria-hidden", "true");
    await expect(ink).toHaveText("Abhinav");
    await expect(ink).toHaveCSS("transform", "none");
  });

  test("decorative layers never overlap the hero text, wordmark, or rail", async ({
    page,
  }) => {
    await requireHeroLayers(page);
    await openHero(page);

    for (const viewport of WIDTHS) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);

      const report = await page.evaluate(
        ({ heroSelector, layerSelector, textSelector, wordmarkSelector, railSelector }) => {
          type Box = {
            left: number;
            top: number;
            right: number;
            bottom: number;
            width: number;
            height: number;
          };

          const toBox = (element: Element): Box => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
            };
          };

          const isVisible = (element: Element) => {
            const checkable = element as Element & {
              checkVisibility?: (options?: {
                checkOpacity?: boolean;
                checkVisibilityCSS?: boolean;
              }) => boolean;
            };
            if (typeof checkable.checkVisibility === "function") {
              return checkable.checkVisibility({
                checkOpacity: true,
                checkVisibilityCSS: true,
              });
            }
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 0 &&
              rect.height > 0
            );
          };

          const labelFor = (element: Element) => {
            const tag = element.tagName.toLowerCase();
            const id = element.id ? `#${element.id}` : "";
            const layerName = element.getAttribute("data-hero-layer");
            const layer =
              layerName && layerName !== "true" ? `[${layerName}]` : "";
            const classes = (element.getAttribute("class") ?? "")
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((name) => `.${name}`)
              .join("");
            return `${tag}${id}${layer}${classes}`;
          };

          const hero = document.querySelector(heroSelector);
          const textRoot = document.querySelector(textSelector);
          if (!hero) {
            throw new Error("Missing [data-hero] on the page");
          }
          if (!textRoot) {
            throw new Error("Missing [data-hero-text] on the page");
          }

          const layers = Array.from(
            document.querySelectorAll(layerSelector)
          )
            .filter(isVisible)
            .map((element) => ({ label: labelFor(element), box: toBox(element) }));

          const textTargets = Array.from(
            textRoot.querySelectorAll("h1, h2, h3, h4, h5, h6, p, a")
          )
            .filter(isVisible)
            .map((element) => ({ label: labelFor(element), box: toBox(element) }));

          const wordmarks = Array.from(
            document.querySelectorAll(wordmarkSelector)
          )
            .filter(isVisible)
            .map((element) => ({
              label: `wordmark ${labelFor(element)}`,
              box: toBox(element),
            }));

          const railElement = document.querySelector(railSelector);
          const rails =
            railElement && isVisible(railElement)
              ? [{ label: `rail ${labelFor(railElement)}`, box: toBox(railElement) }]
              : [];

          const obstructionTargets = [...textTargets, ...wordmarks, ...rails];
          const offenders: Array<{
            layer: string;
            target: string;
            overlap: string;
          }> = [];

          for (const layer of layers) {
            for (const target of obstructionTargets) {
              const overlapWidth =
                Math.min(layer.box.right, target.box.right) -
                Math.max(layer.box.left, target.box.left);
              const overlapHeight =
                Math.min(layer.box.bottom, target.box.bottom) -
                Math.max(layer.box.top, target.box.top);
              if (overlapWidth > 1 && overlapHeight > 1) {
                offenders.push({
                  layer: layer.label,
                  target: target.label,
                  overlap: `${Math.round(overlapWidth)}×${Math.round(overlapHeight)}px`,
                });
              }
            }
          }

          return {
            layers: layers.length,
            textTargets: textTargets.length,
            offenders,
          };
        },
        {
          heroSelector: HERO,
          layerSelector: LAYER,
          textSelector: HERO_TEXT,
          wordmarkSelector: WORDMARK,
          railSelector: RAIL,
        }
      );

      if (report.layers === 0) {
        continue;
      }

      expect(
        report.textTargets,
        `${viewport.width}px: [data-hero-text] has no headings, paragraphs, or links`
      ).toBeGreaterThan(0);
      expect(
        report.offenders,
        `${viewport.width}px: layers overlap hero content (1px tolerance)`
      ).toEqual([]);
    }
  });

  test("the hero does not create horizontal overflow", async ({ page }) => {
    await requireHeroLayers(page);
    await openHero(page);

    for (const viewport of WIDTHS) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      const widths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));

      expect(
        widths.scrollWidth,
        `${viewport.width}px: document scrollWidth ${widths.scrollWidth} exceeds innerWidth ${widths.innerWidth}`
      ).toBeLessThanOrEqual(widths.innerWidth);
    }
  });

  test("hero images declare intrinsic size and are not over-fetched", async ({
    page,
  }) => {
    await requireHeroLayers(page);
    await openHero(page);

    await expect
      .poll(
        () =>
          page.evaluate((heroSelector) => {
            const hero = document.querySelector(heroSelector);
            if (!hero) {
              return false;
            }
            return Array.from(hero.querySelectorAll("img")).every(
              (image) => image.complete
            );
          }, HERO),
        { timeout: 8_000 }
      )
      .toBe(true);

    for (const viewport of WIDTHS) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      const report = await page.evaluate((heroSelector) => {
        const hero = document.querySelector(heroSelector);
        if (!hero) {
          throw new Error("Missing [data-hero] on the page");
        }

        return Array.from(hero.querySelectorAll("img")).map((image) => ({
          src: image.currentSrc || image.src,
          hasWidth: image.hasAttribute("width"),
          hasHeight: image.hasAttribute("height"),
          widthAttribute: Number(image.getAttribute("width") ?? 0),
          heightAttribute: Number(image.getAttribute("height") ?? 0),
          naturalWidth: image.naturalWidth,
          renderedWidth: image.getBoundingClientRect().width,
        }));
      }, HERO);

      const failures: string[] = [];
      for (const image of report) {
        if (!image.hasWidth || !image.hasHeight) {
          failures.push(`${image.src}: missing width/height attributes`);
        }
        if (image.widthAttribute <= 0 || image.heightAttribute <= 0) {
          failures.push(`${image.src}: non-positive width/height attribute`);
        }
        if (image.naturalWidth <= 0) {
          failures.push(`${image.src}: not loaded (naturalWidth 0)`);
        } else if (
          image.renderedWidth >= 1 &&
          image.naturalWidth > image.renderedWidth * 2.2
        ) {
          failures.push(
            `${image.src}: naturalWidth ${image.naturalWidth} > 2.2 × rendered ${image.renderedWidth.toFixed(1)}`
          );
        }
      }

      expect(
        failures,
        `${viewport.width}px: hero image sizing (DPR 1)`
      ).toEqual([]);
    }
  });

  test("reduced motion renders a static hero", async ({ page }) => {
    await requireHeroLayers(page);

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);

      const hero = page.locator(HERO).first();
      await expect(hero).toBeVisible();

      const staticState = await hero.locator("[data-hero-sheet]").evaluate((sheet) => {
        const style = getComputedStyle(sheet);
        return {
          depth: style.getPropertyValue("--d").trim(),
          transform: style.transform,
          shade: style.getPropertyValue("--shade").trim(),
          glint: getComputedStyle(sheet.querySelector("[data-ink-glint]")!).display,
        };
      });
      expect(staticState.depth).toBe("1");
      expect(staticState.transform).toBe("none");
      expect(staticState.shade).toBe("0");
      expect(staticState.glint).toBe("none");

      const first = await hero.screenshot({ caret: "hide" });
      await page.waitForTimeout(600);
      const second = await hero.screenshot({ caret: "hide" });
      const ratio = await pixelDiffRatio(page, first, second);

      expect(
        ratio,
        `${viewport.width}px: hero changed between frames at rest under reduced motion`
      ).toBeLessThanOrEqual(0.001);
    }
  });

  test("the wordmark is the largest contentful paint at 1440", async ({ page }) => {
    await page.addInitScript(() => {
      const store: LcpRecord[] = [];
      (window as unknown as { __heroLcp: LcpRecord[] }).__heroLcp = store;

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const paint = entry as PerformanceEntry & {
              element?: Element | null;
              size?: number;
            };
            const element = paint.element ?? null;
            const wordmark = document.querySelector("[data-hero-wordmark]");
            store.push({
              startTime: paint.startTime,
              size: paint.size ?? 0,
              tag: element ? element.tagName.toLowerCase() : null,
              text: element
                ? (element.textContent ?? "").trim().slice(0, 100)
                : null,
              selector: element
                ? `${element.tagName.toLowerCase()}${
                    element.id ? `#${element.id}` : ""
                  }`
                : null,
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
        // Browser without LCP support: the assertion below reports it.
      }
    });

    await requireHeroLayers(page);

    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              (window as unknown as { __heroLcp: LcpRecord[] }).__heroLcp
                .length
          ),
        { timeout: 8_000 }
      )
      .toBeGreaterThan(0);

    await page.waitForTimeout(500);

    const lcp = await page.evaluate(() => {
      const entries = (window as unknown as { __heroLcp: LcpRecord[] })
        .__heroLcp;
      return entries.length > 0 ? entries[entries.length - 1] : null;
    });

    expect(lcp, "No largest-contentful-paint entry was recorded").not.toBeNull();
    const entry = lcp as LcpRecord;
    const description = `<${entry.tag ?? "unknown"}> “${(entry.text ?? "").slice(
      0,
      60
    )}”`;

    expect(
      entry.insideWordmark || entry.isWordmarkText,
      `LCP was ${description}${entry.selector ? ` at ${entry.selector}` : ""}, not the hero wordmark`
    ).toBe(true);
    expect(entry.startTime).toBeGreaterThan(0);
  });

  test("the shared light reverses its shadow direction across the sheet", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openHero(page);
    const sheet = page.locator("[data-hero-sheet]");

    await page.mouse.move(8, 450);
    await expect
      .poll(() => sheet.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--sx"))))
      .toBeGreaterThan(0.2);

    await page.mouse.move(1432, 450);
    await expect
      .poll(() => sheet.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--sx"))))
      .toBeLessThan(0);
  });

  test("the final v portal opens Beyond", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-animated-name="hero-trigger"]').click();
    await expect(page).toHaveURL(/\/beyond-terminal$/);
    await expect(page.locator("#beyond-hero-title")).toBeVisible();
  });
});
