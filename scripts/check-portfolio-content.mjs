import fs from "fs";
import path from "path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "src/content/portfolio");
const publicRoot = path.join(root, "public");
const statuses = new Set(["draft", "published"]);
const proofLabels = new Set(["Problem", "My Role", "Shipped", "Impact"]);
const projectIcons = new Set(["terminal", "cloud", "database", "sparkles", "cpu"]);
const stackIcons = new Set(["cloud", "cpu", "database", "terminal", "sparkles"]);
const stackContextValues = new Set(["Used at work", "Part of my workflow", "Built with in projects"]);
const accents = new Set(["sage", "peach", "sky", "sand"]);
const codeTones = new Set(["lime", "ember", "split"]);
const beyondKinds = new Set(["photo", "event", "quote", "person", "project"]);
const beyondColors = new Set(["cobalt", "coral", "lemon", "amber", "lilac", "pink"]);
const beyondSizes = new Set(["hero", "wide", "tall", "square"]);

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
  const value = data[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(filePath, `missing string "${key}"`);
  }
  return value;
}

function optionalString(data, key) {
  const value = data[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function optionalNullableString(data, key, filePath) {
  const value = data[key];
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(filePath, `optional "${key}" must be a non-empty string or null`);
  }
  return value;
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
  const value = data[key];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(filePath, `optional "${key}" must be a string array`);
  }
  return value;
}

function objectValue(data, key, filePath) {
  const value = data[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(filePath, `missing object "${key}"`);
  }
  return value;
}

function optionalObject(data, key) {
  const value = data[key];
  return value && typeof value === "object" && !Array.isArray(value) ? value : undefined;
}

function objectArray(data, key, filePath) {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    fail(filePath, `missing object array "${key}"`);
  }
  return value;
}

function optionalObjectArray(data, key) {
  const value = data[key];
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && !Array.isArray(item))
    ? value
    : [];
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
  if (!src || src.startsWith("http")) return;
  if (!src.startsWith("/")) {
    fail(filePath, `asset path "${src}" must start with "/" or "https://"`);
  }
  const diskPath = path.join(publicRoot, src.slice(1));
  if (!fs.existsSync(diskPath)) {
    fail(filePath, `asset not found: public${src}`);
  }
}

function validateImage(image, filePath, requireSrc = true) {
  const src = requireSrc ? stringValue(image, "src", filePath) : optionalString(image, "src");
  validatePublicAsset(src, filePath);
  stringValue(image, "alt", filePath);
  if (requireSrc) {
    stringValue(image, "caption", filePath);
  }
}

function validateProfile() {
  const filePath = path.join(contentRoot, "profile.mdx");
  const data = read(filePath);
  const personal = objectValue(data, "personal", filePath);
  const hero = objectValue(data, "hero", filePath);

  ["name", "fullName", "title", "tagline", "subtitle", "email", "philosophy", "presenceDescription", "footerTagline"].forEach((key) =>
    stringValue(personal, key, filePath)
  );
  validatePublicAsset(stringValue(personal, "resumeHref", filePath), filePath);
  objectArray(personal, "socials", filePath).forEach((social) => {
    enumValue(social, "platform", new Set(["github", "linkedin", "email"]), filePath);
    stringValue(social, "label", filePath);
    stringValue(social, "href", filePath);
  });
  stringValue(hero, "displayTitle", filePath);
  stringValue(hero, "displayTitleAccent", filePath);
  if (stringArray(hero, "roleCycleWords", filePath).length === 0) {
    fail(filePath, '"hero.roleCycleWords" must contain at least one role');
  }
  objectArray(hero, "ctas", filePath).forEach((cta) => {
    stringValue(cta, "label", filePath);
    stringValue(cta, "href", filePath);
    enumValue(cta, "variant", new Set(["primary", "secondary"]), filePath);
  });
  // P7: Validate the method content that powers the human-reviewed orchestration section.
  const profileIntro = objectValue(data, "profileIntro", filePath);
  stringValue(profileIntro, "headline", filePath);
  if (stringArray(profileIntro, "proofLines", filePath).length !== 3) {
    fail(filePath, '"profileIntro.proofLines" must contain three proof lines');
  }
  unique(stringArray(profileIntro, "stackItems", filePath), "profile intro stack item");
  const orchestration = objectValue(data, "orchestration", filePath);
  stringValue(orchestration, "intro", filePath);
  const steps = objectArray(orchestration, "steps", filePath);
  if (steps.length !== 5) {
    fail(filePath, '"orchestration.steps" must contain five ordered steps');
  }
  steps.forEach((step) => {
    stringValue(step, "title", filePath);
    stringValue(step, "description", filePath);
  });
  stringValue(orchestration, "metricsContext", filePath);
  const metrics = objectArray(orchestration, "metrics", filePath);
  if (metrics.length < 3 || metrics.length > 5) {
    fail(filePath, '"orchestration.metrics" must contain three to five proof points');
  }
  metrics.forEach((metric) => {
    stringValue(metric, "value", filePath);
    stringValue(metric, "label", filePath);
  });
  stringValue(orchestration, "lesson", filePath);
  const bridge = objectValue(data, "bridge", filePath);
  stringValue(bridge, "eyebrow", filePath);
  stringValue(bridge, "title", filePath);
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
    enumValue(data, "accent", accents, filePath);
    enumValue(data, "projectCodeTone", codeTones, filePath);
    ["slug", "id", "title", "description", "claim", "summary", "note", "eyebrow"].forEach((key) =>
      stringValue(data, key, filePath)
    );
    stringArray(data, "tags", filePath);
    objectArray(data, "proofBeats", filePath).forEach((beat) => {
      enumValue(beat, "label", proofLabels, filePath);
      stringValue(beat, "short", filePath);
      stringValue(beat, "detail", filePath);
    });
    optionalObjectArray(data, "screenshots").forEach((image) => validateImage(image, filePath));
    optionalObjectArray(data, "links").forEach((link) => {
      stringValue(link, "label", filePath);
      optionalNullableString(link, "href", filePath);
    });
    const visual = objectValue(data, "visual", filePath);
    enumValue(visual, "kind", new Set(["screenshot", "system", "type"]), filePath);
    validatePublicAsset(optionalString(visual, "src"), filePath);
    stringValue(visual, "alt", filePath);
    stringValue(visual, "caption", filePath);
    const detail = optionalObject(data, "detail");
    if (detail?.enabled === true) {
      ["slug", "eyebrow", "title", "subtitle", "scopeSummary"].forEach((key) =>
        stringValue(detail, key, filePath)
      );
      validateImage(objectValue(detail, "heroImage", filePath), filePath);
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
      stringArray(detail, "qualityHighlights", filePath);
      optionalObjectArray(detail, "references").forEach((reference) => {
        stringValue(reference, "label", filePath);
        optionalNullableString(reference, "href", filePath);
      });
    }
    return data;
  });

  unique(projects.map((project) => project.slug), "project slug");
  unique(projects.map((project) => project.id), "project id");
  unique(
    projects
      .map((project) => optionalObject(project, "detail"))
      .filter((detail) => detail?.enabled === true)
      .map((detail) => detail.slug),
    "project detail slug"
  );

  const published = projects.filter((project) => project.status === "published");
  const featured = published.filter((project) => project.featured === true);
  const homepageFeatured = featured.slice(0, 4);
  if (homepageFeatured.length > 4) {
    throw new Error("[portfolio-content] homepage featured selection exceeded four items");
  }
}

function validateChronicle() {
  const entries = mdxFiles("chronicle").map((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    ["slug", "company", "period", "companyContext", "backendThesis", "functionality"].forEach((key) =>
      stringValue(data, key, filePath)
    );

    const roles = objectArray(data, "roles", filePath);
    if (roles.length === 0) {
      fail(filePath, '"roles" must contain at least one role');
    }
    roles.forEach((role) => {
      stringValue(role, "title", filePath);
      stringValue(role, "date", filePath);
      const note = role.note;
      if (note !== undefined && (typeof note !== "string" || note.trim().length === 0)) {
        fail(filePath, 'optional role "note" must be a non-empty string');
      }
    });

    const workstreams = objectArray(data, "workstreams", filePath);
    if (workstreams.length === 0) {
      fail(filePath, '"workstreams" must contain at least one workstream');
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
      });
      const tools = stringArray(workstream, "tools", filePath);
      unique(tools, `tool in workstream "${workstream.id}"`);
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
    enumValue(data, "icon", stackIcons, filePath);
    enumValue(data, "context", stackContextValues, filePath);
    ["id", "label"].forEach((key) => stringValue(data, key, filePath));
    const items = stringArray(data, "items", filePath);
    unique(items, `stack item in ${rel(filePath)}`);
    return data;
  });
  unique(groups.map((group) => group.id), "stack id");
}

function validateServices() {
  mdxFiles("services").forEach((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    optionalEnum(data, "accent", accents, filePath);
    ["id", "title", "description", "icon"].forEach((key) => stringValue(data, key, filePath));
    optionalStringArray(data, "tags", filePath);
  });
}

function validateBeyond() {
  const items = mdxFiles("beyond").map((filePath) => {
    const data = read(filePath);
    enumValue(data, "status", statuses, filePath);
    enumValue(data, "kind", beyondKinds, filePath);
    enumValue(data, "color", beyondColors, filePath);
    enumValue(data, "size", beyondSizes, filePath);
    ["id", "title", "caption"].forEach((key) => stringValue(data, key, filePath));
    stringArray(data, "tags", filePath);
    const image = optionalObject(data, "image");
    if (image) validateImage(image, filePath, false);
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
