import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Parse `--key value` and `--key=value` flags; bare flags become true. */
export function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args[rawKey] = next;
      index += 1;
    } else {
      args[rawKey] = true;
    }
  }

  return args;
}

export function requireOption(args, name) {
  const value = args[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required --${name} option`);
  }
  return value;
}

export function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function timestampSlug(prefix = "capture") {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

function hasPythonPillow() {
  const result = spawnSync("python3", ["-c", "import PIL"], {
    stdio: "ignore",
  });
  return result.status === 0;
}

function hasImageMagick() {
  for (const binary of ["magick", "montage"]) {
    const result = spawnSync(binary, ["-version"], { stdio: "ignore" });
    if (result.status === 0) {
      return binary;
    }
  }
  return null;
}

/** Preferred still-image montage tool, in the order the brief specifies. */
export function detectMontageTool() {
  if (hasPythonPillow()) {
    return "pillow";
  }
  const magick = hasImageMagick();
  return magick ?? "browser";
}

function runPillowMontage({ outPath, frames, columns, cellWidth }) {
  const script = `
import json, os
from PIL import Image, ImageDraw, ImageFont

config = json.loads(os.environ["HERO_MONTAGE_CONFIG"])

def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()

frames = []
for frame in config["frames"]:
    image = Image.open(frame["path"]).convert("RGB")
    width = config["cellWidth"]
    height = max(1, round(image.height * width / image.width))
    frames.append((image.resize((width, height), Image.Resampling.LANCZOS), frame["label"]))

columns = config["columns"]
pad = 8
labelHeight = 20
titleHeight = 30 if config.get("title") else 0
cellHeight = max(image.height for image, _ in frames)
rows = (len(frames) + columns - 1) // columns
sheetWidth = pad + columns * (config["cellWidth"] + pad)
sheetHeight = titleHeight + pad + rows * (cellHeight + labelHeight + pad)
sheet = Image.new("RGB", (sheetWidth, sheetHeight), (20, 20, 20))
draw = ImageDraw.Draw(sheet)

if config.get("title"):
    draw.text((pad, pad), config["title"], fill=(240, 238, 233), font=font(16))

for index, (image, label) in enumerate(frames):
    row, column = divmod(index, columns)
    x = pad + column * (config["cellWidth"] + pad)
    y = titleHeight + pad + row * (cellHeight + labelHeight + pad)
    draw.text((x, y + 2), label, fill=(215, 225, 218), font=font(13))
    sheet.paste(image, (x, y + labelHeight))

sheet.save(config["out"], quality=88, optimize=True)
print(f"pillow montage: {config['out']} ({len(frames)} frames)")
`;

  const payload = JSON.stringify({ outPath, frames, columns, cellWidth });
  const result = spawnSync("python3", ["-c", script], {
    env: { ...process.env, HERO_MONTAGE_CONFIG: payload },
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`Pillow montage failed: ${result.stderr || result.stdout}`);
  }
  return "pillow";
}

function runMagickMontage({ outPath, frames, columns, cellWidth, tool }) {
  const args = [];
  if (tool === "magick") {
    args.push("montage");
  }
  for (const frame of frames) {
    args.push("-label", frame.label, frame.path);
  }
  args.push(
    "-tile",
    `${columns}x`,
    "-geometry",
    `${cellWidth}x+8+8`,
    "-background",
    "#141414",
    "-fill",
    "#d7e1da",
    "-pointsize",
    "13",
    outPath
  );

  const result = spawnSync(tool, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`ImageMagick montage failed: ${result.stderr || result.stdout}`);
  }
  return tool;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function runBrowserMontage(
  browser,
  { outPath, frames, columns, cellWidth, cellHeight, title }
) {
  const cards = frames
    .map((frame) => {
      const mime = frame.path.endsWith(".png") ? "image/png" : "image/jpeg";
      const data = fs.readFileSync(frame.path).toString("base64");
      const sizing = cellHeight
        ? `height:${cellHeight}px;width:auto`
        : `width:${cellWidth}px;height:auto`;
      return `<figure><figcaption>${escapeHtml(frame.label)}</figcaption><img alt="${escapeHtml(
        frame.label
      )}" style="${sizing}" src="data:${mime};base64,${data}"></figure>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  html, body { background: #141414; }
  body { margin: 0; padding: 16px; width: max-content; color: #f0eee9;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  h1 { margin: 0 0 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.02em; }
  main { display: grid; grid-template-columns: repeat(${columns}, max-content); gap: 12px; align-items: start; }
  figure { margin: 0; }
  figcaption { padding: 2px 0 6px; color: #d7e1da; font-size: 13px; }
  img { display: block; outline: 1px solid #2c2c2c; }
</style></head><body>
${title ? `<h1>${escapeHtml(title)}</h1>` : ""}
<main>${cards}</main>
</body></html>`;

  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.decode().catch(() => undefined)
        )
      );
      await document.fonts.ready;
    });
    const contentWidth = await page.evaluate(() =>
      Math.ceil(document.documentElement.scrollWidth)
    );
    await page.setViewportSize({
      width: Math.min(Math.max(contentWidth, 640), 4000),
      height: 900,
    });
    await page.screenshot({
      path: outPath,
      fullPage: true,
      type: "jpeg",
      quality: 88,
    });
  } finally {
    await page.close();
  }
  return "browser";
}

/**
 * Write one labelled contact sheet. Frames are scaled by width (strips) or by
 * a fixed height (the rest-screenshot overview).
 */
export async function montage({
  browser,
  outPath,
  frames,
  columns,
  cellWidth = 480,
  cellHeight,
  title,
  tool,
}) {
  if (frames.length === 0) {
    throw new Error(`No frames to montage for ${outPath}`);
  }

  if (tool === "pillow") {
    return runPillowMontage({ outPath, frames, columns, cellWidth });
  }
  if (tool === "magick" || tool === "montage") {
    return runMagickMontage({ outPath, frames, columns, cellWidth, tool });
  }
  if (!browser) {
    throw new Error("Browser montage requested without a browser instance");
  }
  return runBrowserMontage(browser, {
    outPath,
    frames,
    columns,
    cellWidth,
    cellHeight,
    title,
  });
}

/** Relative-path grid kept as a human-readable fallback next to the frames. */
export function writeIndexHtml(outDir, groups) {
  const sections = groups
    .map((group) => {
      const cards = group.frames
        .map(
          (frame) =>
            `<figure><figcaption>${escapeHtml(frame.label)}</figcaption><img alt="${escapeHtml(
              frame.label
            )}" src="${escapeHtml(frame.relativePath)}"></figure>`
        )
        .join("\n");
      return `<section><h2>${escapeHtml(group.title)}</h2><main style="grid-template-columns:repeat(${
        group.columns
      }, max-content)">${cards}</main></section>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Hero capture frames</title><style>
  body { margin: 0; padding: 24px; background: #141414; color: #f0eee9;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  h1 { font-size: 20px; }
  h2 { font-size: 15px; margin: 28px 0 10px; color: #d7e1da; }
  main { display: grid; gap: 12px; align-items: start; }
  figure { margin: 0; }
  figcaption { padding: 2px 0 6px; font-size: 12px; color: #d7e1da; }
  img { display: block; max-width: 480px; height: auto; outline: 1px solid #2c2c2c; }
</style></head><body>
<h1>Hero capture frames</h1>
${sections}
</body></html>`;

  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
}

/** Resolve the frame folder for a montage group. */
export function frameDir(outDir, name) {
  return ensureDir(path.join(outDir, "frames", name));
}
