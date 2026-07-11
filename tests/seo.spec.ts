import { expect, test } from "@playwright/test";

test("serves recruiter-readable content and structured data in the initial HTML", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();

  expect(html).toContain("Abhinav Prasad");
  expect(html).toContain("I build scalable backend systems by first understanding");
  expect(html).toContain("Software Engineer Intern");
  expect(html).toContain("The thinking behind the build.");

  await page.goto("/");
  const jsonLd = await page
    .locator('#portfolio-structured-data[type="application/ld+json"]')
    .textContent();
  expect(jsonLd).not.toBeNull();

  const graph = JSON.parse(jsonLd!) as {
    "@graph": Array<Record<string, unknown>>;
  };
  expect(graph["@graph"].filter((node) => node["@type"] === "Person")).toHaveLength(1);
  expect(
    graph["@graph"].filter((node) => node["@type"] === "SoftwareSourceCode")
  ).toHaveLength(2);
  expect(jsonLd).not.toContain("abhinav-monogram");
  expect(jsonLd).not.toMatch(/certification|education/i);
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
  expect(llms).toContain("## Professional experience");
  expect(llms).toContain("[Velo — White-Label Dispatch Platform]");
  expect(llms).not.toMatch(/JIRA-|airport name|client name/i);

  const resumeResponse = await request.get("/resume/abhinav-prasad-resume.pdf");
  expect(resumeResponse.ok()).toBeTruthy();
  expect(resumeResponse.headers()["content-type"]).toContain("application/pdf");

  await page.goto("/work/velo");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/work/velo"
  );

  await page.goto("/beyond-terminal");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3000/beyond-terminal"
  );
});
