import { expect, test } from "@playwright/test";
import { buildRobots } from "../src/app/robots";

test("serves recruiter-readable content and structured data in the initial HTML", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();

  expect(html).toContain("Abhinav Prasad");
  expect(html).toContain("Full-stack engineer");
  expect(html).toContain("I build products end to end, from the first conversation to release.");
  expect(html).toContain("Database Engineer, Ostrum Tech Limited");
  expect(html).toContain("Started as an intern in May 2024; full-time Database Engineer since September 2024.");
  expect(html).toContain("Develop MySQL-backed business logic for API workflows");
  expect(html).toContain("Forward deployed builds: Velo, this site, AI‑agent workflows");
  expect(html).toContain("How I work");
  expect(html).not.toContain("Software Engineer Intern");
  expect(html).toContain("Selected projects");

  await page.goto("/");
  const homeOgImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const homeTwitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
  expect(new URL(homeOgImage!, page.url()).pathname).toBe("/og-image.jpg");
  expect(homeTwitterImage).toBe(homeOgImage);
  const jsonLd = await page
    .locator('#portfolio-structured-data[type="application/ld+json"]')
    .textContent();
  expect(jsonLd).not.toBeNull();

  const graph = JSON.parse(jsonLd!) as {
    "@graph": Array<Record<string, unknown>>;
  };
  const person = graph["@graph"].find((node) => node["@type"] === "Person");
  expect(person).toMatchObject({
    jobTitle: "Database Engineer",
    worksFor: { name: "Ostrum Tech Limited" },
    hasOccupation: { name: "Database Engineer" },
  });
  expect(person?.knowsAbout).toContain("AI-assisted engineering");
  expect(JSON.stringify(person)).not.toMatch(/Software Engineer(?: Intern)?/i);
  await expect(page.locator("#experience article")).not.toContainText(/Software Engineer/i);
  expect(person?.sameAs).toEqual([
    "https://github.com/k2ocabhinav",
    "https://www.linkedin.com/in/k2ocabhinav22",
  ]);
  expect(graph["@graph"].some((node) => node["@type"] === "WebSite")).toBeTruthy();
  expect(graph["@graph"].some((node) => node["@type"] === "ProfilePage")).toBeTruthy();
  expect(graph["@graph"].some((node) => node["@type"] === "SoftwareSourceCode")).toBeFalsy();
  expect(jsonLd).not.toContain("abhinav-monogram");
  expect(jsonLd).not.toMatch(/certification|education/i);

  const title = await page.title();
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(title).toBe("Abhinav Prasad | Full-stack engineer");
  expect(title.length).toBeLessThanOrEqual(60);
  expect(description).toBe("I build products end to end, from first conversation to release. At work: Database Engineer, Ostrum Tech Limited. On my own: Velo and AI-agent workflows.");
  expect(description).toMatch(/Database Engineer, Ostrum Tech Limited/);
  expect(description?.length ?? 0).toBeLessThanOrEqual(155);
  await expect(page.locator('meta[name="keywords"]')).toHaveAttribute("content", /Forward Deployed Engineer/);
});

test("keeps local and preview surfaces out of search indexes", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex,\s*nofollow/i
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^http:\/\/localhost:3000\/?$/
  );

  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toContain("User-Agent: *");
  expect(robots).toContain("Disallow: /");
  expect(robots).not.toContain("Sitemap:");
});

test("keeps each home section readable without JavaScript", async ({ page }) => {
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/");

  await expect(page.locator('[data-home-hero-heading="true"]')).toHaveAttribute("aria-label", "Abhinav");
  await expect(page.locator('[data-hero-identity="true"]')).toHaveText("Full-stack engineer");
  const stack = page.locator("[data-product-stack]");
  await expect(stack).toBeVisible();
  await expect(stack.locator("svg[role='img']")).toBeVisible();
  await expect(stack.getByRole("link")).toHaveCount(0);
  await expect(stack.locator("[data-stack-layer='backend']")).toBeVisible();

  const sections = page.locator("main section");
  const sectionCount = await sections.count();
  let checkedSections = 0;

  for (let index = 0; index < sectionCount; index += 1) {
    const section = sections.nth(index);
    const heading = section.locator("h1, h2, h3").first();
    if ((await heading.count()) === 0) continue;

    const paragraph = section.locator("p").first();
    await expect(paragraph).toBeAttached();
    await section.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await expect(paragraph).toBeVisible();

    for (const content of [heading, paragraph]) {
      const state = await content.evaluate((element) => {
        let opacity = 1;
        let offsetY = 0;
        let current: HTMLElement | null = element as HTMLElement;

        while (current) {
          const style = getComputedStyle(current);
          opacity *= Number(style.opacity);
          if (style.transform !== "none") {
            offsetY += new DOMMatrixReadOnly(style.transform).m42;
          }
          current = current.parentElement;
        }

        const textDescendants = Array.from(element.querySelectorAll<HTMLElement>("*"))
          .filter((descendant) => descendant.textContent?.trim());
        const hiddenText = textDescendants
          .map((descendant) => ({
            text: descendant.textContent?.trim(),
            opacity: Number(getComputedStyle(descendant).opacity),
          }))
          .find((descendant) => descendant.opacity <= 0.01);

        return { opacity, offsetY, hiddenText, text: element.textContent?.trim() };
      });

      expect(state.opacity, `${state.text} should have visible ancestors`).toBeGreaterThan(0.01);
      expect(state.hiddenText, `${state.text} should not contain hidden text`).toBeUndefined();
      expect(Math.abs(state.offsetY), `${state.text} should not start vertically offset`).toBeLessThan(4);
    }
    checkedSections += 1;
  }

  const aboutStatement = page.locator("#about [data-scrub]");
  await expect(aboutStatement.locator("p")).toHaveCount(4);
  await expect(aboutStatement).toContainText("I design backends first");
  await expect(aboutStatement).toContainText("Open to full-time roles, contract work and scoped projects.");
  expect(checkedSections).toBeGreaterThan(0);
});

test("keeps Beyond photo wall cards readable without JavaScript", async ({ page }) => {
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/beyond-terminal");

  await expect(
    page.getByRole("heading", { level: 1, name: "Beyond The Terminal" })
  ).toBeVisible();
  await expect(
    page.getByText("Photos, people, notes, and the parts that don't fit inside a resume.")
  ).toBeVisible();

  const cards = page.getByRole("button", { name: /^Open / });
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  for (let index = 0; index < cardCount; index += 1) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() => card.evaluate((element) => Number(getComputedStyle(element).opacity)))
      .toBeGreaterThan(0.99);
  }
});

test("allows the listed search, retrieval, and training agents in the public policy", () => {
  const policy = JSON.stringify(buildRobots(true));
  for (const agent of [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "Googlebot",
    "Google-Extended",
    "Bingbot",
    "Applebot",
    "Applebot-Extended",
    "Meta-WebIndexer",
    "Meta-ExternalAgent",
    "Meta-ExternalFetcher",
    "PerplexityBot",
    "Perplexity-User",
    "DuckAssistBot",
    "Amazonbot",
    "Amzn-SearchBot",
    "Amzn-User",
    "CCBot",
  ]) {
    expect(policy).toContain(agent);
  }
  expect(policy).toContain('"allow":"/"');
  expect(policy).not.toContain("disallow");
});

test("publishes sitemap, llms summary, canonical work metadata, and the resume", async ({
  page,
  request,
}) => {
  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  const sitemap = await sitemapResponse.text();
  for (const route of ["/", "/work/velo", "/work/portfolio-platform"]) {
    expect(sitemap).toContain(`http://localhost:3000${route}`);
  }
  expect(sitemap).not.toContain("/beyond-terminal");

  const llmsResponse = await request.get("/llms.txt");
  expect(llmsResponse.ok()).toBeTruthy();
  expect(llmsResponse.headers()["content-type"]).toContain("text/plain");
  const llms = await llmsResponse.text();
  expect(llms).toContain("# Abhinav Prasad");
  // The LLM summary keeps its independent profile source; this package changes hero identity and seo.title.
  expect(llms).toContain("At work: Database Engineer, Ostrum Tech Limited.");
  expect(llms).toContain("On my own: Velo, this portfolio, and AI-agent workflows.");
  expect(llms).toContain("Hero, What I do, Experience, Work, Stack, and Contact.");
  expect(llms).toContain("How I work appears below the projects in Work.");
  expect(llms).not.toMatch(/Forward deployed/i);
  expect(llms).toContain("## Professional experience");
  expect(llms).toContain("[Velo, a white-label dispatch prototype]");
  expect(llms).not.toContain("\u2014");
  expect(llms).toContain("[GitHub](https://github.com/k2ocabhinav/abhinav-prasad-portfolio)");
  expect(llms).not.toMatch(/JIRA-|airport name|client name/i);
  expect(sitemap).not.toMatch(/priority|changefreq/i);

  const resumeResponse = await request.get("/resume/abhinav-prasad-resume.pdf");
  expect(resumeResponse.ok()).toBeTruthy();
  expect(resumeResponse.headers()["content-type"]).toContain("application/pdf");

  await page.goto("/work/velo");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/work/velo"
  );
  const veloJsonLd = await page.locator("#project-structured-data").textContent();
  expect(veloJsonLd).not.toBeNull();
  const veloGraph = JSON.parse(veloJsonLd!) as {
    "@graph": Array<Record<string, unknown>>;
  };
  const veloProject = veloGraph["@graph"].find((node) => node["@id"] === "http://localhost:3000/work/velo#project");
  expect(veloProject?.["@type"]).toEqual(["CreativeWork", "SoftwareSourceCode"]);
  expect(veloProject?.codeRepository).toBe("https://github.com/k2ocabhinav/Velo");
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    /Velo/
  );
  const veloOgImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const veloTwitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
  expect(new URL(veloOgImage!, page.url()).pathname).toBe("/projects/velo/og.jpg");
  expect(veloTwitterImage).toBe(veloOgImage);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");

  await page.goto("/work/portfolio-platform");
  const platformOgImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  const platformTwitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
  expect(new URL(platformOgImage!, page.url()).pathname).toBe(
    "/projects/portfolio-platform/og.jpg"
  );
  expect(platformTwitterImage).toBe(platformOgImage);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    /Full-stack engineer, the work and own-build rows/
  );
  const portfolioJsonLd = await page.locator("#project-structured-data").textContent();
  expect(portfolioJsonLd).not.toBeNull();
  const portfolioGraph = JSON.parse(portfolioJsonLd!) as {
    "@graph": Array<Record<string, unknown>>;
  };
  const portfolioProject = portfolioGraph["@graph"].find(
    (node) => node["@id"] === "http://localhost:3000/work/portfolio-platform#project"
  );
  expect(portfolioProject?.["@type"]).toEqual(["CreativeWork", "SoftwareSourceCode"]);
  expect(portfolioProject?.codeRepository).toBe(
    "https://github.com/k2ocabhinav/abhinav-prasad-portfolio"
  );

  await page.goto("/beyond-terminal");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex,\s*nofollow/i
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/beyond-terminal"
  );
});
