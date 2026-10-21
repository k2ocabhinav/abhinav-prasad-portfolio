import { expect, test } from "@playwright/test";
import {
  objectField,
  optionalBooleanField,
  optionalNumberField,
  optionalObjectArrayField,
  optionalObjectField,
  optionalStringArrayField,
  optionalStringField,
  stringField,
} from "../src/lib/portfolioSchema.mjs";

const projectFile = "src/content/portfolio/projects/velo.mdx";

test("malformed optional detail object reports the file, field, and expected type", () => {
  expect(() => optionalObjectField({ detail: "yes" }, "detail", projectFile)).toThrow(
    `[portfolio-content] ${projectFile}: "detail" must be an object`
  );
});

test("malformed detail enabled flag reports the nested field and expected type", () => {
  expect(() => optionalBooleanField({ enabled: "true" }, "enabled", projectFile, false, "detail.enabled")).toThrow(
    `[portfolio-content] ${projectFile}: "detail.enabled" must be a boolean`
  );
});

test("numeric required title reports the file, field, and expected type", () => {
  expect(() => stringField({ title: 42 }, "title", projectFile)).toThrow(
    `[portfolio-content] ${projectFile}: "title" must be a non-empty string`
  );
});

test("malformed optional strings, numbers, and arrays name their expected types", () => {
  expect(() => optionalStringField({ summary: 42 }, "summary", projectFile)).toThrow(
    `[portfolio-content] ${projectFile}: "summary" must be a non-empty string`
  );
  expect(() => optionalNumberField({ order: "1" }, "order", projectFile, 999)).toThrow(
    `[portfolio-content] ${projectFile}: "order" must be a finite number`
  );
  expect(() => optionalObjectArrayField({ screenshots: "image.webp" }, "screenshots", projectFile)).toThrow(
    `[portfolio-content] ${projectFile}: "screenshots" must be an array of objects`
  );
  expect(() => optionalStringArrayField({ tags: {} }, "tags", projectFile)).toThrow(
    `[portfolio-content] ${projectFile}: "tags" must be an array of strings`
  );
});

test("optional values default only when absent", () => {
  expect(optionalObjectField({}, "detail", projectFile)).toBeUndefined();
  expect(optionalBooleanField({}, "enabled", projectFile, false)).toBe(false);
  expect(optionalNumberField({}, "order", projectFile, 999)).toBe(999);
  expect(optionalStringField({}, "summary", projectFile)).toBeUndefined();
  expect(optionalObjectArrayField({}, "screenshots", projectFile)).toEqual([]);
  expect(optionalStringArrayField({}, "tags", projectFile)).toEqual([]);
  expect(objectField({ detail: {} }, "detail", projectFile)).toEqual({});
});
