/** @type {readonly ["draft", "published"]} */
export const statusValues = ["draft", "published"];

/** @type {readonly ["terminal", "cloud", "database", "sparkles", "cpu"]} */
export const projectIcons = ["terminal", "cloud", "database", "sparkles", "cpu"];

/** @type {readonly ["Used at work", "Part of my workflow", "Built in projects"]} */
export const stackContextValues = ["Used at work", "Part of my workflow", "Built in projects"];

/** @type {readonly ["lovebird", "petrol", "burgundy", "cornflower", "glacier"]} */
export const stackToneValues = ["lovebird", "petrol", "burgundy", "cornflower", "glacier"];

/**
 * Every glyph a stack chip may name. src/components/art/stack-icons/icons.ts
 * must draw exactly these (its record is typed from this list), and both the
 * loader and the content check reject any other name, so a chip can never fall
 * back to a stand-in icon silently.
 * @type {readonly ["claude-code", "codex", "agents", "checklist", "review", "browser-check", "context", "mcp", "rag", "evals", "llm-apis", "agent-frameworks", "guardrails", "java", "spring", "key", "api", "websocket", "bolt", "repeat-equals", "kafka", "microservices", "typescript", "react", "nextjs", "motion", "cube", "mdx", "cloud", "pipeline", "github-actions", "docker", "steps", "python", "kubernetes", "terraform", "observability", "database", "postgresql", "table", "gauge", "chart"]}
 */
export const stackIconNames = [
  "claude-code",
  "codex",
  "agents",
  "checklist",
  "review",
  "browser-check",
  "context",
  "mcp",
  "rag",
  "evals",
  "llm-apis",
  "agent-frameworks",
  "guardrails",
  "java",
  "spring",
  "key",
  "api",
  "websocket",
  "bolt",
  "repeat-equals",
  "kafka",
  "microservices",
  "typescript",
  "react",
  "nextjs",
  "motion",
  "cube",
  "mdx",
  "cloud",
  "pipeline",
  "github-actions",
  "docker",
  "steps",
  "python",
  "kubernetes",
  "terraform",
  "observability",
  "database",
  "postgresql",
  "table",
  "gauge",
  "chart",
];

/** @type {readonly ["sage", "peach", "sky", "sand"]} */
export const accents = ["sage", "peach", "sky", "sand"];

/** @type {readonly ["photo", "event", "quote", "person", "project"]} */
export const beyondKinds = ["photo", "event", "quote", "person", "project"];

/** @type {readonly ["cobalt", "coral", "lemon", "amber", "lilac", "pink"]} */
export const beyondColors = ["cobalt", "coral", "lemon", "amber", "lilac", "pink"];

/** @type {readonly ["hero", "wide", "tall", "square"]} */
export const beyondSizes = ["hero", "wide", "tall", "square"];

/** @type {readonly ["needs-consent", "cleared"]} */
export const beyondPrivacyValues = ["needs-consent", "cleared"];

/** @type {readonly [480, 960, 1600]} */
export const beyondRenditionWidths = [480, 960, 1600];

/** Per-file byte caps by rendition width. */
/** @type {Readonly<Record<number, number>>} */
export const beyondRenditionCaps = Object.freeze({
  480: 60 * 1024,
  960: 140 * 1024,
  1600: 280 * 1024,
});

/** @type {readonly ["github", "linkedin", "email"]} */
export const socialPlatforms = ["github", "linkedin", "email"];

/** @type {readonly ["desktop", "mobile"]} */
export const projectStoryViewports = ["desktop", "mobile"];

/** @type {Readonly<{src: "src", alt: "alt", width: "width", height: "height"}>} */
export const projectOgImageSchema = Object.freeze({
  src: "src",
  alt: "alt",
  width: "width",
  height: "height",
});

/** @type {readonly ["day", "night"]} */
export const projectStoryThemes = ["day", "night"];

/** @type {readonly ["velo-business", "saffron-routes"]} */
export const projectTenantIds = ["velo-business", "saffron-routes"];

/** @type {readonly ["tenant-switcher", "theme-comparison", "schedule"]} */
export const projectStoryLayouts = ["tenant-switcher", "theme-comparison", "schedule"];

/** @type {readonly ["rider", "dispatch", "driver"]} */
export const projectTripRoles = ["rider", "dispatch", "driver"];

export const expectedContentCounts = Object.freeze({
  heroFacts: 2,
  hintCopyLines: 2,
  profileProofLines: 4,
  orchestrationSteps: 4,
  experienceSummaryPoints: 6,
  experienceWorkstreams: 4,
  storyboardTripSteps: 3,
});

export const expectedHeroFactLinks = Object.freeze([
  Object.freeze({ label: "At work", href: "#experience" }),
  Object.freeze({ label: "On my own", href: "#work" }),
]);

/** @returns {never} */
function invalidField(filePath, field, expected) {
  throw new Error(`[portfolio-content] ${filePath}: "${field}" must be ${expected}`);
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {string} */
export function stringField(data, key, filePath, field = key) {
  const value = data[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    invalidField(filePath, field, "a non-empty string");
  }
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {string | undefined} */
export function optionalStringField(data, key, filePath, field = key) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0) {
    invalidField(filePath, field, "a non-empty string");
  }
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {string | null | undefined} */
export function optionalNullableStringField(data, key, filePath, field = key) {
  const value = data[key];
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || value.trim().length === 0) {
    invalidField(filePath, field, "a non-empty string or null");
  }
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {Record<string, unknown>} */
export function objectField(data, key, filePath, field = key) {
  const value = data[key];
  if (!isRecord(value)) invalidField(filePath, field, "an object");
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {Record<string, unknown> | undefined} */
export function optionalObjectField(data, key, filePath, field = key) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (!isRecord(value)) invalidField(filePath, field, "an object");
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {number} fallback @param {string} [field] @returns {number} */
export function optionalNumberField(data, key, filePath, fallback, field = key) {
  const value = data[key];
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    invalidField(filePath, field, "a finite number");
  }
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {boolean} fallback @param {string} [field] @returns {boolean} */
export function optionalBooleanField(data, key, filePath, fallback, field = key) {
  const value = data[key];
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") invalidField(filePath, field, "a boolean");
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {string[]} */
export function optionalStringArrayField(data, key, filePath, field = key) {
  const value = data[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    invalidField(filePath, field, "an array of strings");
  }
  return value;
}

/** @param {Record<string, unknown>} data @param {string} key @param {string} filePath @param {string} [field] @returns {Record<string, unknown>[]} */
export function optionalObjectArrayField(data, key, filePath, field = key) {
  const value = data[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => !isRecord(item))) {
    invalidField(filePath, field, "an array of objects");
  }
  return value;
}

/**
 * Inline emphasis syntax for experience copy: `**bold**`. Markers must pair up,
 * hold text, and never nest or touch whitespace on their inside edge.
 * @param {string} text @returns {boolean}
 */
export function hasBalancedEmphasis(text) {
  const parts = text.split("**");
  if (parts.length % 2 === 0) return false;
  if (text.includes("***")) return false;
  return parts.every((part, index) => index % 2 === 0 || (part.length > 0 && part === part.trim()));
}
