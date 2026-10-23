import { expect, test, type Page } from "@playwright/test";

test.use({ timezoneId: "Asia/Kolkata" });

const phaseCases = [
  { time: "03:00", phase: "night" },
  { time: "06:00", phase: "dawn" },
  { time: "12:00", phase: "day" },
  { time: "17:00", phase: "golden" },
  { time: "18:45", phase: "sunset" },
  { time: "20:00", phase: "dusk" },
] as const;

async function expectPhaseIcon(page: Page, phase: string) {
  const expected = new RegExp(`^/icons/sky-${phase}\\.[a-f0-9]{8}\\.svg$`);
  const icons = page.locator('head link[rel="icon"][type="image/svg+xml"]');

  await expect
    .poll(async () => {
      const hrefs = await icons.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href"))
      );
      return hrefs.length > 0 && hrefs.every((href) => expected.test(href ?? ""));
    })
    .toBe(true);

  return icons.first().getAttribute("href");
}

for (const { time, phase } of phaseCases) {
  test(`uses the ${phase} icon at local time ${time}`, async ({ page, request }) => {
    await page.clock.setFixedTime(
      new Date(`2026-06-15T${time}:00+05:30`)
    );
    await page.goto("/", { waitUntil: "load" });

    const href = await expectPhaseIcon(page, phase);
    expect(href).not.toBeNull();
    const response = await request.get(href!);
    expect(response.status(), href!).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
  });
}

test("the scheduled check changes day to golden after crossing 16:00", async ({
  page,
}) => {
  await page.clock.install({
    time: new Date("2026-06-15T15:59:00+05:30"),
  });
  await page.addInitScript(() => {
    const originalSetInterval = window.setInterval;
    Object.defineProperty(window, "setInterval", {
      configurable: true,
      value: function (
        handler: TimerHandler,
        timeout?: number,
        ...args: unknown[]
      ) {
        if (timeout === 300_000 && typeof handler === "function") {
          const testWindow = window as Window & {
            __skyPhaseCheck?: () => void;
          };
          testWindow.__skyPhaseCheck = handler as () => void;
        }
        return Reflect.apply(originalSetInterval, window, [handler, timeout, ...args]) as number;
      },
    });
  });
  await page.goto("/", { waitUntil: "load" });

  await expectPhaseIcon(page, "day");

  await page.clock.setSystemTime(new Date("2026-06-15T16:01:00+05:30"));
  const intervalWasCaptured = await page.evaluate(() => {
    const testWindow = window as Window & { __skyPhaseCheck?: () => void };
    if (!testWindow.__skyPhaseCheck) return false;
    testWindow.__skyPhaseCheck();
    return true;
  });
  expect(intervalWasCaptured).toBe(true);
  await expectPhaseIcon(page, "golden");
});
