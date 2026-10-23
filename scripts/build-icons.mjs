import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

// =============================================================================
// Site icon pipeline
// One master SVG in assets/icon/ produces every icon the app serves:
//   src/app/icon.svg          optimised master for modern browsers
//   src/app/favicon.ico       16 / 32 / 48 PNG entries in a hand-written container
//   src/app/apple-icon.png    180×180, opaque
//   public/icon-192.png       install icon, opaque
//   public/icon-512.png       install icon, opaque (full-bleed scene, so not maskable)
// Optional phase masters in assets/icon/phases/ provide time-of-day favicons;
// master-16.svg and master-tile.svg remain supported for the legacy pipeline.
// Master replacement: cp new.svg assets/icon/master.svg && npm run icons:build
// =============================================================================

const root = process.cwd();
const masterPath = path.join(root, "assets", "icon", "master.svg");
const smallMasterPath = path.join(root, "assets", "icon", "master-16.svg");
const tileMasterPath = path.join(root, "assets", "icon", "master-tile.svg");
const phasesDir = path.join(root, "assets", "icon", "phases");
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");
const publicIconsDir = path.join(publicDir, "icons");
const generatedSkyIconsPath = path.join(root, "src", "lib", "skyIcons.generated.ts");
const PHASES = ["night", "dawn", "day", "golden", "sunset", "dusk"];
const SKY_BOUNDARIES = [
  { phase: "night", start: 1260, end: 300 },
  { phase: "dawn", start: 300, end: 420 },
  { phase: "day", start: 420, end: 960 },
  { phase: "golden", start: 960, end: 1080 },
  { phase: "sunset", start: 1080, end: 1170 },
  { phase: "dusk", start: 1170, end: 1260 },
];

const PAPER = { r: 0xfc, g: 0xf8, b: 0xf2 };
const PAPER_HEX = "#FCF8F2";
// Fraction of the canvas left empty on each side when the master has a
// transparent background, so the artwork survives iOS and maskable cropping.
const PADDING = 0.12;
// Rasterise the SVG well above every requested size, then downsample once.
const SUPERSAMPLE = 2048;

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

function removeStalePhaseIcons(activeFiles) {
  if (!fs.existsSync(publicIconsDir)) return;

  for (const entry of fs.readdirSync(publicIconsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !/^sky-.*\.svg$/.test(entry.name)) continue;
    const file = path.join(publicIconsDir, entry.name);
    if (activeFiles.has(entry.name)) continue;
    fs.unlinkSync(file);
    console.log(`  removed stale ${path.relative(root, file)}`);
  }
}

function generatedSkyMap(iconUrls) {
  const phaseEntries = PHASES.map(
    (phase) => `  ${phase}: ${JSON.stringify(iconUrls[phase])},`
  ).join("\n");
  const boundaries = SKY_BOUNDARIES.map(
    ({ phase, start, end }) => `  { phase: "${phase}", start: ${start}, end: ${end} },`
  ).join("\n");

  return `// Generated by scripts/build-icons.mjs. Do not edit by hand.\nexport type Phase = ${PHASES.map((phase) => JSON.stringify(phase)).join(" | ")};\n\nexport const SKY_ICONS: Record<Phase, string> = {\n${phaseEntries}\n};\n\nexport const SKY_PHASES: ReadonlyArray<{ phase: Phase; start: number; end: number }> = [\n${boundaries}\n];\n`;
}

function buildPhaseIcons() {
  if (!fs.existsSync(phasesDir)) {
    removeStalePhaseIcons(new Set());
    const legacyMap = Object.fromEntries(PHASES.map((phase) => [phase, "/icon.svg"]));
    write(generatedSkyIconsPath, generatedSkyMap(legacyMap));
    console.log("  phases/ not found; retaining legacy single-master behavior");
    return;
  }

  const iconUrls = {};
  const activeFiles = new Set();

  for (const phase of PHASES) {
    const optimized = optimiseSvg(readMaster(path.join(phasesDir, `${phase}.svg`)).toString("utf8"));
    const digest = createHash("sha256").update(optimized).digest("hex").slice(0, 8);
    const filename = `sky-${phase}.${digest}.svg`;
    const url = `/icons/${filename}`;
    write(path.join(publicIconsDir, filename), optimized);
    activeFiles.add(filename);
    iconUrls[phase] = url;
  }

  removeStalePhaseIcons(activeFiles);
  write(generatedSkyIconsPath, generatedSkyMap(iconUrls));
}

async function main() {
  const phaseMasterPath = path.join(phasesDir, "day.svg");
  const usePhases = fs.existsSync(phasesDir);
  const master = readMaster(usePhases ? phaseMasterPath : masterPath);
  const smallMaster = fs.existsSync(smallMasterPath)
    && !usePhases
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

  const phaseTileMasterPath = path.join(phasesDir, "day-tile.svg");
  const installMaster = usePhases
    ? readMaster(phaseTileMasterPath)
    : fs.existsSync(tileMasterPath)
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
  write(path.join(publicDir, "icon-512.png"), icon512);

  buildPhaseIcons();

  console.log(`Paper ${PAPER_HEX}. Replace phase art and rerun npm run icons:build.`);
}

await main();
