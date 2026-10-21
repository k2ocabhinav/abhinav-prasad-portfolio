import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  accents as accentValues,
  beyondColors as beyondColorValues,
  beyondKinds as beyondKindValues,
  beyondPrivacyValues as beyondPrivacyValueList,
  beyondRenditionCaps,
  beyondRenditionWidths,
  beyondSizes as beyondSizeValues,
  expectedContentCounts,
  expectedHeroFactLinks,
  projectIcons as projectIconValues,
  projectStoryLayouts as projectStoryLayoutValues,
  projectStoryThemes as projectStoryThemeValues,
  projectStoryViewports as projectStoryViewportValues,
  projectOgImageSchema,
  projectTenantIds as projectTenantValues,
  projectTripRoles as projectTripRoleValues,
  socialPlatforms as socialPlatformValues,
  stackContextValues as stackContextValueList,
  statusValues as statusValueList,
  objectField,
  optionalBooleanField,
  optionalNullableStringField,
  optionalNumberField,
  optionalObjectArrayField,
  optionalObjectField,
  optionalStringArrayField,
  optionalStringField,
  stringField,
} from "../src/lib/portfolioSchema.mjs";

const root = process.cwd();
const contentRoot = path.join(root, "src/content/portfolio");
const publicRoot = path.join(root, "public");
const statuses = new Set(statusValueList);
const projectIcons = new Set(projectIconValues);
const stackContextValues = new Set(stackContextValueList);
const accents = new Set(accentValues);
const beyondKinds = new Set(beyondKindValues);
const beyondColors = new Set(beyondColorValues);
const beyondPrivacyValues = new Set(beyondPrivacyValueList);
const beyondSizes = new Set(beyondSizeValues);
const projectStoryViewports = new Set(projectStoryViewportValues);
const projectStoryThemes = new Set(projectStoryThemeValues);
const projectStoryLayouts = new Set(projectStoryLayoutValues);
const projectTenantIds = new Set(projectTenantValues);
const projectTripRoles = new Set(projectTripRoleValues);
const socialPlatforms = new Set(socialPlatformValues);

function rel(filePath) {
  return path.relative(root, filePath);
}

function fail(filePath, message) {
  throw new Error(`[portfolio-content] ${rel(filePath)}: ${message}`);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(filePath, "file not found");
  }
  return matter(fs.readFileSync(filePath, "utf8")).data;
}

function mdxFiles(section) {
  const dir = path.join(contentRoot, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file))
    .sort();
}

function stringValue(data, key, filePath) {
  return stringField(data, key, rel(filePath));
}

function optionalString(data, key, filePath, field = key) {
  return optionalStringField(data, key, rel(filePath), field);
}

function optionalNullableString(data, key, filePath) {
  return optionalNullableStringField(data, key, rel(filePath));
}

function stringArray(data, key, filePath) {
  const value = data[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    fail(filePath, `"${key}" must be a non-empty array of non-empty strings`);
  }
  return value;
}

function optionalStringArray(data, key, filePath) {
  return optionalStringArrayField(data, key, rel(filePath));
}

function optionalNumber(data, key, filePath, fallback = 999) {
  return optionalNumberField(data, key, rel(filePath), fallback);
}

function objectValue(data, key, filePath) {
  return objectField(data, key, rel(filePath));
}

function optionalObject(data, key, filePath, field = key) {
  return optionalObjectField(data, key, rel(filePath), field);
}

function objectArray(data, key, filePath) {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    fail(filePath, `missing object array "${key}"`);
  }
  return value;
}

function optionalObjectArray(data, key, filePath) {
  return optionalObjectArrayField(data, key, rel(filePath));
}

function enumValue(data, key, values, filePath) {
  const value = stringValue(data, key, filePath);
  if (!values.has(value)) {
    fail(filePath, `"${key}" must be one of: ${Array.from(values).join(", ")}`);
  }
  return value;
}

function optionalEnum(data, key, values, filePath) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !values.has(value)) {
    fail(filePath, `"${key}" must be one of: ${Array.from(values).join(", ")}`);
  }
  return value;
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`[portfolio-content] duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function validatePublicAsset(src, filePath) {
  if (!src) return;
  // Images are served from public/ only; next.config.ts declares no
  // remotePatterns, so a remote URL would render broken.
  if (!src.startsWith("/") || src.startsWith("//")) {
    fail(filePath, `asset path "${src}" must be a local path starting with "/"`);
  }
  const diskPath = path.resolve(publicRoot, src.slice(1));
  const relativePath = path.relative(publicRoot, diskPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    fail(filePath, `asset path "${src}" must stay inside public/`);
  }
  if (!fs.existsSync(diskPath)) {
    fail(filePath, `asset not found: public${src}`);
  }
}

function validateImage(image, filePath, requireSrc = true) {
  const src = requireSrc ? stringValue(image, "src", filePath) : optionalString(image, "src", filePath);
  validatePublicAsset(src, filePath);
  stringValue(image, "alt", filePath);
  if (image.frameAspectRatio !== undefined &&
      (typeof image.frameAspectRatio !== "number" || !Number.isFinite(image.frameAspectRatio) || image.frameAspectRatio < 0.2 || image.frameAspectRatio > 5)) {
    fail(filePath, 'optional "frameAspectRatio" must be a number between 0.2 and 5');
  }
  if (requireSrc) {
    stringValue(image, "caption", filePath);
  }
}

function validateOgImage(image, filePath) {
  const src = stringValue(image, projectOgImageSchema.src, filePath);
  validatePublicAsset(src, filePath);
  stringValue(image, projectOgImageSchema.alt, filePath);
  for (const key of [projectOgImageSchema.width, projectOgImageSchema.height]) {
    const value = image[key];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
      fail(filePath, `missing positive integer "${key}"`);
    }
  }
}

// P4 storyboard validation — begin
function validateStoryboard(storyboard, filePath) {
  stringValue(storyboard, "status", filePath);
  const facts = objectArray(storyboard, "facts", filePath);
  if (facts.length === 0) fail(filePath, 'storyboard "facts" must contain at least one fact');
  facts.forEach((fact) => {
    stringValue(fact, "label", filePath);
    stringValue(fact, "value", filePath);
  });
  unique(facts.map((fact) => stringValue(fact, "label", filePath)), "storyboard fact label");

  const visuals = objectArray(storyboard, "visuals", filePath);
  if (visuals.length === 0) fail(filePath, 'storyboard "visuals" must contain at least one visual');
  visuals.forEach((visual) => {
    stringValue(visual, "id", filePath);
    enumValue(visual, "viewport", projectStoryViewports, filePath);
    optionalEnum(visual, "theme", projectStoryThemes, "day", filePath);
    optionalEnum(visual, "tenant", projectTenantIds, "velo-business", filePath);
    validateImage(visual, filePath);
  });
  const visualIds = visuals.map((visual) => stringValue(visual, "id", filePath));
  unique(visualIds, "storyboard visual id");
  const visualById = new Map(visuals.map((visual) => [stringValue(visual, "id", filePath), visual]));
  const mobileHeroVisualId = stringValue(storyboard, "mobileHeroVisualId", filePath);
  if (visualById.get(mobileHeroVisualId)?.viewport !== "mobile") {
    fail(filePath, `storyboard mobileHeroVisualId "${mobileHeroVisualId}" must reference a mobile visual`);
  }
  const tripIntro = objectValue(storyboard, "tripIntro", filePath);
  stringValue(tripIntro, "eyebrow", filePath);
  stringValue(tripIntro, "title", filePath);
  optionalString(tripIntro, "summary", filePath);
  optionalBooleanField(storyboard, "routePlate", rel(filePath), false, "storyboard.routePlate");

  const chapters = objectArray(storyboard, "chapters", filePath);
  if (chapters.length === 0) fail(filePath, 'storyboard "chapters" must contain at least one chapter');
  chapters.forEach((chapter) => {
    stringValue(chapter, "id", filePath);
    enumValue(chapter, "layout", projectStoryLayouts, filePath);
    stringValue(chapter, "eyebrow", filePath);
    stringValue(chapter, "title", filePath);
    stringValue(chapter, "summary", filePath);
    const references = stringArray(chapter, "visualIds", filePath);
    if (references.length === 0) fail(filePath, 'storyboard chapter "visualIds" must not be empty');
    references.forEach((visualId) => {
      if (!visualById.has(visualId)) {
        fail(filePath, `storyboard chapter references missing visual "${visualId}"`);
      }
    });
  });
  unique(chapters.map((chapter) => stringValue(chapter, "id", filePath)), "storyboard chapter id");

  const steps = objectArray(storyboard, "tripSteps", filePath);
  if (steps.length !== expectedContentCounts.storyboardTripSteps) {
    fail(filePath, 'storyboard "tripSteps" must contain one step for rider, dispatch, and driver');
  }
  const roles = steps.map((step) => enumValue(step, "role", projectTripRoles, filePath));
  unique(roles, "storyboard trip role");
  for (const role of projectTripRoles) {
    if (!roles.includes(role)) fail(filePath, `storyboard tripSteps is missing the "${role}" role`);
  }
  steps.forEach((step) => {
    stringValue(step, "label", filePath);
    stringValue(step, "summary", filePath);
    const visualId = stringValue(step, "visualId", filePath);
    if (!visualById.has(visualId)) {
      fail(filePath, `storyboard trip step references missing visual "${visualId}"`);
    }
  });

  const switcher = objectValue(storyboard, "tenantSwitcher", filePath);
  stringValue(switcher, "label", filePath);
  const defaultId = enumValue(switcher, "defaultId", projectTenantIds, filePath);
  const options = objectArray(switcher, "options", filePath);
  if (options.length < 2) fail(filePath, 'storyboard "tenantSwitcher.options" must contain at least two tenants');
  const optionIds = options.map((option) => enumValue(option, "id", projectTenantIds, filePath));
  unique(optionIds, "storyboard tenant id");
  if (!optionIds.includes(defaultId)) {
    fail(filePath, `storyboard default tenant "${defaultId}" is not in tenantSwitcher.options`);
  }
  options.forEach((option, index) => {
    stringValue(option, "label", filePath);
    const visualId = stringValue(option, "visualId", filePath);
    const visual = visualById.get(visualId);
    if (!visual) {
      fail(filePath, `storyboard tenant option references missing visual "${visualId}"`);
    }
    if (visual.tenant !== optionIds[index]) {
      fail(filePath, `storyboard tenant visual "${visualId}" must be tagged for "${optionIds[index]}"`);
    }
  });

  for (const key of ["mobileProof", "featureProof", "scheduleProof"]) {
    if (storyboard[key] === undefined) continue;
    const proof = objectValue(storyboard, key, filePath);
    const visualId = stringValue(proof, "visualId", filePath);
    if (!visualById.has(visualId)) {
      fail(filePath, `storyboard ${key} references missing visual "${visualId}"`);
    }
    if (key !== "scheduleProof") stringValue(proof, "title", filePath);
    stringValue(proof, "summary", filePath);
  }
}
// P4 storyboard validation — end

function validateProfile() {
  const filePath = path.join(contentRoot, "profile.mdx");
  const data = read(filePath);
  const personal = objectValue(data, "personal", filePath);
  const hero = objectValue(data, "hero", filePath);

  ["name", "fullName", "title", "subtitle", "email", "presenceDescription", "footerTagline"].forEach((key) =>
    stringValue(personal, key, filePath)
  );
  const whatsappNumber = process.env.WHATSAPP_E164?.trim();
  if (!whatsappNumber) {
    const message = "WHATSAPP_E164 is unset; the WhatsApp contact button will be hidden";
    if (process.env.VERCEL_ENV === "production") {
      fail(filePath, message);
    }
    console.warn(`[portfolio-content] ${message}`);
  } else if (!/^\+\d{10,15}$/.test(whatsappNumber)) {
    fail(filePath, "WHATSAPP_E164 must be an E.164 number");
  }
  if (stringArray(personal, "hintCopy", filePath).length !== expectedContentCounts.hintCopyLines) {
    fail(filePath, `"personal.hintCopy" must contain ${expectedContentCounts.hintCopyLines} lines`);
  }
  validatePublicAsset(stringValue(personal, "resumeHref", filePath), filePath);
  validatePublicAsset(stringValue(personal, "heroPhoto", filePath), filePath);
  const location = objectValue(personal, "location", filePath);
  ["city", "country", "countryCode", "timezone"].forEach((key) =>
    stringValue(location, key, filePath)
  );
  objectArray(personal, "socials", filePath).forEach((social) => {
    enumValue(social, "platform", socialPlatforms, filePath);
    stringValue(social, "label", filePath);
    stringValue(social, "href", filePath);
  });
  stringValue(hero, "displayTitle", filePath);
  stringValue(hero, "identity", filePath);
  stringValue(hero, "summary", filePath);
  const facts = objectArray(hero, "facts", filePath);
  if (facts.length !== expectedContentCounts.heroFacts) {
    fail(filePath, `"hero.facts" must contain ${expectedContentCounts.heroFacts} work and personal-build rows`);
  }
  facts.forEach((fact, index) => {
    const label = stringValue(fact, "label", filePath);
    stringValue(fact, "value", filePath);
    const href = stringValue(fact, "href", filePath);
    const expected = expectedHeroFactLinks[index];
    if (expected && (label !== expected.label || href !== expected.href)) {
      fail(filePath, `"hero.facts[${index}]" must be ${expected.label} linking to ${expected.href}`);
    }
  });
  objectArray(hero, "ctas", filePath).forEach((cta) => {
    stringValue(cta, "label", filePath);
    stringValue(cta, "href", filePath);
    enumValue(cta, "variant", new Set(["primary", "secondary"]), filePath);
  });
  objectArray(data, "presenceNodes", filePath).forEach((node) => {
    ["top", "left", "label"].forEach((key) => stringValue(node, key, filePath));
    optionalString(node, "sub", filePath);
    optionalBooleanField(node, "active", rel(filePath), false);
  });
  // P7: Validate the method content that powers the human-reviewed orchestration section.
  const profileIntro = objectValue(data, "profileIntro", filePath);
  stringValue(profileIntro, "headline", filePath);
  if (stringArray(profileIntro, "proofLines", filePath).length !== expectedContentCounts.profileProofLines) {
    fail(filePath, `"profileIntro.proofLines" must contain ${expectedContentCounts.profileProofLines} proof lines`);
  }
  unique(stringArray(profileIntro, "stackItems", filePath), "profile intro stack item");
  const orchestration = objectValue(data, "orchestration", filePath);
  stringValue(orchestration, "intro", filePath);
  const steps = objectArray(orchestration, "steps", filePath);
  if (steps.length !== expectedContentCounts.orchestrationSteps) {
    fail(filePath, `"orchestration.steps" must contain ${expectedContentCounts.orchestrationSteps} steps`);
  }
  steps.forEach((step) => {
    stringValue(step, "title", filePath);
    stringValue(step, "description", filePath);
  });
  unique(stringArray(data, "marqueeItems", filePath), "marquee item");
  const llms = objectValue(data, "llms", filePath);
  stringArray(llms, "positioningLines", filePath);
  stringArray(llms, "homepageLines", filePath);
  unique(stringArray(data, "knowsAbout", filePath), "knowsAbout value");
  const seo = objectValue(data, "seo", filePath);
  ["title", "description", "author", "ogImage"].forEach((key) => stringValue(seo, key, filePath));
  stringArray(seo, "keywords", filePath);
  validatePublicAsset(stringValue(seo, "ogImage", filePath), filePath);
}

function validateProjects() {
  const projects = mdxFiles("projects").map((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    enumValue(data, "icon", projectIcons, filePath);
    ["slug", "id", "title", "description"].forEach((key) =>
      stringValue(data, key, filePath)
    );
    optionalNumber(data, "worksOrder", filePath);
    stringArray(data, "tags", filePath);
    optionalObjectArray(data, "screenshots", filePath).forEach((image) => validateImage(image, filePath));
    optionalObjectArray(data, "links", filePath).forEach((link) => {
      stringValue(link, "label", filePath);
      optionalNullableString(link, "href", filePath);
    });
    const detail = optionalObject(data, "detail", filePath);
    const detailEnabled = detail
      ? optionalBooleanField(detail, "enabled", rel(filePath), false, "detail.enabled")
      : false;
    if (detailEnabled) {
      optionalString(data, "detailCtaLabel", filePath, "detailCtaLabel");
      optionalString(data, "detailCtaSubline", filePath, "detailCtaSubline");
      ["slug", "eyebrow", "title", "seoTitle", "seoDescription", "subtitle", "scopeSummary"].forEach((key) =>
        stringValue(detail, key, filePath)
      );
      if (detail.roleLine !== undefined) stringValue(detail, "roleLine", filePath);
      if (detail.hardPart !== undefined) {
        const hardPart = objectValue(detail, "hardPart", filePath);
        stringValue(hardPart, "label", filePath);
        stringValue(hardPart, "copy", filePath);
      }
      validateImage(objectValue(detail, "heroImage", filePath), filePath);
      if (detail.ogImage !== undefined) {
        validateOgImage(objectValue(detail, "ogImage", filePath), filePath);
      }
      objectArray(detail, "gallery", filePath).forEach((image) => validateImage(image, filePath));
      objectArray(detail, "architectureSections", filePath).forEach((section) => {
        stringValue(section, "title", filePath);
        stringValue(section, "description", filePath);
        stringArray(section, "points", filePath);
      });
      objectArray(detail, "stackBuckets", filePath).forEach((bucket) => {
        stringValue(bucket, "label", filePath);
        stringArray(bucket, "items", filePath);
      });
      optionalStringArray(detail, "qualityHighlights", filePath);
      optionalObjectArray(detail, "references", filePath).forEach((reference) => {
        stringValue(reference, "label", filePath);
        optionalNullableString(reference, "href", filePath);
      });
      // P4 section intros field — begin
      const sectionIntros = objectValue(detail, "sectionIntros", filePath);
      ["architecture", "stack", "quality", "references"].forEach((key) => {
        const intro = objectValue(sectionIntros, key, filePath);
        stringValue(intro, "eyebrow", filePath);
        stringValue(intro, "title", filePath);
        optionalString(intro, "summary", filePath);
      });
      // P4 section intros field — end
      // P4 storyboard field — begin
      if (detail.storyboard !== undefined) {
        validateStoryboard(objectValue(detail, "storyboard", filePath), filePath);
      }
      // P4 storyboard field — end
    }
    return { data, detail, detailEnabled };
  });

  unique(projects.map(({ data }) => data.slug), "project slug");
  unique(projects.map(({ data }) => data.id), "project id");
  unique(
    projects
      .filter(({ detailEnabled }) => detailEnabled)
      .map(({ detail }) => detail)
      .map((detail) => detail.slug),
    "project detail slug"
  );
}

function validateChronicle() {
  const entries = mdxFiles("chronicle").map((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    ["slug", "company", "period", "companyContext", "roleTitle", "roleScope", "employmentNote"].forEach((key) =>
      stringValue(data, key, filePath)
    );
    optionalNumber(data, "order", filePath);

    const summaryPoints = objectArray(data, "summaryPoints", filePath);
    if (summaryPoints.length !== expectedContentCounts.experienceSummaryPoints) {
      fail(filePath, `"summaryPoints" must contain ${expectedContentCounts.experienceSummaryPoints} visible experience points`);
    }
    summaryPoints.forEach((point) => {
      stringValue(point, "lead", filePath);
      stringValue(point, "detail", filePath);
      if (point.emphasis !== undefined) stringValue(point, "emphasis", filePath);
    });

    const workstreams = objectArray(data, "workstreams", filePath);
    if (workstreams.length !== expectedContentCounts.experienceWorkstreams) {
      fail(filePath, `"workstreams" must contain ${expectedContentCounts.experienceWorkstreams} full-experience sections`);
    }
    workstreams.forEach((workstream) => {
      ["id", "title", "summary"].forEach((key) => stringValue(workstream, key, filePath));
      const points = objectArray(workstream, "points", filePath);
      if (points.length === 0) {
        fail(filePath, `workstream "${workstream.id}" must contain at least one point`);
      }
      points.forEach((point) => {
        stringValue(point, "lead", filePath);
        stringValue(point, "detail", filePath);
        if (point.emphasis !== undefined) stringValue(point, "emphasis", filePath);
      });
      const tools = stringArray(workstream, "tools", filePath);
      unique(tools, `tool in workstream "${workstream.id}"`);
      const images = optionalObjectArray(workstream, "images", filePath);
      images.forEach((image) => {
        const src = stringValue(image, "src", filePath);
        validatePublicAsset(src, filePath);
        stringValue(image, "alt", filePath);
        stringValue(image, "caption", filePath);
        for (const dimension of ["width", "height"]) {
          if (typeof image[dimension] !== "number" || !Number.isFinite(image[dimension]) || image[dimension] <= 0) {
            fail(filePath, `experience image "${dimension}" must be a positive number`);
          }
        }
      });
    });
    unique(
      workstreams.map((workstream) => workstream.id),
      `workstream id in ${rel(filePath)}`
    );
    return data;
  });
  unique(entries.map((entry) => entry.slug), "chronicle slug");
}

function validateStack() {
  const groups = mdxFiles("stack").map((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    enumValue(data, "context", stackContextValues, filePath);
    ["id", "label"].forEach((key) => stringValue(data, key, filePath));
    optionalNumber(data, "order", filePath);
    optionalBooleanField(data, "highlighted", rel(filePath), false);
    return data;
  });
  unique(groups.map((group) => group.id), "stack id");
}

function validateServices() {
  mdxFiles("services").forEach((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    optionalEnum(data, "accent", accents, filePath);
    optionalNumber(data, "order", filePath);
    ["id", "title", "description", "icon"].forEach((key) => stringValue(data, key, filePath));
    optionalStringArray(data, "tags", filePath);
  });
}

function validateBeyondRenditions(image, filePath) {
  const seenWidths = new Set();
  optionalObjectArray(image, "renditions", filePath).forEach((rendition) => {
    const width = rendition.w;
    if (!beyondRenditionWidths.includes(width)) {
      fail(filePath, `"image.renditions[].w" must be one of: ${beyondRenditionWidths.join(", ")}`);
    }
    if (seenWidths.has(width)) {
      fail(filePath, `duplicate "image.renditions[].w" value: ${width}`);
    }
    seenWidths.add(width);

    const cap = beyondRenditionCaps[width];
    for (const format of ["avif", "webp"]) {
      const src = stringValue(rendition, format, filePath);
      validatePublicAsset(src, filePath);
      const bytes = fs.statSync(path.resolve(publicRoot, src.slice(1))).size;
      if (bytes > cap) {
        fail(filePath, `"image.renditions" ${format} at ${width}px is ${bytes} bytes; cap is ${cap}`);
      }
    }

    const declaredBytes = rendition.bytes;
    if (typeof declaredBytes !== "number" || !Number.isSafeInteger(declaredBytes) || declaredBytes <= 0) {
      fail(filePath, '"image.renditions[].bytes" must be a positive integer');
    }
  });
}

function validateBeyond() {
  const items = mdxFiles("beyond").map((filePath) => {
    const data = read(filePath);
    const status = enumValue(data, "status", statuses, filePath);
    enumValue(data, "kind", beyondKinds, filePath);
    enumValue(data, "color", beyondColors, filePath);
    enumValue(data, "size", beyondSizes, filePath);
    optionalNumber(data, "order", filePath);
    ["id", "title", "caption"].forEach((key) => stringValue(data, key, filePath));
    // Draft entries start with no tags; the array stays required, its contents need not.
    if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
      fail(filePath, '"tags" must be an array of strings');
    }
    const image = optionalObject(data, "image", filePath);
    if (image) {
      validateImage(image, filePath, false);
      optionalString(image, "aspectRatio", filePath, "image.aspectRatio");
      optionalString(image, "dominantColor", filePath, "image.dominantColor");
      validateBeyondRenditions(image, filePath);
      const placeholder = optionalString(image, "placeholder", filePath, "image.placeholder");
      if (placeholder !== undefined && !placeholder.startsWith("data:image/webp;base64,")) {
        fail(filePath, '"image.placeholder" must be a WebP data URI');
      }
    }
    const privacy = optionalEnum(data, "privacy", beyondPrivacyValues, filePath);
    if (privacy === "needs-consent" && status === "published") {
      fail(filePath, 'a published entry cannot keep "privacy: needs-consent"');
    }
    optionalString(data, "quote", filePath);
    optionalString(data, "meta", filePath);
    return data;
  });
  unique(items.map((item) => item.id), "beyond item id");
}

validateProfile();
validateProjects();
validateChronicle();
validateStack();
validateServices();
validateBeyond();

console.log("[portfolio-content] content validation passed");
