import { cache } from "react";
import type { PortfolioStatus, ServiceEntry } from "@/types";
import { accents, statusValues } from "@/lib/portfolioSchema.mjs";
import { byOrder, ensureUnique, enumValue, listMdxFiles, numberValue, optionalEnum, optionalStringArray, readFrontmatter, stringValue } from "./shared";

export const getServiceEntries = cache((): ServiceEntry[] => {
  const services = listMdxFiles("services").map((filePath) => {
    const data = readFrontmatter(filePath);
    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999, filePath),
      title: stringValue(data, "title", filePath),
      description: stringValue(data, "description", filePath),
      icon: stringValue(data, "icon", filePath),
      accent: optionalEnum(data, "accent", accents, "sage", filePath),
      tags: optionalStringArray(data, "tags", filePath),
    };
  });
  ensureUnique(services.map((service) => service.id), "service id");
  return services.filter((service) => service.status === "published").sort(byOrder);
});
