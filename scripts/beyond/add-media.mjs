#!/usr/bin/env node
/**
 * Add inbox photos to the Beyond album.
 *
 *   npm run beyond:add
 *   npm run beyond:add -- --force shillong-office
 *   npm run beyond:add -- --inbox ../beyond-inbox --out ../../out/b11-media
 *
 * Originals stay outside the repo. Each photo is decoded, resized to the
 * 480/960/1600 ladder, encoded as AVIF and WebP inside the byte caps, stripped
 * of metadata, and written with a content hash in the file name. A draft entry
 * lands in src/content/portfolio/beyond/ and is never published automatically.
 */
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  RENDITION_CAPS,
  RENDITION_WIDTHS,
  buildPlaceholder,
  buildRenditions,
  dominantColor,
  formatBytes,
  inspectMetadata,
  prepareSource,
  sourceGeometry,
} from "./media.mjs";
import {
  aspectRatio,
  colorForKind,
  normalizeKind,
  parseSidecar,
  privacyForPeople,
  renderDraft,
  sizeForAspect,
  slugify,
  titleFromSlug,
} from "./draft.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const albumDir = path.join(repoRoot, "public/beyond-terminal/album");
const contentDir = path.join(repoRoot, "src/content/portfolio/beyond");
const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".heic"]);

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [key, inline] = token.slice(2).split("=", 2);
    if (!["force", "inbox", "out"].includes(key)) {
      throw new Error(`Unknown option: --${key}`);
    }

    if (inline !== undefined) {
      options[key] = inline;
      continue;
    }

    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }

  return options;
}

function findInbox(explicit) {
  if (explicit === true) throw new Error("--inbox needs a directory");
  if (explicit) return path.resolve(explicit);
  if (process.env.BEYOND_INBOX) return path.resolve(process.env.BEYOND_INBOX);

  let directory = repoRoot;
  for (;;) {
    const candidate = path.join(directory, "beyond-inbox");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;

    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  throw new Error("Could not find beyond-inbox. Pass --inbox <dir> or set BEYOND_INBOX.");
}

function listPhotos(inbox) {
  return fs
    .readdirSync(inbox, { withFileTypes: true })
    .filter((entry) => entry.isFile() && PHOTO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(inbox, entry.name))
    .sort();
}

function contentHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 8);
}

/** Hashes already present in the album file names, so reruns stay cheap. */
function processedHashes() {
  const hashes = new Set();
  if (!fs.existsSync(albumDir)) return hashes;

  for (const file of fs.readdirSync(albumDir)) {
    const match = /^.+\.([0-9a-f]{8})-(?:480|960|1600)\.(?:avif|webp)$/.exec(file);
    if (match) hashes.add(match[1]);
  }

  return hashes;
}

function existingIds() {
  const ids = new Map();
  if (!fs.existsSync(contentDir)) return ids;

  for (const file of fs.readdirSync(contentDir)) {
    if (!file.endsWith(".mdx")) continue;
    const match = /^id:\s*"([^"]+)"/m.exec(fs.readFileSync(path.join(contentDir, file), "utf8"));
    if (match) ids.set(match[1], file);
  }

  return ids;
}

function removeSlugFiles(slug) {
  if (!fs.existsSync(albumDir)) return;

  const prefix = `${slug}.`;
  for (const file of fs.readdirSync(albumDir)) {
    if (!file.startsWith(prefix)) continue;
    const suffix = file.slice(prefix.length);
    if (/^[0-9a-f]{8}-(?:480|960|1600)\.(?:avif|webp)$/.test(suffix)) {
      fs.rmSync(path.join(albumDir, file));
    }
  }
}

/** Optional: Apple Vision face count, one process for the whole batch. */
function detectFaces(paths) {
  const counts = new Map();
  const helper = path.join(scriptDir, "face-count.swift");
  if (process.platform !== "darwin" || paths.length === 0 || !fs.existsSync(helper)) return counts;

  const result = spawnSync("swift", [helper, ...paths], { encoding: "utf8", timeout: 180_000 });
  if (result.status !== 0) {
    console.warn("Face detection skipped: the Swift Vision helper did not run.");
    return counts;
  }

  for (const line of result.stdout.split(/\r?\n/)) {
    const match = /^(-?\d+)\t(.+)$/.exec(line);
    if (match) counts.set(match[2], Number(match[1]));
  }

  return counts;
}

function faceLabel(count) {
  if (count === undefined) return "n/a";
  return count < 0 ? "unreadable" : String(count);
}

function renderTable(rows) {
  const header = ["slug", ...RENDITION_WIDTHS.map((width) => `${width}px`), "faces", "warnings"];
  const cell = (value) => String(value).replace(/\|/g, "\\|");
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
  ];

  for (const row of rows) {
    lines.push(
      `| ${[row.slug, ...row.cells, row.faces, row.warnings.join("; ") || "none"].map(cell).join(" | ")} |`
    );
  }

  return lines.join("\n");
}

function appendReport(markdown, outOption) {
  const outDir = outOption
    ? path.resolve(outOption)
    : process.env.BEYOND_REPORT_DIR
      ? path.resolve(process.env.BEYOND_REPORT_DIR)
      : null;
  if (!outDir) return;

  fs.mkdirSync(outDir, { recursive: true });
  fs.appendFileSync(path.join(outDir, "last.md"), markdown);
}

async function processPhoto(item, faceCount) {
  const warnings = [...item.warnings];
  let hardFailure = false;
  const prepared = await prepareSource(item.sourcePath);

  try {
    const geometry = await sourceGeometry(prepared.path);
    const size = sizeForAspect(geometry.width, geometry.height);
    const widths = RENDITION_WIDTHS.filter((width) => width <= geometry.width);
    if (widths.length === 0) {
      throw new Error(`source is ${geometry.width}px wide; no rendition can be made without upscaling`);
    }

    const encoded = await buildRenditions(prepared.path, widths);
    const placeholder = await buildPlaceholder(prepared.path);
    const dominant = await dominantColor(prepared.path);

    if (!placeholder.fits) {
      warnings.push(`placeholder is ${placeholder.bytes} B, above the 600 B limit`);
      hardFailure = true;
    }

    if (item.force) removeSlugFiles(item.slug);

    const renditions = [];
    const sizes = new Map();
    const written = [];

    for (const rendition of encoded) {
      const width = rendition.w;
      for (const format of ["avif", "webp"]) {
        if (!rendition[format].fits) {
          warnings.push(
            `${width}px ${format.toUpperCase()} is ${formatBytes(rendition[format].bytes)}, above the ${formatBytes(RENDITION_CAPS[width])} cap`
          );
          hardFailure = true;
        }
      }

      const avifName = `${item.slug}.${item.hash}-${width}.avif`;
      const webpName = `${item.slug}.${item.hash}-${width}.webp`;
      fs.writeFileSync(path.join(albumDir, avifName), rendition.avif.buffer);
      fs.writeFileSync(path.join(albumDir, webpName), rendition.webp.buffer);

      sizes.set(width, { avif: rendition.avif.bytes, webp: rendition.webp.bytes });
      renditions.push({
        w: width,
        avif: `/beyond-terminal/album/${avifName}`,
        webp: `/beyond-terminal/album/${webpName}`,
        bytes: rendition.avif.bytes + rendition.webp.bytes,
      });
      written.push(
        { filePath: path.join(albumDir, avifName), width, label: avifName },
        { filePath: path.join(albumDir, webpName), width, label: webpName }
      );
    }

    for (const file of written) {
      const meta = await inspectMetadata(file.filePath);
      if (meta.embedded.length > 0) {
        warnings.push(`${file.label} still carries ${meta.embedded.join(", ")}`);
        hardFailure = true;
      }
      if (meta.width !== file.width) {
        warnings.push(`${file.label} is ${meta.width}px wide, expected ${file.width}px`);
        hardFailure = true;
      }
      if (meta.orientation !== undefined && meta.orientation !== 1) {
        warnings.push(`${file.label} keeps EXIF orientation ${meta.orientation}`);
        hardFailure = true;
      }
    }

    const nineSixty = renditions.find((rendition) => rendition.w === 960);
    const cover = nineSixty ?? renditions[renditions.length - 1];
    const caption = item.caption || item.title;
    const privacy = privacyForPeople(item.sidecar.people);
    if (!item.caption) warnings.push("caption missing; the title is used as a placeholder");
    if (privacy) warnings.push('privacy is needs-consent: the people field is missing or is not "only me"');
    if (typeof faceCount === "number" && faceCount > 1) {
      warnings.push(`${faceCount} faces detected; confirm the people line before publishing`);
    }

    fs.writeFileSync(
      path.join(contentDir, `${item.slug}.mdx`),
      renderDraft({
        slug: item.slug,
        kind: item.kind,
        title: item.title,
        caption,
        privacy,
        color: colorForKind(item.kind),
        size,
        src: cover.webp,
        alt: `TODO: rewrite this alt with what is in the frame. ${item.title}`,
        aspect: aspectRatio(geometry.width, geometry.height),
        dominantColor: dominant,
        placeholder: placeholder.dataUri,
        renditions,
      })
    );

    return {
      slug: item.slug,
      cells: RENDITION_WIDTHS.map((width) => {
        const pair = sizes.get(width);
        return pair ? `${formatBytes(pair.avif)} AVIF / ${formatBytes(pair.webp)} WebP` : "skipped";
      }),
      faces: faceLabel(faceCount),
      warnings,
      hardFailure,
      renditions,
      sizes,
    };
  } finally {
    prepared.cleanup();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.force === true) throw new Error("--force needs a slug, for example --force shillong-office");
  if (options.out === true) throw new Error("--out needs a directory");

  const inbox = findInbox(options.inbox);
  const photos = listPhotos(inbox);
  const processed = processedHashes();
  const ids = existingIds();
  const forceSlug = typeof options.force === "string" ? options.force : undefined;

  if (forceSlug && !photos.some((photo) => slugify(path.parse(photo).name) === forceSlug)) {
    throw new Error(`No inbox photo resolves to the slug "${forceSlug}".`);
  }

  const skipped = [];
  const pending = [];

  for (const photo of photos) {
    const base = path.parse(photo).name;
    const slug = slugify(base);
    if (forceSlug && slug !== forceSlug) continue;

    const hash = contentHash(photo);
    const sidecar = parseSidecar(path.join(inbox, `${base}.txt`));
    const entryPath = path.join(contentDir, `${slug}.mdx`);

    if (!forceSlug) {
      if (processed.has(hash)) {
        skipped.push(`${slug} (hash ${hash} already in the album)`);
        continue;
      }
      if (fs.existsSync(entryPath) || ids.has(slug)) {
        skipped.push(`${slug} (entry exists; use --force ${slug} to regenerate)`);
        continue;
      }
    }

    const warnings = [];
    const kind = normalizeKind(sidecar.kind, warnings);

    pending.push({
      slug,
      hash,
      sourcePath: photo,
      sidecar,
      kind,
      title: sidecar.title?.trim() || titleFromSlug(slug),
      caption: sidecar.caption?.trim() ?? "",
      warnings,
      force: Boolean(forceSlug),
    });
  }

  if (pending.length === 0) {
    console.log("beyond:add: nothing new to process.");
    for (const line of skipped) console.log(`  skipped ${line}`);
    return;
  }

  const faces = detectFaces(pending.map((item) => item.sourcePath));
  const rows = [];
  let failed = false;

  for (const item of pending) {
    let result;
    try {
      result = await processPhoto(item, faces.get(item.sourcePath));
    } catch (error) {
      result = {
        slug: item.slug,
        cells: RENDITION_WIDTHS.map(() => "failed"),
        faces: faceLabel(faces.get(item.sourcePath)),
        warnings: [...item.warnings, error.message],
        hardFailure: true,
      };
    }

    rows.push(result);
    failed ||= result.hardFailure;
    if (result.renditions) {
      for (const rendition of result.renditions) {
        const pair = result.sizes.get(rendition.w);
        console.log(
          `${item.slug} ${String(rendition.w).padStart(4)}px  AVIF ${formatBytes(pair.avif)} / WebP ${formatBytes(pair.webp)}  ${rendition.webp}`
        );
      }
      console.log(`${item.slug} draft  src/content/portfolio/beyond/${item.slug}.mdx`);
    }
  }

  const table = renderTable(rows);
  console.log(`\n${table}`);
  for (const line of skipped) console.log(`skipped ${line}`);

  appendReport(
    [
      `## ${new Date().toISOString()}  beyond:add`,
      "",
      `Inbox: \`${path.relative(process.cwd(), inbox) || "."}\``,
      "",
      table,
      "",
      ...rows.flatMap((row) => row.warnings.map((warning) => `- ${row.slug}: ${warning}`)),
      "",
    ].join("\n"),
    options.out
  );

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`beyond:add: ${error.message}`);
  process.exitCode = 1;
});
