import { cache } from "react";
import type { BeyondAlbumColor, BeyondAlbumKind, BeyondAlbumSize, PortfolioBeyondAlbumItem, PortfolioStatus } from "@/types";
import { beyondColors, beyondKinds, beyondSizes, statusValues } from "@/lib/portfolioSchema.mjs";
import { byOrder, ensureUnique, enumValue, listMdxFiles, numberValue, optionalObject, optionalString, readFrontmatter, stringArray, stringValue, validatePublicAsset } from "./shared";

export const getBeyondAlbumItems = cache((): PortfolioBeyondAlbumItem[] => {
  const items = listMdxFiles("beyond").map((filePath) => {
    const data = readFrontmatter(filePath);
    const image = optionalObject(data, "image", filePath);
    const src = image ? optionalString(image, "src", filePath, "image.src") : undefined;
    validatePublicAsset(src, filePath);

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
      color: enumValue(data, "color", beyondColors, filePath) as BeyondAlbumColor,
      size: enumValue(data, "size", beyondSizes, filePath) as BeyondAlbumSize,
      image: image
        ? {
            src,
            alt: stringValue(image, "alt", filePath),
            aspectRatio: optionalString(image, "aspectRatio", filePath, "image.aspectRatio"),
            dominantColor: optionalString(image, "dominantColor", filePath, "image.dominantColor"),
          }
        : undefined,
    };
  });
  ensureUnique(items.map((item) => item.id), "beyond item id");
  return items.filter((item) => item.status === "published").sort(byOrder);
});
