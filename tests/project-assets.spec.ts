import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const projectContentRoot = path.join(root, "src/content/portfolio/projects");
const publicRoot = path.join(root, "public");
const projectImagePattern = /["'`](\/projects\/[^"'`\s?#]+\.(?:avif|gif|jpe?g|png|svg|webp))["'`]/gi;

test("resolves every project image reference and verifies content-hashed captures", async ({ request }) => {
  const projectFiles = fs.readdirSync(projectContentRoot)
    .filter((file) => file.endsWith(".mdx"));
  const projectImagePaths = new Set<string>();

  for (const file of projectFiles) {
    const contents = fs.readFileSync(path.join(projectContentRoot, file), "utf8");
    for (const match of contents.matchAll(projectImagePattern)) {
      projectImagePaths.add(match[1]);
    }
  }

  expect(projectImagePaths.size).toBeGreaterThan(0);
  for (const imagePath of projectImagePaths) {
    const diskPath = path.join(publicRoot, decodeURIComponent(imagePath.slice(1)));
    expect(fs.existsSync(diskPath), `${imagePath} should exist under public/`).toBeTruthy();
    const response = await request.get(imagePath);
    expect(response.ok(), `${imagePath} should be served successfully`).toBeTruthy();
  }

  const platformCaptureRoot = path.join(publicRoot, "projects/portfolio-platform");
  const captureFiles = fs.readdirSync(platformCaptureRoot)
    .filter((file) => /\.(?:jpe?g|png|webp)$/i.test(file));
  expect(captureFiles.length).toBeGreaterThan(0);

  for (const filename of captureFiles) {
    const match = filename.match(/^(.+)\.([a-f0-9]{8})\.(?:jpe?g|png|webp)$/i);
    expect(match, `${filename} should include an eight character SHA-256 hash`).not.toBeNull();
    const digest = createHash("sha256")
      .update(fs.readFileSync(path.join(platformCaptureRoot, filename)))
      .digest("hex")
      .slice(0, 8);
    expect(match?.[2]).toBe(digest);
  }
});
