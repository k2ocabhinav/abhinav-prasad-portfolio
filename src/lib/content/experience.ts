import { cache } from "react";
import path from "path";
import type { ChronicleEntry, PortfolioStatus } from "@/types";
import { expectedContentCounts, statusValues } from "@/lib/portfolioSchema.mjs";
import {
  byOrder,
  ensureUnique,
  enumValue,
  fail,
  listMdxFiles,
  nonEmptyObjectArray,
  nonEmptyStringArray,
  numberValue,
  optionalObjectArray,
  optionalNonEmptyString,
  readExperienceImage,
  readFrontmatter,
  stringValue,
} from "./shared";

export const getChronicleEntries = cache((): ChronicleEntry[] => {
  const entries = listMdxFiles("chronicle").map((filePath) => {
    const data = readFrontmatter(filePath);
    const rawWorkstreams = nonEmptyObjectArray(data, "workstreams", filePath);
    if (rawWorkstreams.length !== expectedContentCounts.experienceWorkstreams) {
      fail(filePath, `"workstreams" must contain ${expectedContentCounts.experienceWorkstreams} full-experience sections`);
    }
    const rawSummaryPoints = nonEmptyObjectArray(data, "summaryPoints", filePath);
    if (rawSummaryPoints.length !== expectedContentCounts.experienceSummaryPoints) {
      fail(filePath, `"summaryPoints" must contain ${expectedContentCounts.experienceSummaryPoints} visible experience points`);
    }
    const workstreams = rawWorkstreams.map((workstream) => {
      const tools = nonEmptyStringArray(workstream, "tools", filePath);
      ensureUnique(tools, `tool in workstream "${stringValue(workstream, "id", filePath)}"`);
      const images = optionalObjectArray(workstream, "images", filePath)
        .map((image) => readExperienceImage(image, filePath));

      return {
        id: stringValue(workstream, "id", filePath),
        title: stringValue(workstream, "title", filePath),
        summary: stringValue(workstream, "summary", filePath),
        points: nonEmptyObjectArray(workstream, "points", filePath).map((point) => {
          const emphasis = optionalNonEmptyString(point, "emphasis", filePath);
          return {
            lead: stringValue(point, "lead", filePath),
            detail: stringValue(point, "detail", filePath),
            ...(emphasis ? { emphasis } : {}),
          };
        }),
        tools,
        ...(images.length > 0 ? { images } : {}),
      };
    });

    ensureUnique(
      workstreams.map((workstream) => workstream.id),
      `workstream id in ${path.relative(process.cwd(), filePath)}`
    );

    return {
      slug: stringValue(data, "slug", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999, filePath),
      company: stringValue(data, "company", filePath),
      period: stringValue(data, "period", filePath),
      companyContext: stringValue(data, "companyContext", filePath),
      roleTitle: stringValue(data, "roleTitle", filePath),
      roleScope: stringValue(data, "roleScope", filePath),
      employmentNote: stringValue(data, "employmentNote", filePath),
      summaryPoints: rawSummaryPoints.map((point) => {
        const emphasis = optionalNonEmptyString(point, "emphasis", filePath);
        return {
          lead: stringValue(point, "lead", filePath),
          detail: stringValue(point, "detail", filePath),
          ...(emphasis ? { emphasis } : {}),
        };
      }),
      workstreams,
    };
  });
  ensureUnique(entries.map((entry) => entry.slug), "chronicle slug");
  return entries.filter((entry) => entry.status === "published").sort(byOrder);
});
