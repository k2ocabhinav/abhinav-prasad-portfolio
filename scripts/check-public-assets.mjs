import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const sourceRoots = ["src", "scripts"];
const sourceExtensions = new Set([".css", ".js", ".jsx", ".md", ".mdx", ".mjs", ".ts", ".tsx"]);
const assetExtensions = "avif|gif|ico|jpe?g|pdf|png|svg|webp";
const metadataImageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const indianMobilePattern = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/g;
const lockfilePattern = /(^|\/)(?:package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/i;
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

function inspectJpeg(buffer) {
  const findings = [];
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return ["invalid JPEG container"];
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return ["invalid JPEG marker sequence"];
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > buffer.length) return ["truncated JPEG segment"];

    const segmentLength = buffer.readUInt16BE(offset);
    const payloadStart = offset + 2;
    const payloadEnd = offset + segmentLength;
    if (segmentLength < 2 || payloadEnd > buffer.length) {
      return ["invalid JPEG segment length"];
    }

    if (marker === 0xe1) {
      const payload = buffer.subarray(payloadStart, payloadEnd);
      if (payload.subarray(0, 6).equals(Buffer.from("Exif\0\0", "latin1"))) {
        findings.push("EXIF/GPS metadata");
      }
      if (
        payload.includes(Buffer.from("http://ns.adobe.com/xap/1.0/\0", "latin1")) ||
        payload.includes(Buffer.from("http://ns.adobe.com/xmp/extension/\0", "latin1"))
      ) {
        findings.push("XMP metadata");
      }
    }
    offset = payloadEnd;
  }

  return findings;
}

function inspectPng(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 20 || !buffer.subarray(0, 8).equals(signature)) {
    return ["invalid PNG container"];
  }

  const findings = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
    const payloadStart = offset + 8;
    const payloadEnd = payloadStart + chunkLength;
    if (payloadEnd + 4 > buffer.length) return ["invalid PNG chunk length"];

    if (chunkType === "eXIf") findings.push("EXIF/GPS metadata");
    if (chunkType === "tEXt" || chunkType === "iTXt") {
      const text = buffer.toString("latin1", payloadStart, payloadEnd);
      if (/\bexif\b|\bgps\b/i.test(text)) findings.push("EXIF/GPS text metadata");
      if (/\bxmp\b|adobe\.com\/xap|x:xmpmeta/i.test(text)) findings.push("XMP metadata");
    }

    offset = payloadEnd + 4;
    if (chunkType === "IEND") return findings;
  }

  return ["incomplete PNG chunk sequence"];
}

function inspectWebp(buffer) {
  if (
    buffer.length < 12 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return ["invalid WebP container"];
  }

  const findings = [];
  const declaredEnd = buffer.readUInt32LE(4) + 8;
  if (declaredEnd > buffer.length) return ["invalid WebP RIFF length"];
  let offset = 12;
  while (offset + 8 <= declaredEnd) {
    const chunkType = buffer.toString("ascii", offset, offset + 4);
    const chunkLength = buffer.readUInt32LE(offset + 4);
    const payloadEnd = offset + 8 + chunkLength;
    if (payloadEnd > declaredEnd) return ["invalid WebP chunk length"];
    if (chunkType === "EXIF") findings.push("EXIF/GPS metadata");
    if (chunkType === "XMP ") findings.push("XMP metadata");
    offset = payloadEnd + (chunkLength % 2);
  }
  return findings;
}

const avifContainers = new Set([
  "dinf", "edts", "iprp", "ipco", "iref", "mdia", "meta", "minf", "moof",
  "moov", "mfra", "meco", "mere", "schi", "sinf", "stbl", "trak", "traf",
  "tref", "udta",
]);

function inspectAvif(buffer) {
  if (buffer.length < 16 || buffer.toString("ascii", 4, 8) !== "ftyp") {
    return ["invalid AVIF ISO BMFF container"];
  }

  const findings = [];
  let parsedBoxes = 0;

  function inspectBoxes(start, end, depth = 0) {
    if (depth > 12) return false;
    let offset = start;
    while (offset + 8 <= end) {
      const size32 = buffer.readUInt32BE(offset);
      const type = buffer.toString("ascii", offset + 4, offset + 8);
      let headerSize = 8;
      let boxSize = size32;
      if (size32 === 1) {
        if (offset + 16 > end) return false;
        const largeSize = buffer.readBigUInt64BE(offset + 8);
        if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) return false;
        boxSize = Number(largeSize);
        headerSize = 16;
      } else if (size32 === 0) {
        boxSize = end - offset;
      }
      if (boxSize < headerSize || offset + boxSize > end) return false;
      parsedBoxes += 1;
      const payloadStart = offset + headerSize;
      const boxEnd = offset + boxSize;

      if (type === "Exif") findings.push("EXIF/GPS metadata");
      if (type === "xml ") findings.push("XMP metadata");

      if (type === "infe" && payloadStart + 4 <= boxEnd) {
        const version = buffer[payloadStart];
        const itemTypeOffset = payloadStart + (version === 2 ? 8 : version === 3 ? 10 : 0);
        if (itemTypeOffset > payloadStart && itemTypeOffset + 4 <= boxEnd) {
          const itemType = buffer.toString("ascii", itemTypeOffset, itemTypeOffset + 4);
          if (itemType === "Exif") findings.push("EXIF/GPS metadata");
          if (itemType === "mime") {
            const contentTypeStart = itemTypeOffset + 4;
            const content = buffer.toString("latin1", contentTypeStart, boxEnd);
            if (/xmp|rdf\+xml|adobe\.com\/xap|x:xmpmeta/i.test(content)) {
              findings.push("XMP metadata");
            }
            if (/gps(?:latitude|longitude|position)/i.test(content)) {
              findings.push("GPS metadata");
            }
          }
        }
      }

      if (avifContainers.has(type)) {
        let childrenStart = payloadStart;
        if (type === "meta" || type === "iref") childrenStart += 4;
        if (type === "iinf") {
          if (childrenStart + 4 > boxEnd) return false;
          const version = buffer[childrenStart];
          childrenStart += version === 0 ? 6 : 8;
        }
        if (childrenStart > boxEnd || !inspectBoxes(childrenStart, boxEnd, depth + 1)) {
          return false;
        }
      }
      offset = boxEnd;
    }
    return offset === end || end - offset < 8;
  }

  if (!inspectBoxes(0, buffer.length) || parsedBoxes === 0) {
    return ["invalid AVIF box sequence"];
  }
  return findings;
}

function inspectImageMetadata(file) {
  const extension = path.extname(file).toLowerCase();
  const buffer = fs.readFileSync(file);
  if (extension === ".jpg" || extension === ".jpeg") return inspectJpeg(buffer);
  if (extension === ".png") return inspectPng(buffer);
  if (extension === ".webp") return inspectWebp(buffer);
  if (extension === ".avif") return inspectAvif(buffer);
  return [];
}

const publicFiles = new Set(
  walk(publicRoot)
    .filter((file) => path.basename(file) !== ".gitkeep")
    .map((file) => path.relative(publicRoot, file).split(path.sep).join("/"))
);
const appRouteAssets = new Set(
  walk(path.join(root, "src", "app"))
    .filter((file) => path.basename(file) === "icon.svg")
    .map((file) => path.relative(path.join(root, "src", "app"), file).split(path.sep).join("/"))
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
      if (!publicFiles.has(assetPath) && !appRouteAssets.has(assetPath)) {
        const locations = missing.get(assetPath) ?? [];
        locations.push(path.relative(root, file));
        missing.set(assetPath, locations);
      }
    }
  }
}

const orphaned = [...publicFiles].filter((file) => !references.has(file)).sort();
const metadataIssues = [];

for (const file of publicFiles) {
  const absolutePath = path.join(publicRoot, file);
  if (!metadataImageExtensions.has(path.extname(file).toLowerCase())) continue;
  const findings = inspectImageMetadata(absolutePath);
  for (const finding of findings) metadataIssues.push(`  public/${file}: ${finding}`);
}

const trackedMobileIssues = [];
const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
for (const file of trackedFiles) {
  if (
    lockfilePattern.test(file) ||
    file.split("/").some((part) => part === "node_modules" || part === ".next")
  ) {
    continue;
  }
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) continue;
  const buffer = fs.readFileSync(absolutePath);
  // Raw byte scans produce false positives in compressed images and PDFs.
  // Those containers have format-specific checks above; mobile-pattern checks
  // apply to tracked text files, matching git grep's binary-file behavior.
  if (buffer.includes(0)) continue;
  const contents = buffer.toString("utf8");
  indianMobilePattern.lastIndex = 0;
  if (indianMobilePattern.test(contents)) trackedMobileIssues.push(`  ${file}`);
}

if (missing.size > 0 || orphaned.length > 0 || metadataIssues.length > 0 || trackedMobileIssues.length > 0) {
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

  if (metadataIssues.length > 0) {
    console.error("Public images containing EXIF, GPS, or XMP metadata:");
    for (const issue of metadataIssues) console.error(issue);
  }

  if (trackedMobileIssues.length > 0) {
    console.error("Tracked files containing a possible Indian mobile number:");
    for (const issue of trackedMobileIssues) console.error(issue);
  }

  process.exitCode = 1;
} else {
  console.log(`Public asset check passed (${publicFiles.size} assets, ${references.size} references).`);
}
