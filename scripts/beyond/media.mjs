import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { beyondRenditionCaps, beyondRenditionWidths } from "../../src/lib/portfolioSchema.mjs";

/** Width ladder shared with the content validator. */
export const RENDITION_WIDTHS = beyondRenditionWidths;

/** Per-file byte caps by width. Both formats must fit. */
export const RENDITION_CAPS = beyondRenditionCaps;

const AVIF_QUALITY = 50;
const WEBP_QUALITY = 78;
const AVIF_FLOOR = 35;
const WEBP_FLOOR = 60;
const PLACEHOLDER_LIMIT = 600;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Force one decode pass. Bundled sharp builds can read HEIC containers without
 * carrying the HEVC decoder, which only fails when pixels are requested. When
 * that happens on macOS, sips transcodes the original to a temporary JPEG.
 */
export async function prepareSource(filePath) {
  try {
    await sharp(filePath).resize({ width: 32 }).toBuffer();
    return { path: filePath, cleanup: () => {} };
  } catch (error) {
    if (process.platform !== "darwin") {
      throw new Error(`${path.basename(filePath)} cannot be decoded by sharp and sips is not available: ${error.message}`);
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "beyond-media-"));
    const converted = path.join(tempDir, `${path.parse(filePath).name}.jpg`);
    const result = spawnSync("sips", ["-s", "format", "jpeg", filePath, "--out", converted], {
      encoding: "utf8",
    });
    if (result.status !== 0 || !fs.existsSync(converted)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new Error(`${path.basename(filePath)} could not be decoded by sharp or sips`);
    }

    return {
      path: converted,
      cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
    };
  }
}

export async function sourceGeometry(sourcePath) {
  const meta = await sharp(sourcePath).metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`${path.basename(sourcePath)} has no readable dimensions`);
  }

  const swap = typeof meta.orientation === "number" && meta.orientation >= 5 && meta.orientation <= 8;
  return {
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
  };
}

function encode(base, format, quality) {
  if (format === "avif") {
    return base().avif({ quality, effort: 6 }).toBuffer();
  }
  return base().webp({ quality, effort: 5 }).toBuffer();
}

async function encodeWithinCap(base, format, startQuality, floor, cap) {
  let quality = startQuality;
  let buffer = await encode(base, format, quality);

  while (buffer.length > cap && quality > floor) {
    quality = Math.max(floor, quality - 5);
    buffer = await encode(base, format, quality);
  }

  return { buffer, quality, bytes: buffer.length, fits: buffer.length <= cap };
}

/**
 * Resize once to raw pixels, then encode both formats from that buffer so the
 * quality search does not re-decode the original for every attempt.
 */
export async function buildRenditions(sourcePath, widths) {
  const renditions = [];

  for (const width of widths) {
    const { data, info } = await sharp(sourcePath)
      .rotate()
      .toColourspace("srgb")
      .resize({ width, kernel: "lanczos3", withoutEnlargement: true })
      .sharpen({ sigma: 0.6 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const base = () =>
      sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });

    const cap = RENDITION_CAPS[width];
    const avif = await encodeWithinCap(base, "avif", AVIF_QUALITY, AVIF_FLOOR, cap);
    const webp = await encodeWithinCap(base, "webp", WEBP_QUALITY, WEBP_FLOOR, cap);

    renditions.push({ w: info.width, avif, webp });
  }

  return renditions;
}

async function encodePlaceholder(sourcePath, quality) {
  return sharp(sourcePath)
    .rotate()
    .toColourspace("srgb")
    .resize({ width: 16, kernel: "lanczos3" })
    .blur(0.8)
    .webp({ quality, effort: 6 })
    .toBuffer();
}

export async function buildPlaceholder(sourcePath) {
  let quality = 40;
  let buffer = await encodePlaceholder(sourcePath, quality);

  while (buffer.toString("base64").length + 22 > PLACEHOLDER_LIMIT && quality > 20) {
    quality -= 5;
    buffer = await encodePlaceholder(sourcePath, quality);
  }

  const dataUri = `data:image/webp;base64,${buffer.toString("base64")}`;
  return { dataUri, bytes: dataUri.length, fits: dataUri.length <= PLACEHOLDER_LIMIT };
}

export async function dominantColor(sourcePath) {
  const { dominant } = await sharp(sourcePath)
    .rotate()
    .toColourspace("srgb")
    .resize({ width: 64 })
    .stats();

  return `#${[dominant.r, dominant.g, dominant.b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

const METADATA_KEYS = ["exif", "icc", "xmp", "iptc", "photoshop", "comments"];

/** Re-read a written file and list any embedded metadata that survived. */
export async function inspectMetadata(filePath) {
  const meta = await sharp(filePath).metadata();
  const embedded = METADATA_KEYS.filter((key) => {
    const value = meta[key];
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });

  return {
    embedded,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    orientation: meta.orientation,
  };
}
