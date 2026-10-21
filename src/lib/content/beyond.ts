import { cache } from "react";
import type {
  BeyondAlbumColor,
  BeyondAlbumKind,
  BeyondAlbumPrivacy,
  BeyondAlbumRendition,
  BeyondAlbumSize,
  PortfolioBeyondAlbumItem,
  PortfolioStatus,
} from "@/types";
import {
  beyondColors,
  beyondKinds,
  beyondPrivacyValues,
  beyondRenditionWidths,
  beyondSizes,
  statusValues,
} from "@/lib/portfolioSchema.mjs";
import type { Frontmatter } from "./shared";
import {
  byOrder,
  ensureUnique,
  enumValue,
  fail,
  listMdxFiles,
  numberValue,
  optionalObject,
  optionalObjectArray,
  optionalString,
  positiveIntegerValue,
  readFrontmatter,
  stringArray,
  stringValue,
  validatePublicAsset,
} from "./shared";

function readRendition(data: Frontmatter, filePath: string): BeyondAlbumRendition {
  const width = data.w;
  if (typeof width !== "number" || !(beyondRenditionWidths as readonly number[]).includes(width)) {
    fail(filePath, `"image.renditions[].w" must be one of: ${beyondRenditionWidths.join(", ")}`);
  }

  const avif = stringValue(data, "avif", filePath);
  const webp = stringValue(data, "webp", filePath);
  validatePublicAsset(avif, filePath);
  validatePublicAsset(webp, filePath);

  return {
    w: width as BeyondAlbumRendition["w"],
    avif,
    webp,
    bytes: positiveIntegerValue(data, "bytes", filePath),
  };
}

export const getBeyondAlbumItems = cache((): PortfolioBeyondAlbumItem[] => {
  const items = listMdxFiles("beyond").map((filePath) => {
    const data = readFrontmatter(filePath);
    const image = optionalObject(data, "image", filePath);
    const src = image ? optionalString(image, "src", filePath, "image.src") : undefined;
    validatePublicAsset(src, filePath);

    const renditions = image
      ? optionalObjectArray(image, "renditions", filePath).map((rendition) =>
          readRendition(rendition, filePath)
        )
      : [];

    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999, filePath),
      kind: enumValue(data, "kind", beyondKinds, filePath) as BeyondAlbumKind,
      title: stringValue(data, "title", filePath),
      caption: stringValue(data, "caption", filePath),
      tags: stringArray(data, "tags", filePath),
      quote: optionalString(data, "quote", filePath),
      meta: optionalString(data, "meta", filePath),
      privacy: data.privacy === undefined
        ? undefined
        : (enumValue(data, "privacy", beyondPrivacyValues, filePath) as BeyondAlbumPrivacy),
      color: enumValue(data, "color", beyondColors, filePath) as BeyondAlbumColor,
      size: enumValue(data, "size", beyondSizes, filePath) as BeyondAlbumSize,
      image: image
        ? {
            src,
            alt: stringValue(image, "alt", filePath),
            aspectRatio: optionalString(image, "aspectRatio", filePath, "image.aspectRatio"),
            dominantColor: optionalString(image, "dominantColor", filePath, "image.dominantColor"),
            ...(renditions.length > 0 ? { renditions } : {}),
            placeholder: optionalString(image, "placeholder", filePath, "image.placeholder"),
          }
        : undefined,
    };
  });
  ensureUnique(items.map((item) => item.id), "beyond item id");
  return items.filter((item) => item.status === "published").sort(byOrder);
});
