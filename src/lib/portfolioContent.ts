import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  BeyondAlbumColor,
  BeyondAlbumKind,
  BeyondAlbumSize,
  ChronicleEntry,
  LandingAccentKey,
  LandingHeroContent,
  LandingProofBeatLabel,
  LandingStory,
  LandingStoryVisual,
  OrchestrationContent,
  ProfileIntroContent,
  PersonalData,
  PortfolioBeyondAlbumItem,
  PortfolioProfile,
  PortfolioProject,
  PortfolioStatus,
  ProjectDetail,
  ProjectDetailSectionIntro,
  ProjectDetailStory,
  ProjectLink,
  ProjectStoryChapter,
  ProjectStoryTheme,
  ProjectStoryViewport,
  ProjectTenantId,
  ProjectTripRole,
  ProjectTechBucket,
  ProjectTenantOption,
  ProjectStoryVisual,
  ProjectVisual,
  ServiceEntry,
  StackContext,
  StackGroup,
} from "@/types";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/portfolio");
const PUBLIC_ROOT = path.join(process.cwd(), "public");

type Frontmatter = Record<string, unknown>;

const projectIcons = ["terminal", "cloud", "database", "sparkles", "cpu"] as const;
const stackIcons = ["cloud", "cpu", "database", "terminal", "sparkles"] as const;
const stackContextValues = ["Used at work", "Part of my workflow", "Built in projects"] as const;
const accents = ["sage", "peach", "sky", "sand"] as const;
const statusValues = ["draft", "published"] as const;
const proofLabels = ["Problem", "My Role", "Shipped", "Impact"] as const;
const visualKinds = ["screenshot", "system", "type"] as const;
const codeTones = ["lime", "ember", "split"] as const;
const beyondKinds = ["photo", "event", "quote", "person", "project"] as const;
const beyondColors = ["cobalt", "coral", "lemon", "amber", "lilac", "pink"] as const;
const beyondSizes = ["hero", "wide", "tall", "square"] as const;
const socialPlatforms = ["github", "linkedin", "email"] as const;
const projectStoryViewports = ["desktop", "mobile"] as const;
const projectStoryThemes = ["day", "night"] as const;
const projectTenantIds = ["velo-business", "saffron-routes"] as const;
const projectTripRoles = ["rider", "dispatch", "driver"] as const;

function fail(filePath: string, message: string): never {
  throw new Error(`[portfolio-content] ${path.relative(process.cwd(), filePath)}: ${message}`);
}

function readFrontmatter(filePath: string): Frontmatter {
  if (!fs.existsSync(filePath)) {
    fail(filePath, "file not found");
  }

  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  return parsed.data;
}

function listMdxFiles(relativeDir: string): string[] {
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

function objectValue(data: Frontmatter, key: string, filePath: string): Frontmatter {
  const value = data[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(filePath, `missing object "${key}"`);
  }
  return value as Frontmatter;
}

function optionalObject(data: Frontmatter, key: string): Frontmatter | undefined {
  const value = data[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Frontmatter)
    : undefined;
}

function stringValue(data: Frontmatter, key: string, filePath: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(filePath, `missing string "${key}"`);
  }
  return value;
}

function optionalString(data: Frontmatter, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function optionalNonEmptyString(data: Frontmatter, key: string, filePath: string): string | undefined {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(filePath, `optional "${key}" must be a non-empty string`);
  }
  return value;
}

function nullableString(data: Frontmatter, key: string): string | null | undefined {
  const value = data[key];
  if (value === null) return null;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function numberValue(data: Frontmatter, key: string, fallback: number): number {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(data: Frontmatter, key: string, fallback = false): boolean {
  const value = data[key];
  return typeof value === "boolean" ? value : fallback;
}

function stringArray(data: Frontmatter, key: string, filePath: string): string[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(filePath, `missing string array "${key}"`);
  }
  return value as string[];
}

function nonEmptyStringArray(data: Frontmatter, key: string, filePath: string): string[] {
  const values = stringArray(data, key, filePath);
  if (values.length === 0 || values.some((value) => value.trim().length === 0)) {
    fail(filePath, `"${key}" must contain at least one non-empty string`);
  }
  return values;
}

function optionalStringArray(data: Frontmatter, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? (value as string[])
    : [];
}

function objectArray(data: Frontmatter, key: string, filePath: string): Frontmatter[] {
  const value = data[key];
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    fail(filePath, `missing object array "${key}"`);
  }
  return value as Frontmatter[];
}

function nonEmptyObjectArray(data: Frontmatter, key: string, filePath: string): Frontmatter[] {
  const values = objectArray(data, key, filePath);
  if (values.length === 0) {
    fail(filePath, `"${key}" must contain at least one object`);
  }
  return values;
}

function optionalObjectArray(data: Frontmatter, key: string): Frontmatter[] {
  const value = data[key];
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && !Array.isArray(item))
    ? (value as Frontmatter[])
    : [];
}

function enumValue<T extends readonly string[]>(
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

function optionalEnum<T extends readonly string[]>(
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

function validatePublicAsset(src: string | undefined, filePath: string) {
  if (!src || src.startsWith("http")) {
    return;
  }

  if (!src.startsWith("/")) {
    fail(filePath, `asset path "${src}" must start with "/" or "https://"`);
  }

  const diskPath = path.join(PUBLIC_ROOT, src.slice(1));
  if (!fs.existsSync(diskPath)) {
    fail(filePath, `asset not found: public${src}`);
  }
}

function ensureUnique(values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`[portfolio-content] duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function byOrder<T extends { order?: number; id?: string; slug?: string }>(a: T, b: T) {
  return (a.order ?? 999) - (b.order ?? 999) || (a.id ?? a.slug ?? "").localeCompare(b.id ?? b.slug ?? "");
}

function readVisual(data: Frontmatter, filePath: string): LandingStoryVisual {
  const visual = objectValue(data, "visual", filePath);
  const kind = enumValue(visual, "kind", visualKinds, filePath) as LandingStoryVisual["kind"];
  const src = optionalString(visual, "src");
  validatePublicAsset(src, filePath);

  return {
    kind,
    src,
    alt: stringValue(visual, "alt", filePath),
    caption: stringValue(visual, "caption", filePath),
  };
}

function readImage(data: Frontmatter, filePath: string): ProjectVisual {
  const src = stringValue(data, "src", filePath);
  validatePublicAsset(src, filePath);
  return {
    src,
    alt: stringValue(data, "alt", filePath),
    caption: stringValue(data, "caption", filePath),
  };
}

function readLinks(data: Frontmatter, filePath: string, key = "links"): ProjectLink[] {
  return optionalObjectArray(data, key).map((link) => ({
    label: stringValue(link, "label", filePath),
    href: nullableString(link, "href") ?? null,
  }));
}

function readSectionIntro(data: Frontmatter, filePath: string): ProjectDetailSectionIntro {
  return {
    eyebrow: stringValue(data, "eyebrow", filePath),
    title: stringValue(data, "title", filePath),
    summary: optionalString(data, "summary"),
  };
}

function readTechBuckets(data: Frontmatter, filePath: string): ProjectTechBucket[] {
  return objectArray(data, "stackBuckets", filePath).map((bucket) => ({
    label: stringValue(bucket, "label", filePath),
    items: stringArray(bucket, "items", filePath),
  }));
}

function readStoryboard(data: Frontmatter, filePath: string): ProjectDetailStory {
  // The build preflight (scripts/check-portfolio-content.mjs) rejects an empty
  // storyboard; the runtime loader is the authoritative schema, so it enforces
  // the same minimums here and a bad storyboard cannot reach a route.
  const visuals = nonEmptyObjectArray(data, "visuals", filePath).map((visual): ProjectStoryVisual => {
    const image = readImage(visual, filePath);
    const theme = visual.theme === undefined
      ? undefined
      : enumValue(visual, "theme", projectStoryThemes, filePath) as ProjectStoryTheme;
    const tenant = visual.tenant === undefined
      ? undefined
      : enumValue(visual, "tenant", projectTenantIds, filePath) as ProjectTenantId;

    return {
      id: stringValue(visual, "id", filePath),
      viewport: enumValue(visual, "viewport", projectStoryViewports, filePath) as ProjectStoryViewport,
      ...(theme ? { theme } : {}),
      ...(tenant ? { tenant } : {}),
      ...image,
    };
  });
  const visualIds = visuals.map((visual) => visual.id);
  ensureUnique(visualIds, "storyboard visual id");
  const visualById = new Map(visuals.map((visual) => [visual.id, visual]));

  const chapters = nonEmptyObjectArray(data, "chapters", filePath).map((chapter): ProjectStoryChapter => ({
    id: stringValue(chapter, "id", filePath),
    eyebrow: stringValue(chapter, "eyebrow", filePath),
    title: stringValue(chapter, "title", filePath),
    summary: stringValue(chapter, "summary", filePath),
    visualIds: nonEmptyStringArray(chapter, "visualIds", filePath),
  }));
  ensureUnique(chapters.map((chapter) => chapter.id), "storyboard chapter id");
  chapters.forEach((chapter) => {
    chapter.visualIds.forEach((visualId) => {
      if (!visualById.has(visualId)) {
        fail(filePath, `storyboard chapter "${chapter.id}" references missing visual "${visualId}"`);
      }
    });
  });

  const tripSteps = objectArray(data, "tripSteps", filePath).map((step) => ({
    role: enumValue(step, "role", projectTripRoles, filePath) as ProjectTripRole,
    label: stringValue(step, "label", filePath),
    summary: stringValue(step, "summary", filePath),
    visualId: stringValue(step, "visualId", filePath),
  }));
  if (tripSteps.length !== projectTripRoles.length) {
    fail(filePath, 'storyboard "tripSteps" must contain one step for rider, dispatch, and driver');
  }
  ensureUnique(tripSteps.map((step) => step.role), "storyboard trip role");
  projectTripRoles.forEach((role) => {
    if (!tripSteps.some((step) => step.role === role)) {
      fail(filePath, `storyboard tripSteps is missing the "${role}" role`);
    }
  });
  tripSteps.forEach((step) => {
    if (!visualById.has(step.visualId)) {
      fail(filePath, `storyboard trip step "${step.role}" references missing visual "${step.visualId}"`);
    }
  });

  const tenantSwitcher = objectValue(data, "tenantSwitcher", filePath);
  const defaultId = enumValue(tenantSwitcher, "defaultId", projectTenantIds, filePath) as ProjectTenantId;
  const options = objectArray(tenantSwitcher, "options", filePath).map((option): ProjectTenantOption => ({
    id: enumValue(option, "id", projectTenantIds, filePath) as ProjectTenantId,
    label: stringValue(option, "label", filePath),
    visualId: stringValue(option, "visualId", filePath),
  }));
  if (options.length < 2) {
    fail(filePath, 'storyboard "tenantSwitcher.options" must contain at least two tenants');
  }
  ensureUnique(options.map((option) => option.id), "storyboard tenant id");
  if (!options.some((option) => option.id === defaultId)) {
    fail(filePath, `storyboard default tenant "${defaultId}" is not in tenantSwitcher.options`);
  }
  options.forEach((option) => {
    const visual = visualById.get(option.visualId);
    if (!visual) {
      fail(filePath, `storyboard tenant "${option.id}" references missing visual "${option.visualId}"`);
    }
    if (visual.tenant !== option.id) {
      fail(filePath, `storyboard tenant visual "${option.visualId}" must be tagged for "${option.id}"`);
    }
  });

  return {
    visuals,
    chapters,
    tripSteps,
    tenantSwitcher: {
      label: stringValue(tenantSwitcher, "label", filePath),
      defaultId,
      options,
    },
  };
}

function readDetail(data: Frontmatter, filePath: string): ProjectDetail | undefined {
  const detail = optionalObject(data, "detail");
  if (!detail || !booleanValue(detail, "enabled", false)) {
    return undefined;
  }

  const heroImage = readImage(objectValue(detail, "heroImage", filePath), filePath);
  const gallery = objectArray(detail, "gallery", filePath).map((item) => readImage(item, filePath));
  gallery.forEach((item) => validatePublicAsset(item.src, filePath));

  const storyboardData = detail.storyboard === undefined
    ? undefined
    : objectValue(detail, "storyboard", filePath);

  // P4 section intros — per-project headings for the trailing sections.
  const sectionIntros = objectValue(detail, "sectionIntros", filePath);

  return {
    slug: stringValue(detail, "slug", filePath),
    eyebrow: stringValue(detail, "eyebrow", filePath),
    title: stringValue(detail, "title", filePath),
    subtitle: stringValue(detail, "subtitle", filePath),
    scopeSummary: stringValue(detail, "scopeSummary", filePath),
    heroImage,
    gallery,
    architectureSections: objectArray(detail, "architectureSections", filePath).map((section) => ({
      title: stringValue(section, "title", filePath),
      description: stringValue(section, "description", filePath),
      points: stringArray(section, "points", filePath),
    })),
    stackBuckets: readTechBuckets(detail, filePath),
    qualityHighlights: stringArray(detail, "qualityHighlights", filePath),
    references: readLinks(detail, filePath, "references"),
    sectionIntros: {
      architecture: readSectionIntro(objectValue(sectionIntros, "architecture", filePath), filePath),
      stack: readSectionIntro(objectValue(sectionIntros, "stack", filePath), filePath),
      quality: readSectionIntro(objectValue(sectionIntros, "quality", filePath), filePath),
      references: readSectionIntro(objectValue(sectionIntros, "references", filePath), filePath),
    },
    ...(storyboardData ? { storyboard: readStoryboard(storyboardData, filePath) } : {}),
  };
}

function readProject(filePath: string): PortfolioProject {
  const data = readFrontmatter(filePath);
  const detail = readDetail(data, filePath);
  const slug = stringValue(data, "slug", filePath);
  const id = stringValue(data, "id", filePath);
  const title = stringValue(data, "title", filePath);
  const tags = stringArray(data, "tags", filePath);
  const icon = enumValue(data, "icon", projectIcons, filePath);
  const proofBeats = objectArray(data, "proofBeats", filePath).map((beat) => ({
    label: enumValue(beat, "label", proofLabels, filePath) as LandingProofBeatLabel,
    short: stringValue(beat, "short", filePath),
    detail: stringValue(beat, "detail", filePath),
  }));

  const screenshots = optionalObjectArray(data, "screenshots").map((item) => readImage(item, filePath));
  const visual = readVisual(data, filePath);
  const detailCtaLabel = detail ? optionalString(objectValue(data, "detail", filePath), "detailCtaLabel") : undefined;
  const detailCtaSubline = detail ? optionalString(objectValue(data, "detail", filePath), "detailCtaSubline") : undefined;

  return {
    slug,
    status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
    featured: booleanValue(data, "featured", false),
    featuredOrder: numberValue(data, "featuredOrder", 999),
    worksOrder: numberValue(data, "worksOrder", 999),
    id,
    title,
    description: stringValue(data, "description", filePath),
    scopeSummary: optionalString(data, "scopeSummary"),
    icon,
    tags,
    screenshots,
    links: readLinks(data, filePath),
    detailSlug: detail?.slug,
    detailCtaLabel,
    detailCtaSubline,
    caseStudySlug: null,
    detail,
    landingStory: {
      id,
      eyebrow: stringValue(data, "eyebrow", filePath),
      title,
      claim: stringValue(data, "claim", filePath),
      summary: stringValue(data, "summary", filePath),
      tags,
      icon,
      accent: enumValue(data, "accent", accents, filePath) as LandingAccentKey,
      note: stringValue(data, "note", filePath),
      proofBeats,
      visual,
      projectCodeTone: enumValue(data, "projectCodeTone", codeTones, filePath) as LandingStory["projectCodeTone"],
    },
  };
}

function readProfile(): PortfolioProfile {
  const filePath = path.join(CONTENT_ROOT, "profile.mdx");
  const data = readFrontmatter(filePath);
  const personalData = objectValue(data, "personal", filePath);
  const hero = objectValue(data, "hero", filePath);
  const bridge = objectValue(data, "bridge", filePath);
  // P7: Structured, editable copy for the human-reviewed orchestration section.
  const orchestrationData = objectValue(data, "orchestration", filePath);
  const profileIntroData = objectValue(data, "profileIntro", filePath);
  const seo = optionalObject(data, "seo");

  const personal: PersonalData = {
    name: stringValue(personalData, "name", filePath),
    fullName: stringValue(personalData, "fullName", filePath),
    title: stringValue(personalData, "title", filePath),
    tagline: stringValue(personalData, "tagline", filePath),
    subtitle: stringValue(personalData, "subtitle", filePath),
    hintCopy: optionalString(personalData, "hintCopy"),
    heroAnnotations: [],
    heroPhoto: stringValue(personalData, "heroPhoto", filePath),
    heroSlides: objectArray(personalData, "heroSlides", filePath).map((slide) => ({
      image: stringValue(slide, "image", filePath),
      alt: stringValue(slide, "alt", filePath),
    })),
    heroSlideInterval: numberValue(personalData, "heroSlideInterval", 4000),
    heroOverlayOpacity: numberValue(personalData, "heroOverlayOpacity", 0.3),
    location: {
      city: stringValue(objectValue(personalData, "location", filePath), "city", filePath),
      country: stringValue(objectValue(personalData, "location", filePath), "country", filePath),
      countryCode: stringValue(objectValue(personalData, "location", filePath), "countryCode", filePath),
      timezone: stringValue(objectValue(personalData, "location", filePath), "timezone", filePath),
    },
    email: stringValue(personalData, "email", filePath),
    resumeHref: stringValue(personalData, "resumeHref", filePath),
    socials: objectArray(personalData, "socials", filePath).map((social) => ({
      platform: enumValue(social, "platform", socialPlatforms, filePath),
      label: stringValue(social, "label", filePath),
      href: stringValue(social, "href", filePath),
    })),
    philosophy: stringValue(personalData, "philosophy", filePath),
    presenceDescription: stringValue(personalData, "presenceDescription", filePath),
    footerTagline: stringValue(personalData, "footerTagline", filePath),
  };
  validatePublicAsset(personal.heroPhoto, filePath);
  personal.heroSlides.forEach((slide) => validatePublicAsset(slide.image, filePath));
  validatePublicAsset(personal.resumeHref, filePath);

  const knowsAbout = nonEmptyStringArray(data, "knowsAbout", filePath);
  ensureUnique(knowsAbout, "knowsAbout value");

  const heroContent: LandingHeroContent = {
    displayTitle: stringValue(hero, "displayTitle", filePath),
    displayTitleAccent: stringValue(hero, "displayTitleAccent", filePath),
    roleCycleWords: stringArray(hero, "roleCycleWords", filePath),
    supportingCopy: stringValue(hero, "supportingCopy", filePath),
    ctas: objectArray(hero, "ctas", filePath).map((cta) => ({
      label: stringValue(cta, "label", filePath),
      href: stringValue(cta, "href", filePath),
      variant: enumValue(cta, "variant", ["primary", "secondary"] as const, filePath) as "primary" | "secondary",
    })),
  };

  // P7: Keep the process steps and evidence in the same validated profile source.
  const profileIntro: ProfileIntroContent = {
    headline: stringValue(profileIntroData, "headline", filePath),
    proofLines: nonEmptyStringArray(profileIntroData, "proofLines", filePath),
    stackItems: nonEmptyStringArray(profileIntroData, "stackItems", filePath),
  };
  if (profileIntro.proofLines.length !== 3) {
    fail(filePath, '"profileIntro.proofLines" must contain three proof lines');
  }
  const orchestration: OrchestrationContent = {
    intro: stringValue(orchestrationData, "intro", filePath),
    method: stringValue(orchestrationData, "method", filePath),
    metricsContext: stringValue(orchestrationData, "metricsContext", filePath),
    metrics: objectArray(orchestrationData, "metrics", filePath).map((metric) => ({
      value: stringValue(metric, "value", filePath),
      label: stringValue(metric, "label", filePath),
    })),
    lesson: stringValue(orchestrationData, "lesson", filePath),
  };

  return {
    personal,
    hero: heroContent,
    bridge: {
      eyebrow: stringValue(bridge, "eyebrow", filePath),
      title: stringValue(bridge, "title", filePath),
    },
    presenceNodes: objectArray(data, "presenceNodes", filePath).map((node) => ({
      top: stringValue(node, "top", filePath),
      left: stringValue(node, "left", filePath),
      label: stringValue(node, "label", filePath),
      sub: optionalString(node, "sub"),
      active: booleanValue(node, "active", false),
    })),
    knowsAbout,
    orchestration,
    profileIntro,
    seo: seo
      ? {
          title: stringValue(seo, "title", filePath),
          description: stringValue(seo, "description", filePath),
          keywords: stringArray(seo, "keywords", filePath),
          author: stringValue(seo, "author", filePath),
          ogImage: stringValue(seo, "ogImage", filePath),
        }
      : undefined,
  };
}

export function getProfileContent() {
  return readProfile();
}

export function getAllPortfolioProjects(): PortfolioProject[] {
  const projects = listMdxFiles("projects").map(readProject);
  ensureUnique(projects.map((project) => project.slug), "project slug");
  ensureUnique(projects.map((project) => project.id), "project id");
  return projects.sort((a, b) => (a.worksOrder ?? 999) - (b.worksOrder ?? 999));
}

export function getPublishedProjects(): PortfolioProject[] {
  return getAllPortfolioProjects().filter((project) => project.status === "published");
}

export function getProjectDetailSlugs(): string[] {
  return getPublishedProjects()
    .filter((project) => Boolean(project.detail))
    .map((project) => project.detail!.slug);
}

export function getProjectDetailBySlug(slug: string): ProjectDetail | null {
  return getPublishedProjects().find((project) => project.detail?.slug === slug)?.detail ?? null;
}

export function getChronicleEntries(): ChronicleEntry[] {
  const entries = listMdxFiles("chronicle").map((filePath) => {
    const data = readFrontmatter(filePath);
    const workstreams = nonEmptyObjectArray(data, "workstreams", filePath).map((workstream) => {
      const tools = nonEmptyStringArray(workstream, "tools", filePath);
      ensureUnique(tools, `tool in workstream "${stringValue(workstream, "id", filePath)}"`);

      return {
        id: stringValue(workstream, "id", filePath),
        title: stringValue(workstream, "title", filePath),
        summary: stringValue(workstream, "summary", filePath),
        points: nonEmptyObjectArray(workstream, "points", filePath).map((point) => ({
          lead: stringValue(point, "lead", filePath),
          detail: stringValue(point, "detail", filePath),
        })),
        tools,
      };
    });

    ensureUnique(
      workstreams.map((workstream) => workstream.id),
      `workstream id in ${path.relative(process.cwd(), filePath)}`
    );

    return {
      slug: stringValue(data, "slug", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999),
      company: stringValue(data, "company", filePath),
      period: stringValue(data, "period", filePath),
      companyContext: stringValue(data, "companyContext", filePath),
      backendThesis: stringValue(data, "backendThesis", filePath),
      functionality: stringValue(data, "functionality", filePath),
      roles: nonEmptyObjectArray(data, "roles", filePath).map((role) => ({
        title: stringValue(role, "title", filePath),
        date: stringValue(role, "date", filePath),
        note: optionalNonEmptyString(role, "note", filePath),
      })),
      workstreams,
    };
  });
  ensureUnique(entries.map((entry) => entry.slug), "chronicle slug");
  return entries.filter((entry) => entry.status === "published").sort(byOrder);
}

export function getStackGroups(): StackGroup[] {
  const groups = listMdxFiles("stack").map((filePath) => {
    const data = readFrontmatter(filePath);
    const items = nonEmptyStringArray(data, "items", filePath);
    ensureUnique(items, `stack item in ${path.relative(process.cwd(), filePath)}`);
    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999),
      icon: enumValue(data, "icon", stackIcons, filePath),
      label: stringValue(data, "label", filePath),
      context: enumValue(data, "context", stackContextValues, filePath) as StackContext,
      items,
    };
  });
  ensureUnique(groups.map((group) => group.id), "stack id");
  return groups.filter((group) => group.status === "published").sort(byOrder);
}

export function getServiceEntries(): ServiceEntry[] {
  const services = listMdxFiles("services").map((filePath) => {
    const data = readFrontmatter(filePath);
    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999),
      title: stringValue(data, "title", filePath),
      description: stringValue(data, "description", filePath),
      icon: stringValue(data, "icon", filePath),
      accent: optionalEnum(data, "accent", accents, "sage", filePath),
      tags: optionalStringArray(data, "tags"),
    };
  });
  ensureUnique(services.map((service) => service.id), "service id");
  return services.filter((service) => service.status === "published").sort(byOrder);
}

export function getBeyondAlbumItems(): PortfolioBeyondAlbumItem[] {
  const items = listMdxFiles("beyond").map((filePath) => {
    const data = readFrontmatter(filePath);
    const image = optionalObject(data, "image");
    const src = image ? optionalString(image, "src") : undefined;
    validatePublicAsset(src, filePath);

    return {
      id: stringValue(data, "id", filePath),
      status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
      order: numberValue(data, "order", 999),
      kind: enumValue(data, "kind", beyondKinds, filePath) as BeyondAlbumKind,
      title: stringValue(data, "title", filePath),
      caption: stringValue(data, "caption", filePath),
      tags: stringArray(data, "tags", filePath),
      quote: optionalString(data, "quote"),
      meta: optionalString(data, "meta"),
      color: enumValue(data, "color", beyondColors, filePath) as BeyondAlbumColor,
      size: enumValue(data, "size", beyondSizes, filePath) as BeyondAlbumSize,
      image: image
        ? {
            src,
            alt: stringValue(image, "alt", filePath),
            aspectRatio: optionalString(image, "aspectRatio"),
            dominantColor: optionalString(image, "dominantColor"),
          }
        : undefined,
    };
  });
  ensureUnique(items.map((item) => item.id), "beyond item id");
  return items.filter((item) => item.status === "published").sort(byOrder);
}

export function getHomeContent() {
  const profile = getProfileContent();
  return {
    profile,
    projects: getPublishedProjects(),
    chronicleEntries: getChronicleEntries(),
    stackGroups: getStackGroups(),
    services: getServiceEntries(),
  };
}
