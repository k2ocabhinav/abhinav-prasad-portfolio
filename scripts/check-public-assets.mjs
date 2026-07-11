import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const sourceRoots = ["src", "scripts"];
const sourceExtensions = new Set([".css", ".js", ".jsx", ".md", ".mdx", ".mjs", ".ts", ".tsx"]);
const assetExtensions = "avif|gif|ico|jpe?g|pdf|png|svg|webp";
const localAssetPattern = new RegExp(
  String.raw`["'\x60](\/[^"'\x60\s?#]+\.(?:${assetExtensions}))(?:[?#][^"'\x60\s]*)?["'\x60]`,
  "gi"
);
const absoluteAssetPattern = new RegExp(
  String.raw`["'\x60]https?:\/\/[^"'\x60\s]+?(\/[^"'\x60\s?#]+\.(?:${assetExtensions}))(?:[?#][^"'\x60\s]*)?["'\x60]`,
  "gi"
);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

const publicFiles = new Set(
  walk(publicRoot)
    .filter((file) => path.basename(file) !== ".gitkeep")
    .map((file) => path.relative(publicRoot, file).split(path.sep).join("/"))
);

const sourceFiles = sourceRoots
  .flatMap((directory) => walk(path.join(root, directory)))
  .filter((file) => sourceExtensions.has(path.extname(file)));

const references = new Set();
const missing = new Map();

for (const file of sourceFiles) {
  const contents = fs.readFileSync(file, "utf8");

  for (const pattern of [localAssetPattern, absoluteAssetPattern]) {
    pattern.lastIndex = 0;
    for (const match of contents.matchAll(pattern)) {
      const assetPath = decodeURIComponent(match[1]).replace(/^\/+/, "");
      if (pattern === absoluteAssetPattern && !publicFiles.has(assetPath)) continue;

      references.add(assetPath);
      if (!publicFiles.has(assetPath)) {
        const locations = missing.get(assetPath) ?? [];
        locations.push(path.relative(root, file));
        missing.set(assetPath, locations);
      }
    }
  }
}

const orphaned = [...publicFiles].filter((file) => !references.has(file)).sort();

if (missing.size > 0 || orphaned.length > 0) {
  if (missing.size > 0) {
    console.error("Missing public assets:");
    for (const [asset, files] of [...missing].sort(([left], [right]) => left.localeCompare(right))) {
      console.error(`  /${asset} referenced by ${files.join(", ")}`);
    }
  }

  if (orphaned.length > 0) {
    console.error("Orphaned public assets:");
    for (const asset of orphaned) console.error(`  public/${asset}`);
  }

  process.exitCode = 1;
} else {
  console.log(`Public asset check passed (${publicFiles.size} assets, ${references.size} references).`);
}
