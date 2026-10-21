import { cache } from "react";
import type { PortfolioStatus, StackContext, StackGroup } from "@/types";
import { stackContextValues, statusValues } from "@/lib/portfolioSchema.mjs";
import { byOrder, ensureUnique, enumValue, listMdxFiles, numberValue, readFrontmatter, stringValue, booleanValue } from "./shared";

export const getStackGroups = cache((): StackGroup[] => {
  const groups = listMdxFiles("stack").map((filePath) => {
    const data = readFrontmatter(filePath);
    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999, filePath),
      label: stringValue(data, "label", filePath),
      context: enumValue(data, "context", stackContextValues, filePath) as StackContext,
      highlighted: booleanValue(data, "highlighted", false, filePath),
    };
  });
  ensureUnique(groups.map((group) => group.id), "stack id");
  return groups.filter((group) => group.status === "published").sort(byOrder);
});
