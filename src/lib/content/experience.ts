import { cache } from "react";
import path from "path";
import type { ChronicleEntry, ExperiencePoint, PortfolioStatus } from "@/types";
import { expectedContentCounts, hasBalancedEmphasis, statusValues } from "@/lib/portfolioSchema.mjs";
import {
  byOrder,
  ensureUnique,
  enumValue,
  fail,
  listMdxFiles,
  nonEmptyObjectArray,
  nonEmptyStringArray,
  numberValue,
  optionalObject,
  optionalObjectArray,
  optionalNonEmptyString,
  readExperienceImage,
  readFrontmatter,
  stringValue,
  type Frontmatter,
} from "./shared";

function readPoint(point: Frontmatter, filePath: string): ExperiencePoint {
  const emphasis = optionalNonEmptyString(point, "emphasis", filePath);
  const rawMetric = optionalObject(point, "metric", filePath);
  const detail = stringValue(point, "detail", filePath);
  if (!hasBalancedEmphasis(detail)) {
    fail(filePath, `experience detail has unbalanced or empty **bold** markers: "${detail}"`);
  }
  return {
    lead: stringValue(point, "lead", filePath),
    detail,
    ...(emphasis ? { emphasis } : {}),
    ...(rawMetric
      ? { metric: { label: stringValue(rawMetric, "label", filePath), value: stringValue(rawMetric, "value", filePath) } }
      : {}),
  };
}

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
        points: nonEmptyObjectArray(workstream, "points", filePath).map((point) => readPoint(point, filePath)),
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
      summaryPoints: rawSummaryPoints.map((point) => readPoint(point, filePath)),
      workstreams,
    };
  });
  ensureUnique(entries.map((entry) => entry.slug), "chronicle slug");
  return entries.filter((entry) => entry.status === "published").sort(byOrder);
});
