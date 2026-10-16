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
  expect(html).toContain("I turn operational needs into working software with sound system design and human-reviewed AI workflows.");
  expect(html).toContain("Forward Deployed Engineer · AI orchestration");
  expect(html).toContain("Currently: Database Engineer at Ostrum Tech Limited");
  expect(html).toContain("How I orchestrate AI agents");
  expect(html).toContain("Software Engineer Intern");
  expect(html).toContain("How I turn requests into software");

  await page.goto("/");
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
  });
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
  expect(title).toBe("Abhinav Prasad | Forward Deployed Engineer");
  expect(title.length).toBeLessThanOrEqual(60);
  expect(description).toBe("Full-stack software engineer targeting Forward Deployed Engineer roles, with AI agent orchestration and end-to-end system design and delivery.");
  expect(description?.length ?? 0).toBeLessThanOrEqual(155);
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
  for (const route of ["/", "/beyond-terminal", "/work/velo", "/work/portfolio-platform"]) {
    expect(sitemap).toContain(`http://localhost:3000${route}`);
  }

  const llmsResponse = await request.get("/llms.txt");
  expect(llmsResponse.ok()).toBeTruthy();
  expect(llmsResponse.headers()["content-type"]).toContain("text/plain");
  const llms = await llmsResponse.text();
  expect(llms).toContain("# Abhinav Prasad");
  expect(llms).toContain("> Full-stack software engineer targeting Forward Deployed Engineer roles");
  expect(llms).toContain("Currently: Database Engineer at Ostrum Tech Limited.");
  expect(llms).toContain("## Professional experience");
  expect(llms).toContain("[Velo, a white-label dispatch platform]");
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

  await page.goto("/work/portfolio-platform");
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
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/beyond-terminal"
  );
});
