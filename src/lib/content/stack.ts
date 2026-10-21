import { cache } from "react";
import type { PortfolioStatus, StackContext, StackGroup, StackIconName, StackSkill, StackTone } from "@/types";
import { stackContextValues, stackIconNames, stackToneValues, statusValues } from "@/lib/portfolioSchema.mjs";
import {
  booleanValue,
  byOrder,
  ensureUnique,
  enumValue,
  fail,
  listMdxFiles,
  numberValue,
  objectArray,
  optionalString,
  readFrontmatter,
  stringValue,
} from "./shared";

export const getStackGroups = cache((): StackGroup[] => {
  const groups = listMdxFiles("stack").map((filePath) => {
    const data = readFrontmatter(filePath);
    const skills: StackSkill[] = objectArray(data, "skills", filePath).map((skill) => ({
      label: stringValue(skill, "label", filePath),
      icon: enumValue(skill, "icon", stackIconNames, filePath) as StackIconName,
    }));
    if (skills.length === 0) {
      fail(filePath, `"skills" must list at least one skill`);
    }
    ensureUnique(skills.map((skill) => skill.label), `stack skill in ${filePath}`);
    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999, filePath),
      label: stringValue(data, "label", filePath),
      context: enumValue(data, "context", stackContextValues, filePath) as StackContext,
      tone: enumValue(data, "tone", stackToneValues, filePath) as StackTone,
      featured: booleanValue(data, "featured", false, filePath),
      summary: optionalString(data, "summary", filePath),
      skills,
    };
  });
  ensureUnique(groups.map((group) => group.id), "stack id");
  const published = groups.filter((group) => group.status === "published").sort(byOrder);
  ensureUnique(published.flatMap((group) => group.skills.map((skill) => skill.label)), "stack skill");
  ensureUnique(published.map((group) => group.tone), "stack tone");
  if (published.filter((group) => group.featured).length !== 1) {
    throw new Error("[portfolio-content] stack: exactly one published group must be featured");
  }
  return published;
});
