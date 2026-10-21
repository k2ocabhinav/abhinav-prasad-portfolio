import { expect, test } from "@playwright/test";

test("contact hides an unset WhatsApp link and keeps the configured link valid", async ({ page }) => {
  await page.goto("/");

  const whatsapp = page.getByRole("link", {
    name: "Message Abhinav on WhatsApp (opens in a new tab)",
  });
  const whatsappHref = await whatsapp.getAttribute("href");
  if (whatsappHref) {
    expect(whatsappHref).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=/);
    expect(new URL(whatsappHref).pathname).toMatch(/^\/\d{10,15}$/);
    expect(new URL(whatsappHref).searchParams.get("text")).toBe(
      "Hi Abhinav, I found your portfolio and would like to talk."
    );
    await expect(whatsapp).toHaveAttribute("target", "_blank");
    await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
  } else {
    await expect(whatsapp).toHaveCount(0);
  }

  const email = page.locator('[data-contact-email="true"]');
  await expect(email).toHaveAttribute("href", "mailto:abhinavp0304@gmail.com");
  await page.context().grantPermissions(
    ["clipboard-read", "clipboard-write"],
    { origin: new URL(page.url()).origin }
  );
  const copyButton = page.locator('[data-copy-email="true"]');
  await copyButton.click();
  await expect(copyButton).toHaveText("Copied");
  await expect(copyButton).toHaveAttribute("aria-live", "polite");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "abhinavp0304@gmail.com"
  );
  await expect(copyButton).toHaveText("Copy", { timeout: 3000 });
});

test("contact buttons fit their labels from 320px through 1920px", async ({ page }) => {
  await page.goto("/");
  const buttons = page.locator('[data-contact-actions] a');
  await expect(buttons).toHaveCount(2 + await page.getByRole("link", {
    name: "Message Abhinav on WhatsApp (opens in a new tab)",
  }).count());

  for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const measurements = await buttons.evaluateAll((nodes) =>
      nodes.map((node) => {
        const anchor = node as HTMLAnchorElement;
        const styles = getComputedStyle(anchor);
        return {
          label: anchor.getAttribute("aria-label") ?? anchor.textContent?.trim() ?? "contact action",
          scrollWidth: anchor.scrollWidth,
          clientWidth: anchor.clientWidth,
          horizontalPadding: Number.parseFloat(styles.paddingLeft),
          iconGap: Number.parseFloat(styles.columnGap),
        };
      })
    );

    for (const button of measurements) {
      expect(button.scrollWidth, `${button.label} overflows at ${width}px`).toBeLessThanOrEqual(
        button.clientWidth
      );
      expect(button.horizontalPadding, `${button.label} has too little padding at ${width}px`).toBeGreaterThanOrEqual(14);
      expect(button.iconGap, `${button.label} has too little icon spacing at ${width}px`).toBeGreaterThanOrEqual(8);
    }
  }

  await expect(page.locator("#contact").getByRole("link", {
    name: "Abhinav Prasad on LinkedIn (opens in a new tab)",
  })).toBeVisible();
});

test("contact email and copy control stay within the card across viewport widths", async ({ page }) => {
  await page.goto("/");

  const contact = page.locator("#contact");
  const email = contact.locator('[data-contact-email="true"]');

  for (const width of [320, 390, 768, 1024, 1100, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await email.scrollIntoViewIfNeeded();

    const geometry = await page.evaluate(() => {
      const emailElement = document.querySelector<HTMLElement>("[data-contact-email='true']");
      const copyElement = document.querySelector<HTMLElement>("[data-copy-email='true']");
      const contentElement = document.querySelector<HTMLElement>("#contact .spec-sheet > div");
      if (!emailElement || !copyElement || !contentElement) {
        throw new Error("Contact email, copy control, or card content is missing");
      }

      const emailRect = emailElement.getBoundingClientRect();
      const copyRect = copyElement.getBoundingClientRect();
      const emailRow = emailElement.parentElement;
      if (!emailRow) throw new Error("Contact email row is missing");
      const emailRowRect = emailRow.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();
      const contentStyles = getComputedStyle(contentElement);
      const contentLeft = contentRect.left
        + Number.parseFloat(contentStyles.borderLeftWidth)
        + Number.parseFloat(contentStyles.paddingLeft);
      const contentRight = contentRect.right
        - Number.parseFloat(contentStyles.borderRightWidth)
        - Number.parseFloat(contentStyles.paddingRight);
      const range = document.createRange();
      range.selectNodeContents(emailElement);

      return {
        emailLeft: emailRect.left,
        emailRight: emailRect.right,
        emailBottom: emailRect.bottom,
        emailLineCount: range.getClientRects().length,
        copyLeft: copyRect.left,
        copyRight: copyRect.right,
        copyTop: copyRect.top,
        copyWidth: copyRect.width,
        emailRowWidth: emailRowRect.width,
        emailRowGap: Number.parseFloat(getComputedStyle(emailRow).columnGap),
        contentLeft,
        contentRight,
      };
    });

    expect(geometry.emailLineCount, `email lines at ${width}px`).toBe(1);
    expect(geometry.emailLeft, `email left edge at ${width}px`)
      .toBeGreaterThanOrEqual(geometry.contentLeft - 1);
    expect(geometry.emailRight, `email right edge at ${width}px`)
      .toBeLessThanOrEqual(geometry.contentRight + 1);
    expect(geometry.copyLeft, `copy left edge at ${width}px`)
      .toBeGreaterThanOrEqual(geometry.contentLeft - 1);
    expect(geometry.copyRight, `copy right edge at ${width}px`)
      .toBeLessThanOrEqual(geometry.contentRight + 1);

    const emailWidth = geometry.emailRight - geometry.emailLeft;
    const hasRoomBesideEmail = emailWidth + geometry.copyWidth + geometry.emailRowGap
      <= geometry.emailRowWidth + 1;
    if (hasRoomBesideEmail) {
      expect(geometry.copyTop, `copy placement at ${width}px`).toBeLessThan(geometry.emailBottom);
      expect(geometry.copyLeft, `copy follows email at ${width}px`)
        .toBeGreaterThanOrEqual(geometry.emailRight);
    } else {
      const placement = JSON.stringify(geometry);
      expect(Math.abs(geometry.copyLeft - geometry.emailLeft), `copy alignment at ${width}px: ${placement}`)
        .toBeLessThanOrEqual(1);
      expect(geometry.copyTop, `copy wraps below email at ${width}px: ${placement}`)
        .toBeGreaterThanOrEqual(geometry.emailBottom);
    }
  }
});

test("email copy selects the address when the clipboard API is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/");
  await page.locator('[data-copy-email="true"]').click();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe(
    "abhinavp0304@gmail.com"
  );
});

test("contact time hydrates from a stable Mumbai placeholder without a hydration warning", async ({ page, request, browser }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const serverPage = await browser.newPage({ javaScriptEnabled: false });
  await serverPage.goto(response.url());
  await expect(serverPage.locator("#contact [data-local-time]")).toHaveText("(IST)");
  await expect(serverPage.locator("#contact")).toContainText("Mumbai, India (IST)");
  await serverPage.close();

  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration/i.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydration/i.test(error.message)) hydrationErrors.push(error.message);
  });
  await page.goto(response.url());
  await expect(page.locator("[data-local-time]")).toHaveText(
    /It's \d{1,2}:\d{2} (am|pm) in Mumbai/
  );
  expect(hydrationErrors).toEqual([]);
});

test("each case study links to the next published case in content order", async ({ page }) => {
  await page.goto("/work/velo");
  await expect(page.getByRole("link", { name: "Next case study: Portfolio publishing system" })).toHaveAttribute(
    "href",
    "/work/portfolio-platform"
  );

  await page.goto("/work/portfolio-platform");
  await expect(page.getByRole("link", { name: "Next case study: Velo" })).toHaveAttribute(
    "href",
    "/work/velo"
  );
});

test("the custom not-found page returns 404 and remains noindex", async ({ page }) => {
  const response = await page.goto("/x15-not-found");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Selected work" })).toHaveAttribute("href", "/#work");
  const robots = page.locator('meta[name="robots"]');
  expect(await robots.count()).toBeGreaterThan(0);
  const directives = await robots.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("content") ?? "")
  );
  expect(directives.every((content) => /noindex/i.test(content))).toBe(true);
  expect(directives.some((content) => /noindex/i.test(content) && /nofollow/i.test(content))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("footer back-to-top is a native anchor with an existing page target", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const backToTop = page.getByRole("link", { name: "Back to top", exact: true });
  await expect(backToTop).toHaveAttribute("href", "#hero");
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 7000 }).toBeLessThan(2);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 }).toBeLessThan(2);
});

test("case-study JSON-LD contains a linked home-to-project breadcrumb", async ({ page }) => {
  for (const [slug, title] of [
    ["velo", "Velo, a white-label dispatch prototype"],
    ["portfolio-platform", "Portfolio publishing system"],
  ]) {
    await page.goto(`/work/${slug}`);
    const jsonLd = await page.locator("#project-structured-data").textContent();
    expect(jsonLd).not.toBeNull();
    const graph = JSON.parse(jsonLd!) as { "@graph": Array<Record<string, unknown>> };
    const pageNode = graph["@graph"].find((node) => node["@type"] === "WebPage");
    const breadcrumb = graph["@graph"].find((node) => node["@type"] === "BreadcrumbList");
    expect(pageNode?.breadcrumb).toEqual({ "@id": breadcrumb?.["@id"] });
    expect(breadcrumb?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "http://localhost:3000/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `http://localhost:3000/work/${slug}`,
      },
    ]);
    expect(jsonLd).not.toContain("wa.me");
  }
});

test("llms.txt follows the linked-section format and includes generated Markdown case studies", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBeTruthy();
  const content = await response.text();
  expect(content.startsWith("# Abhinav Prasad\n\n> ")).toBeTruthy();
  expect(content).toContain("At work: Database Engineer, Ostrum Tech Limited.");
  expect(content).toContain("[Velo, a white-label dispatch prototype as Markdown](http://localhost:3000/work/velo.md)");
  expect(content).toContain("[Interactive engineering portfolio and content platform as Markdown](http://localhost:3000/work/portfolio-platform.md)");
  expect(content).not.toContain("wa.me");

  const sections = content.split(/^## /m).slice(1);
  expect(sections.length).toBeGreaterThan(0);
  for (const section of sections) {
    const lines = section.split("\n").slice(1).filter((line) => line.trim());
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((line) => /^- \[[^\]]+\]\([^)]+\)(?:: .+)?$/.test(line))).toBeTruthy();
  }

  const veloResponse = await request.get("/work/velo.md");
  expect(veloResponse.ok()).toBeTruthy();
  expect(veloResponse.headers()["content-type"]).toContain("text/markdown");
  const veloMarkdown = await veloResponse.text();
  expect(veloMarkdown).toContain("Three workspaces, one dispatch flow.");
  expect(veloMarkdown).toContain("Driver matching and fare calculations use configurable strategies.");
  expect(veloMarkdown).not.toContain("wa.me");

  const platformResponse = await request.get("/work/portfolio-platform.md");
  expect(platformResponse.ok()).toBeTruthy();
  expect(await platformResponse.text()).toContain("A typed publishing system feeds the homepage and reusable project case studies.");
});

test("case 02 caption moves below its screenshot only from 900 through 1100 px", async ({ page }) => {
  for (const [width, expectedPosition] of [
    [899, "absolute"],
    [900, "static"],
    [1024, "static"],
    [1100, "static"],
    [1101, "absolute"],
  ] as const) {
    await page.setViewportSize({ width, height: 768 });
    await page.goto("/");
    const platformCard = page.locator('[data-work-card="true"]').nth(1);
    const caption = platformCard.locator("[data-media-caption]");
    await expect(caption).toBeVisible();
    expect(await caption.evaluate((element) => getComputedStyle(element).position)).toBe(expectedPosition);

    if (expectedPosition === "static") {
      const frame = await platformCard.locator("[data-work-frame]").boundingBox();
      const captionBox = await caption.boundingBox();
      expect(frame).not.toBeNull();
      expect(captionBox).not.toBeNull();
      expect(captionBox!.y).toBeGreaterThanOrEqual(frame!.y + frame!.height);
    }
  }
});
