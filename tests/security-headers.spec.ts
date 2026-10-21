import { expect, test } from "@playwright/test";

const securityHeaders: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), browsing-topics=()",
  "cross-origin-opener-policy": "same-origin",
  "x-frame-options": "DENY",
};

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

test("production routes include the security headers and omit X-Powered-By", async ({ page }) => {
  for (const route of ["/", "/work/velo", "/x18-security-not-found"]) {
    const response = await page.goto(route);
    expect(response, `${route} response`).not.toBeNull();
    const headers = response!.headers();

    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(headers[name], `${route} ${name}`).toBe(value);
    }

    const csp = headers["content-security-policy"];
    expect(csp, `${route} CSP`).toBeTruthy();
    for (const directive of cspDirectives) {
      expect(csp, `${route} CSP directive ${directive}`).toContain(directive);
    }
    expect(headers).not.toHaveProperty("x-powered-by");
  }
});

test("the homepage, work routes, and Beyond hydrate without CSP console violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /content security policy|violates the following.*directive/i.test(message.text())
    ) {
      violations.push(message.text());
    }
  });

  for (const route of [
    "/",
    "/work/velo",
    "/work/portfolio-platform",
    "/beyond-terminal",
  ]) {
    await page.goto(route);
    await expect(page.locator("html"), `${route} hydration`).toHaveAttribute(
      "data-hydrated",
      "1"
    );
  }

  expect(violations).toEqual([]);
});
