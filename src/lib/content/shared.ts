import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { ExperienceVisual, ProjectOgImage, ProjectVisual } from "@/types";
import {
  objectField,
  optionalBooleanField,
  optionalNullableStringField,
  optionalNumberField,
  optionalObjectArrayField,
  optionalObjectField,
  optionalStringArrayField,
  optionalStringField,
  projectOgImageSchema,
  stringField,
} from "@/lib/portfolioSchema.mjs";

export const CONTENT_ROOT = path.join(process.cwd(), "src/content/portfolio");
const PUBLIC_ROOT = path.join(process.cwd(), "public");

export type Frontmatter = Record<string, unknown>;

export function fail(filePath: string, message: string): never {
  throw new Error(`[portfolio-content] ${path.relative(process.cwd(), filePath)}: ${message}`);
}

export function readFrontmatter(filePath: string): Frontmatter {
  if (!fs.existsSync(filePath)) {
    fail(filePath, "file not found");
  }

  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  return parsed.data;
}

export function listMdxFiles(relativeDir: string): string[] {
  const dir = path.join(CONTENT_ROOT, relativeDir);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file))
    .sort();
}

export function objectValue(data: Frontmatter, key: string, filePath: string): Frontmatter {
  return objectField(data, key, path.relative(process.cwd(), filePath));
}

export function optionalObject(data: Frontmatter, key: string, filePath: string, field = key): Frontmatter | undefined {
  return optionalObjectField(data, key, path.relative(process.cwd(), filePath), field);
}

export function stringValue(data: Frontmatter, key: string, filePath: string): string {
  return stringField(data, key, path.relative(process.cwd(), filePath));
}

export function optionalString(data: Frontmatter, key: string, filePath: string, field = key): string | undefined {
  return optionalStringField(data, key, path.relative(process.cwd(), filePath), field);
}

export function optionalNonEmptyString(data: Frontmatter, key: string, filePath: string): string | undefined {
  return optionalString(data, key, filePath);
}

export function nullableString(data: Frontmatter, key: string, filePath: string): string | null | undefined {
  return optionalNullableStringField(data, key, path.relative(process.cwd(), filePath));
}

export function numberValue(data: Frontmatter, key: string, fallback: number, filePath: string): number {
  return optionalNumberField(data, key, path.relative(process.cwd(), filePath), fallback);
}

export function positiveNumberValue(data: Frontmatter, key: string, filePath: string): number {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    fail(filePath, `missing positive number "${key}"`);
  }
  return value;
}

export function positiveIntegerValue(data: Frontmatter, key: string, filePath: string): number {
  const value = data[key];
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    fail(filePath, `missing positive integer "${key}"`);
  }
  return value;
}

export function booleanValue(data: Frontmatter, key: string, fallback: boolean, filePath: string, field = key): boolean {
  return optionalBooleanField(data, key, path.relative(process.cwd(), filePath), fallback, field);
}

export function stringArray(data: Frontmatter, key: string, filePath: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(filePath, `missing string array "${key}"`);
  }
  return value as string[];
}

export function nonEmptyStringArray(data: Frontmatter, key: string, filePath: string): string[] {
  const values = stringArray(data, key, filePath);
  if (values.length === 0 || values.some((value) => value.trim().length === 0)) {
    fail(filePath, `"${key}" must contain at least one non-empty string`);
  }
  return values;
}

export function optionalStringArray(data: Frontmatter, key: string, filePath: string): string[] {
  return optionalStringArrayField(data, key, path.relative(process.cwd(), filePath));
}

export function objectArray(data: Frontmatter, key: string, filePath: string): Frontmatter[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    fail(filePath, `missing object array "${key}"`);
  }
  return value as Frontmatter[];
}

export function nonEmptyObjectArray(data: Frontmatter, key: string, filePath: string): Frontmatter[] {
  const values = objectArray(data, key, filePath);
  if (values.length === 0) {
    fail(filePath, `"${key}" must contain at least one object`);
  }
  return values;
}

export function optionalObjectArray(data: Frontmatter, key: string, filePath: string): Frontmatter[] {
  return optionalObjectArrayField(data, key, path.relative(process.cwd(), filePath));
}

export function enumValue<T extends readonly string[]>(
  data: Frontmatter,
  key: string,
  values: T,
  filePath: string
): T[number] {
  const value = stringValue(data, key, filePath);
  if (!values.includes(value)) {
    fail(filePath, `"${key}" must be one of: ${values.join(", ")}`);
  }
  return value as T[number];
}

export function optionalEnum<T extends readonly string[]>(
  data: Frontmatter,
  key: string,
  values: T,
  fallback: T[number],
  filePath: string
): T[number] {
  const value = data[key];
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !values.includes(value)) {
    fail(filePath, `"${key}" must be one of: ${values.join(", ")}`);
  }
  return value as T[number];
}

export function validatePublicAsset(src: string | undefined, filePath: string) {
  if (!src) {
    return;
  }

  // Images are served from public/ only; next.config.ts declares no
  // remotePatterns, so a remote URL would render broken.
  if (!src.startsWith("/") || src.startsWith("//")) {
    fail(filePath, `asset path "${src}" must be a local path starting with "/"`);
  }

  const diskPath = path.resolve(PUBLIC_ROOT, src.slice(1));
  const relativePath = path.relative(PUBLIC_ROOT, diskPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    fail(filePath, `asset path "${src}" must stay inside public/`);
  }

  if (!fs.existsSync(diskPath)) {
    fail(filePath, `asset not found: public${src}`);
  }
}

export function ensureUnique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`[portfolio-content] duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

export function byOrder<T extends { order?: number; id?: string; slug?: string }>(a: T, b: T) {
  return (a.order ?? 999) - (b.order ?? 999) || (a.id ?? a.slug ?? "").localeCompare(b.id ?? b.slug ?? "");
}

export function readImage(data: Frontmatter, filePath: string): ProjectVisual {
  const src = stringValue(data, "src", filePath);
  validatePublicAsset(src, filePath);
  const frameAspectRatio = data.frameAspectRatio;
  if (frameAspectRatio !== undefined &&
      (typeof frameAspectRatio !== "number" || !Number.isFinite(frameAspectRatio) || frameAspectRatio < 0.2 || frameAspectRatio > 5)) {
    fail(filePath, 'optional "frameAspectRatio" must be a number between 0.2 and 5');
  }
  return {
    src,
    alt: stringValue(data, "alt", filePath),
    caption: stringValue(data, "caption", filePath),
    ...(typeof frameAspectRatio === "number" ? { frameAspectRatio } : {}),
  };
}

export function readOgImage(data: Frontmatter, filePath: string): ProjectOgImage {
  const image: ProjectOgImage = {
    src: stringValue(data, projectOgImageSchema.src, filePath),
    alt: stringValue(data, projectOgImageSchema.alt, filePath),
    width: positiveIntegerValue(data, projectOgImageSchema.width, filePath),
    height: positiveIntegerValue(data, projectOgImageSchema.height, filePath),
  };
  validatePublicAsset(image.src, filePath);
  return image;
}

export function readExperienceImage(data: Frontmatter, filePath: string): ExperienceVisual {
  const image: ExperienceVisual = {
    src: stringValue(data, "src", filePath),
    alt: stringValue(data, "alt", filePath),
    caption: stringValue(data, "caption", filePath),
    width: positiveNumberValue(data, "width", filePath),
    height: positiveNumberValue(data, "height", filePath),
  };
  validatePublicAsset(image.src, filePath);
  return image;
}
