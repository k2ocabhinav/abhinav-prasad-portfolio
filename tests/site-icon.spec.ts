import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Asia/Kolkata" });

// SHA-256 of the Next scaffold favicon (the Vercel triangle) that this
// pipeline replaced. The generated icon must never regress to it.
const SCAFFOLD_FAVICON_SHA256 =
  "2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

test("icons and manifest are linked, served, and pass CSP", async ({
  page,
  request,
}) => {
  await page.clock.setFixedTime(new Date("2026-06-15T12:00:00+05:30"));

  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const response = await page.goto("/", { waitUntil: "load" });
  expect(response?.status()).toBe(200);

  const links = await page.locator("head link[rel]").evaluateAll((nodes) =>
    nodes.map((node) => ({
      rel: node.getAttribute("rel") ?? "",
      href: node.getAttribute("href") ?? "",
      type: node.getAttribute("type") ?? "",
    }))
  );

  const iconLinks = links.filter((link) => link.rel.split(/\s+/).includes("icon"));
  const svgIcons = iconLinks.filter((link) => link.type === "image/svg+xml");
  const svgIcon = svgIcons[0];
  const appleIcon = links.find((link) => link.rel === "apple-touch-icon");
  const manifestLink = links.find((link) => link.rel === "manifest");

  expect(svgIcon, "link[rel=icon] for the svg master").toBeDefined();
  expect(svgIcons.length).toBeGreaterThan(0);
  expect(svgIcons.every((link) => /^\/icons\/sky-day\.[a-f0-9]{8}\.svg$/.test(link.href))).toBe(true);
  expect(appleIcon, "link[rel=apple-touch-icon]").toBeDefined();
  expect(manifestLink?.href).toBe("/manifest.webmanifest");
  expect(svgIcon?.type).toBe("image/svg+xml");
  expect(svgIcon?.href).toMatch(/^\/icons\/sky-day\.[a-f0-9]{8}\.svg$/);
  expect(iconLinks.length).toBeGreaterThan(0);
  expect(iconLinks.every((link) => link.type === "image/svg+xml" && link.href === svgIcon?.href)).toBe(true);
  expect(appleIcon?.type).toBe("image/png");

  const csp = response?.headers()["content-security-policy"];
  expect(csp).toBeDefined();
  if (csp) {
    expect(csp).toContain("img-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
  }

  // Load the two image icons through the document so img-src applies: a CSP
  // block surfaces as an onerror and a console violation.
  const imageLoads = await page.evaluate(
    async (hrefs) =>
      Promise.all(
        hrefs.map(
          (href) =>
            new Promise<boolean>((resolve) => {
              const image = new Image();
              image.onload = () => resolve(true);
              image.onerror = () => resolve(false);
              image.src = href;
            })
        )
      ),
    [svgIcon!.href, appleIcon!.href]
  );
  expect(imageLoads).toEqual([true, true]);

  for (const href of [svgIcon!.href, "/favicon.ico", appleIcon!.href]) {
    const asset = await request.get(href);
    expect(asset.status(), href).toBe(200);
    const contentType = asset.headers()["content-type"] ?? "";
    if (href === "/favicon.ico") {
      expect(contentType, href).toMatch(/^image\/(x-icon|vnd\.microsoft\.icon)$/);
    } else if (href.startsWith("/icons/sky-")) {
      expect(contentType, href).toContain("image/svg+xml");
      expect(asset.headers()["cache-control"], href).toContain("immutable");
    } else {
      expect(contentType, href).toContain("image/png");
    }
  }

  const staticHtmlResponse = await request.get("/");
  const staticHtml = await staticHtmlResponse.text();
  expect(staticHtml).toMatch(/href="\/favicon\.ico\?favicon\.[a-zA-Z0-9_-]+\.ico"[^>]*type="image\/x-icon"/);
  expect(staticHtml).toMatch(/href="\/icon\.svg\?icon\.[a-zA-Z0-9_-]+\.svg"[^>]*type="image\/svg\+xml"/);

  const ico = await request.get("/favicon.ico");
  const icoBytes = await ico.body();
  expect(icoBytes.subarray(0, 6)).toEqual(
    Buffer.from([0, 0, 1, 0, 3, 0])
  );
  expect([icoBytes.readUInt8(6), icoBytes.readUInt8(22), icoBytes.readUInt8(38)]).toEqual([
    16, 32, 48,
  ]);
  for (const offset of [6, 22, 38]) {
    const payloadSize = icoBytes.subarray(offset + 8, offset + 12).readUInt32LE(0);
    const payloadStart = icoBytes.subarray(offset + 12, offset + 16).readUInt32LE(0);
    expect(payloadStart + payloadSize).toBeLessThanOrEqual(icoBytes.length);
    expect(icoBytes.subarray(payloadStart, payloadStart + 8)).toEqual(PNG_SIGNATURE);
  }

  const icoHash = createHash("sha256").update(icoBytes).digest("hex");
  expect(icoHash, "the scaffold Vercel favicon is gone").not.toBe(
    SCAFFOLD_FAVICON_SHA256
  );

  const manifestResponse = await request.get(manifestLink!.href);
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain(
    "application/manifest+json"
  );

  const manifest = (await manifestResponse.json()) as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    background_color: string;
    theme_color: string;
    icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
  };
  expect(manifest.name).toBe("Abhinav Prasad");
  expect(manifest.short_name).toBe("Abhinav");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("browser");
  expect(manifest.background_color).toBe("#FCF8F2");
  expect(manifest.theme_color).toBe("#FCF8F2");

  expect([...new Set(manifest.icons.map((icon) => icon.src))].sort()).toEqual([
    "/icon-192.png",
    "/icon-512.png",
  ]);
  // Full-bleed scene art would lose its sun to a maskable crop.
  expect(manifest.icons.every((icon) => icon.purpose === "any")).toBe(true);
  for (const icon of manifest.icons) {
    expect(icon.type).toBe("image/png");
    const asset = await request.get(icon.src);
    expect(asset.status(), icon.src).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/png");
  }

  expect(
    consoleErrors.filter((message) => /content security policy/i.test(message))
  ).toEqual([]);
});
