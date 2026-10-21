import fs from "node:fs";
import { beyondKinds } from "../../src/lib/portfolioSchema.mjs";

/** Drafts land at the end of any future published ordering. */
const DRAFT_ORDER = 900;

const KIND_COLORS = Object.freeze({
  photo: "cobalt",
  event: "coral",
  quote: "pink",
  person: "amber",
  project: "lilac",
});

/**
 * Read the same-name `.txt` sidecar. Only `key: value` lines are meaningful;
 * everything else is ignored so captions can stay prose.
 */
export function parseSidecar(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const fields = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = /^([A-Za-z][A-Za-z-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (match) fields[match[1].toLowerCase()] = match[2].trim();
  }
  return fields;
}

export function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "album-entry";
}

/** "shillong-office" becomes "Shillong office". */
export function titleFromSlug(slug) {
  const words = slug.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function greatestCommonDivisor(left, right) {
  return right === 0 ? left : greatestCommonDivisor(right, left % right);
}

export function aspectRatio(width, height) {
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor} / ${height / divisor}`;
}

/** Map a source aspect to the album grid's four roles. */
export function sizeForAspect(width, height) {
  const ratio = width / height;
  if (ratio < 0.9) return "tall";
  if (ratio <= 1.1) return "square";
  if (ratio < 1.5) return "hero";
  return "wide";
}

export function colorForKind(kind) {
  return KIND_COLORS[kind] ?? "cobalt";
}

export function normalizeKind(value, warnings) {
  const kind = (value ?? "").trim().toLowerCase();
  if (beyondKinds.includes(kind)) return kind;
  if (kind) warnings.push(`unknown kind "${kind}"; using photo`);
  return "photo";
}

/**
 * A photo cleared for publication only when the sidecar says the frame holds
 * nobody else. Anything else starts as needs-consent.
 */
export function privacyForPeople(people) {
  const cleared = (people ?? "").trim().toLowerCase().replace(/\.$/, "") === "only me";
  return cleared ? undefined : "needs-consent";
}

function quoted(value) {
  return JSON.stringify(value);
}

export function renderDraft({
  slug,
  kind,
  title,
  caption,
  privacy,
  color,
  size,
  src,
  alt,
  aspect,
  dominantColor,
  placeholder,
  renditions,
}) {
  const lines = [
    "---",
    `id: ${quoted(slug)}`,
    'status: "draft"',
    `order: ${DRAFT_ORDER}`,
    `kind: ${quoted(kind)}`,
    `title: ${quoted(title)}`,
    `caption: ${quoted(caption)}`,
    "tags: []",
  ];

  if (privacy) lines.push(`privacy: ${quoted(privacy)}`);

  lines.push(
    `color: ${quoted(color)}`,
    `size: ${quoted(size)}`,
    "image:",
    `  src: ${quoted(src)}`,
    `  alt: ${quoted(alt)}`,
    `  aspectRatio: ${quoted(aspect)}`,
    `  dominantColor: ${quoted(dominantColor)}`,
    `  placeholder: ${quoted(placeholder)}`,
    "  renditions:"
  );

  for (const rendition of renditions) {
    lines.push(
      `    - w: ${rendition.w}`,
      `      avif: ${quoted(rendition.avif)}`,
      `      webp: ${quoted(rendition.webp)}`,
      `      bytes: ${rendition.bytes}`
    );
  }

  lines.push("---", "");
  return lines.join("\n");
}
