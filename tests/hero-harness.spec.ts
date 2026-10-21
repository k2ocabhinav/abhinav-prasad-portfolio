import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const HERO = "[data-hero]";
const HERO_TEXT = "[data-hero-text]";
const WORDMARK = "[data-hero-wordmark]";
const LAYER = "[data-hero-layer]";
const RAIL = '[data-site-chrome="navigation-rail"]';

const WIDTHS = [
  { width: 1920, height: 1080 },
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

  test("the cue follows the wordmark and the hero rows share one measure", async ({
    page,
  }) => {
    await openHero(page);

    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1440, height: 900 },
      { width: 1440, height: 700 },
      { width: 1200, height: 900 },
      { width: 1280, height: 800 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 568 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const layout = await page.evaluate(() => {
        const hero = document.querySelector("[data-hero]");
        const content = hero?.querySelector<HTMLElement>("[data-hero-content]");
        const text = hero?.querySelector<HTMLElement>("[data-hero-text]");
        const wordmark = hero?.querySelector<HTMLElement>("[data-hero-wordmark]");
        const cue = hero?.querySelector<HTMLAnchorElement>("[data-hero-scroll-cue]");
        const facts = hero?.querySelector<HTMLElement>("[data-hero-facts]");
        const cta = hero?.querySelector<HTMLElement>("[data-hero-ctas]");
        if (!content || !text || !wordmark || !cue || !facts || !cta) {
          throw new Error("The hero layout is incomplete");
        }

        const rect = (element: Element) => {
          const box = element.getBoundingClientRect();
          return {
            left: box.left,
            top: box.top,
            right: box.right,
            bottom: box.bottom,
            width: box.width,
          };
        };
        const visualWordmark = wordmark.firstElementChild;
        const hLetter = wordmark.querySelector<HTMLElement>(
          '[data-hero-print-layer="ink"] > span:nth-child(3)'
        );
        const vLetter = wordmark.querySelector<HTMLElement>(
          '[data-hero-print-layer="ink"] > span:nth-child(7)'
        );
        const vRange = document.createRange();
        if (vLetter) vRange.selectNodeContents(vLetter);
        const range = document.createRange();
        range.selectNodeContents(cue.firstElementChild ?? cue);
        const cueText = range.getBoundingClientRect();
        const onMyOwnValue = facts.querySelector<HTMLElement>(
          "a:nth-child(2) span:last-child"
        );
        const valueRange = document.createRange();
        if (onMyOwnValue) valueRange.selectNodeContents(onMyOwnValue);
        const rail = document.querySelector<HTMLElement>(
          '[data-site-chrome="navigation-rail"]'
        );
        const linkedinLabel = rail?.querySelector<HTMLElement>(
          'a[target="_blank"] span'
        ) ?? null;
        const railRange = document.createRange();
        if (linkedinLabel) railRange.selectNodeContents(linkedinLabel);
        const railText = railRange.getBoundingClientRect();
        const menu = document.querySelector<HTMLButtonElement>(
          'button[aria-label="Open menu"]'
        );

        return {
          content: rect(content),
          text: rect(text),
          facts: rect(facts),
          cta: rect(cta),
          wordmark: rect(wordmark),
          visualWordmark: visualWordmark ? rect(visualWordmark) : null,
          hInkTop: hLetter?.getBoundingClientRect().top ?? 0,
          hRight: hLetter?.getBoundingClientRect().right ?? null,
          vInkRight: vRange.getBoundingClientRect().right,
          cue: rect(cue),
          cueTextX: cueText.left,
          cueTextY: cueText.top,
          valueLines: onMyOwnValue ? valueRange.getClientRects().length : 0,
          railTextLeft: linkedinLabel ? railText.left : Number.POSITIVE_INFINITY,
          menu: menu ? rect(menu) : null,
          textLines: ["[data-hero-identity=\"true\"]", ".value"].map((selector) => {
            const paragraph = hero?.querySelector<HTMLElement>(selector);
            if (!paragraph) return [];
            const textRange = document.createRange();
            textRange.selectNodeContents(paragraph);
            return Array.from(textRange.getClientRects()).map((box) => ({
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom,
            }));
          }),
          wordmarkBeforeCue: Boolean(
            wordmark.compareDocumentPosition(cue) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
        };
      });

      expect(layout.wordmarkBeforeCue, `${viewport.width}px: cue order`).toBe(true);
      expect(
        layout.cue.top - layout.wordmark.bottom,
        `${viewport.width}px: wordmark to cue gap`
      ).toBeGreaterThanOrEqual(18);
      expect(
        layout.cue.top - layout.wordmark.bottom,
        `${viewport.width}px: wordmark to cue gap`
      ).toBeLessThanOrEqual(28);
      expect(
        layout.cueTextY - layout.wordmark.bottom,
        `${viewport.width}px: wordmark to visible cue gap`
      ).toBeGreaterThanOrEqual(18);
      expect(
        layout.cueTextY - layout.wordmark.bottom,
        `${viewport.width}px: wordmark to visible cue gap`
      ).toBeLessThanOrEqual(28);
      expect(
        Math.abs(layout.cueTextX - (layout.visualWordmark?.left ?? 0)),
        `${viewport.width}px: cue left edge`
      ).toBeLessThanOrEqual(2);

      if (viewport.width >= 1200) {
        const expectedCtaGap = Math.min(80, Math.max(48, viewport.height * 0.07));
        expect(
          layout.hInkTop - layout.cta.bottom,
          `${viewport.width}x${viewport.height}: CTA to wordmark ascenders`
        ).toBeGreaterThanOrEqual(48);
        expect(
          layout.hInkTop - layout.cta.bottom,
          `${viewport.width}x${viewport.height}: CTA to wordmark ascenders`
        ).toBeLessThanOrEqual(expectedCtaGap + 1);
        expect(
          Math.abs(layout.facts.right - (layout.hRight ?? layout.facts.right)),
          `${viewport.width}px: facts edge aligns to the h`
        ).toBeLessThanOrEqual(2);
        if (viewport.height >= 800) {
          expect(
            layout.valueLines,
            `${viewport.width}x${viewport.height}: On my own facts stay on one line`
          ).toBe(1);
        }
        expect(
          layout.railTextLeft - layout.vInkRight,
          `${viewport.width}px: wordmark clears the navigation rail`
        ).toBeGreaterThanOrEqual(40);
      }

      if (viewport.width === 1440 && viewport.height === 900) {
        const topSpace = layout.text.top - layout.content.top;
        const bottomSpace = layout.content.bottom - layout.cue.bottom;
        expect(
          Math.abs(topSpace - bottomSpace),
          "1440x900: top and bottom paper balance"
        ).toBeLessThanOrEqual(24);
      }

      if (viewport.width === 768 || viewport.width === 390 || viewport.width === 320) {
        const fill = (layout.visualWordmark?.width ?? 0) / layout.content.width;
        expect(fill, `${viewport.width}px: wordmark fills the content measure`).toBeGreaterThanOrEqual(
          viewport.width === 768 ? 0.98 : 0.97
        );
        expect(fill, `${viewport.width}px: wordmark fits the content measure`).toBeLessThanOrEqual(
          1.03
        );
      }

      if (viewport.width <= 390 && layout.menu) {
        const collisions = layout.textLines.flat().filter(
          (line) =>
            line.top < layout.menu!.bottom &&
            line.bottom > layout.menu!.top &&
            line.right > layout.menu!.left - 1
        );
        expect(collisions, `${viewport.width}px: text clears the menu`).toEqual([]);
      }

      if (viewport.width === 390 || viewport.width === 320) {
        const aboutLabel = page.locator("#about h2");
        await expect(aboutLabel, `${viewport.width}px: About label exists`).toHaveCount(1);
        const aboutLabelTop = await aboutLabel.evaluate(
          (element) => element.getBoundingClientRect().top
        );
        expect(
          aboutLabelTop - layout.cue.bottom,
          `${viewport.width}px: cue to first About content`
        ).toBeLessThanOrEqual(120);
      }
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
          glintCount: sheet.querySelectorAll("[data-ink-glint]").length,
        };
      });
      expect(staticState.depth).toBe("1");
      expect(staticState.transform).toBe("none");
      expect(staticState.shade).toBe("0");
      expect(staticState.glintCount).toBe(0);

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
