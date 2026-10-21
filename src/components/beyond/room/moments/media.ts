import type { BeyondAlbumItem } from "@/types";

type BeyondItemWithAssets = BeyondAlbumItem & {
  renditions?: unknown;
  placeholder?: unknown;
};

const colorByKind = {
  cobalt: "#3FA9F5",
  coral: "#FF7A3D",
  lemon: "#FFE05A",
  amber: "#FFE05A",
  lilac: "#B9A3FF",
  pink: "#B9A3FF",
} as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function sourceFrom(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  return typeof record?.src === "string" ? record.src : undefined;
}

function renditionFrom(value: unknown, width: number): string | undefined {
  if (Array.isArray(value)) {
    const match = value.find((entry) => asRecord(entry)?.width === width);
    return sourceFrom(match);
  }

  const record = asRecord(value);
  if (!record) return undefined;

  const exact = sourceFrom(record[String(width)]);
  if (exact) return exact;

  const options = Object.values(record)
    .map((entry) => ({ entry, width: asRecord(entry)?.width }))
    .filter((entry): entry is { entry: unknown; width: number } =>
      typeof entry.width === "number"
    )
    .sort((left, right) => left.width - right.width);
  const chosen = options.find((entry) => entry.width >= width) ?? options.at(-1);
  return sourceFrom(chosen?.entry);
}

export function getBeyondImageSrc(
  item: BeyondAlbumItem,
  width: 480 | 960 | 1600
): string | undefined {
  const withAssets = item as BeyondItemWithAssets;
  const image = asRecord(item.image);
  const sources = [withAssets.renditions, image?.renditions];

  for (const renditionSet of sources) {
    const src = renditionFrom(renditionSet, width);
    if (src) return src;
  }

  return item.image?.src;
}

export function getBeyondPlaceholder(item: BeyondAlbumItem): string | undefined {
  const withAssets = item as BeyondItemWithAssets;
  const record = asRecord(withAssets.placeholder);
  const value =
    typeof withAssets.placeholder === "string"
      ? withAssets.placeholder
      : typeof record?.src === "string"
        ? record.src
        : typeof record?.dataUrl === "string"
          ? record.dataUrl
          : undefined;
  return value && (value.startsWith("/") || value.startsWith("data:image/"))
    ? value
    : undefined;
}

export function getMomentColor(item: BeyondAlbumItem): string {
  return colorByKind[item.color];
}

export function getMomentPlaceholderColor(item: BeyondAlbumItem): string {
  const withAssets = item as BeyondItemWithAssets;
  const record = asRecord(withAssets.placeholder);
  const value = record?.color ?? record?.dominantColor ?? item.image?.dominantColor;
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
    ? value
    : getMomentColor(item);
}
