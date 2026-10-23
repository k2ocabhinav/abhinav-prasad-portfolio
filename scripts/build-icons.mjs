import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// =============================================================================
// Site icon pipeline
// One master SVG in assets/icon/ produces every icon the app serves:
//   src/app/icon.svg          optimised master for modern browsers
//   src/app/favicon.ico       16 / 32 / 48 PNG entries in a hand-written container
//   src/app/apple-icon.png    180×180, opaque
//   public/icon-192.png       install icon, opaque
//   public/icon-512.png       install icon, opaque, maskable-safe
// Optional masters: master-16.svg tunes the 16 px favicon entry; master-tile.svg
// is a full-bleed square for the install icons (the OS rounds those itself).
// Master replacement: cp new.svg assets/icon/master.svg && npm run icons:build
// =============================================================================

const root = process.cwd();
const masterPath = path.join(root, "assets", "icon", "master.svg");
const smallMasterPath = path.join(root, "assets", "icon", "master-16.svg");
const tileMasterPath = path.join(root, "assets", "icon", "master-tile.svg");
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");

const PAPER = { r: 0xfc, g: 0xf8, b: 0xf2 };
const PAPER_HEX = "#FCF8F2";
// Fraction of the canvas left empty on each side when the master has a
// transparent background, so the artwork survives iOS and maskable cropping.
const PADDING = 0.12;
// Maskable icons must keep their artwork inside the central 80% of the canvas.
const SAFE_ZONE = 0.1;
// Rasterise the SVG well above every requested size, then downsample once.
const SUPERSAMPLE = 2048;
// A pixel is artwork when its luma differs this much from the corner pixel,
// which is the icon's background (paper, or a full-bleed tile colour).
const INK_LUMA_DELTA = 40;

const PNG_OPTIONS = { compressionLevel: 9, adaptiveFiltering: true };
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
// Critical chunks plus the transparency table palette images need. Everything
// else (pHYs, tEXt, eXIf, iCCP) is metadata and is dropped.
const PNG_KEEP_CHUNKS = new Set(["IHDR", "PLTE", "tRNS", "IDAT", "IEND"]);

function stripPngMetadata(png) {
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("Refusing to strip metadata from a non-PNG buffer");
  }

  const chunks = [PNG_SIGNATURE];
  let offset = 8;
  while (offset + 12 <= png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > png.length) throw new Error("Truncated PNG chunk sequence");
    if (PNG_KEEP_CHUNKS.has(type)) chunks.push(png.subarray(offset, end));
    offset = end;
    if (type === "IEND") return Buffer.concat(chunks);
  }

  throw new Error("PNG is missing its IEND chunk");
}

function optimiseSvg(source) {
  return `${source
    .replace(/<\?xml[^>]*\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, "")
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .replace(/<desc[\s\S]*?<\/desc>/gi, "")
    .replace(/\s(?:inkscape|sodipodi|serif):[\w-]+="[^"]*"/g, "")
    .replace(/\sxmlns:(?:inkscape|sodipodi|serif)="[^"]*"/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim()}\n`;
}

function readMaster(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing icon master: ${path.relative(root, file)}`);
  }
  return fs.readFileSync(file);
}

function rasterise(svg, size) {
  const scale = SUPERSAMPLE / 64;
  return sharp(svg, { density: Math.round(72 * scale) })
    .resize(size, size, { fit: "contain", kernel: "lanczos3" })
    .png(PNG_OPTIONS)
    .toBuffer();
}

async function hasTransparentBackground(svg) {
  const { data, info } = await sharp(svg, { density: 288 })
    .resize(128, 128, { fit: "contain" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 3; index < data.length; index += info.channels) {
    if (data[index] < 255) return true;
  }
  return false;
}

// Composites the master on paper. `padding` shrinks the artwork while keeping
// the canvas opaque; 0 renders the master edge to edge.
async function renderSquare(svg, size, padding) {
  let png;

  if (padding === 0) {
    png = await sharp(await rasterise(svg, size))
      .flatten({ background: PAPER })
      .png(PNG_OPTIONS)
      .toBuffer();
  } else {
    const inset = Math.round(size * padding);
    const innerSize = size - inset * 2;
    const artwork = await rasterise(svg, innerSize);

    png = await sharp({
      create: { width: size, height: size, channels: 3, background: PAPER },
    })
      .composite([{ input: artwork, gravity: "center" }])
      .flatten({ background: PAPER })
      .png(PNG_OPTIONS)
      .toBuffer();
  }

  return stripPngMetadata(png);
}

async function inkBounds(png) {
  const { data, info } = await sharp(png)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lumaAt = (offset) =>
    data[offset] * 0.2126 + data[offset + 1] * 0.7152 + data[offset + 2] * 0.0722;
  const background = lumaAt(0);
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      if (Math.abs(lumaAt(offset) - background) < INK_LUMA_DELTA) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < 0) throw new Error("The master renders no visible artwork");
  return { left, top, right, bottom };
}

async function assertMaskableSafe(png, size) {
  const bounds = await inkBounds(png);
  const limit = Math.floor(size * SAFE_ZONE);
  const safe = Math.ceil(size * (1 - SAFE_ZONE));
  const failures = [];
  if (bounds.left < limit) failures.push(`left ${bounds.left} < ${limit}`);
  if (bounds.top < limit) failures.push(`top ${bounds.top} < ${limit}`);
  if (bounds.right >= safe) failures.push(`right ${bounds.right} >= ${safe}`);
  if (bounds.bottom >= safe) failures.push(`bottom ${bounds.bottom} >= ${safe}`);
  if (failures.length > 0) {
    throw new Error(`512px icon leaves the maskable safe zone: ${failures.join(", ")}`);
  }
}

function createIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;

  entries.forEach(({ size, png }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...entries.map((entry) => entry.png)]);
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  const size = Buffer.isBuffer(contents)
    ? contents.length
    : Buffer.byteLength(contents);
  console.log(`  ${path.relative(root, file)} (${size} bytes)`);
}

async function main() {
  const master = readMaster(masterPath);
  const smallMaster = fs.existsSync(smallMasterPath)
    ? readMaster(smallMasterPath)
    : master;

  console.log("Building site icons");
  write(path.join(appDir, "icon.svg"), optimiseSvg(master.toString("utf8")));

  const faviconEntries = await Promise.all([
    { size: 16, svg: smallMaster },
    { size: 32, svg: master },
    { size: 48, svg: master },
  ].map(async ({ size, svg }) => ({
    size,
    png: stripPngMetadata(await rasterise(svg, size)),
  })));
  write(path.join(appDir, "favicon.ico"), createIco(faviconEntries));

  const installMaster = fs.existsSync(tileMasterPath)
    ? readMaster(tileMasterPath)
    : master;
  const transparent = await hasTransparentBackground(installMaster);
  const padding = transparent ? PADDING : 0;
  console.log(
    `  master background: ${transparent ? "transparent" : "opaque"} (padding ${Math.round(padding * 100)}%)`
  );

  write(path.join(appDir, "apple-icon.png"), await renderSquare(installMaster, 180, padding));
  write(path.join(publicDir, "icon-192.png"), await renderSquare(installMaster, 192, padding));

  const icon512 = await renderSquare(installMaster, 512, padding);
  await assertMaskableSafe(icon512, 512);
  write(path.join(publicDir, "icon-512.png"), icon512);

  console.log(`Paper ${PAPER_HEX}. Swap the master and rerun npm run icons:build.`);
}

await main();
