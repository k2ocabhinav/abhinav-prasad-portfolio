import { cache } from "react";
import type {
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
} from "@/types";
import {
  expectedContentCounts,
  projectIcons,
  projectStoryThemes,
  projectStoryViewports,
  projectStoryLayouts,
  projectTenantIds,
  projectTripRoles,
  statusValues,
} from "@/lib/portfolioSchema.mjs";
import {
  type Frontmatter,
  booleanValue,
  ensureUnique,
  enumValue,
  fail,
  listMdxFiles,
  nullableString,
  nonEmptyObjectArray,
  nonEmptyStringArray,
  numberValue,
  objectArray,
  objectValue,
  optionalObject,
  optionalObjectArray,
  optionalString,
  readFrontmatter,
  readImage,
  readOgImage,
  stringArray,
  stringValue,
  validatePublicAsset,
} from "./shared";

function readLinks(data: Frontmatter, filePath: string, key = "links"): ProjectLink[] {
  return optionalObjectArray(data, key, filePath).map((link) => ({
    label: stringValue(link, "label", filePath),
    href: nullableString(link, "href", filePath) ?? null,
  }));
}

function readSectionIntro(data: Frontmatter, filePath: string): ProjectDetailSectionIntro {
  return {
    eyebrow: stringValue(data, "eyebrow", filePath),
    title: stringValue(data, "title", filePath),
    summary: optionalString(data, "summary", filePath),
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
    layout: enumValue(chapter, "layout", projectStoryLayouts, filePath),
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
  if (tripSteps.length !== expectedContentCounts.storyboardTripSteps) {
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

  const facts = nonEmptyObjectArray(data, "facts", filePath).map((fact) => ({
    label: stringValue(fact, "label", filePath),
    value: stringValue(fact, "value", filePath),
  }));
  ensureUnique(facts.map((fact) => fact.label), "storyboard fact label");

  const mobileHeroVisualId = stringValue(data, "mobileHeroVisualId", filePath);
  if (visualById.get(mobileHeroVisualId)?.viewport !== "mobile") {
    fail(filePath, `storyboard mobileHeroVisualId "${mobileHeroVisualId}" must reference a mobile visual`);
  }
  const status = stringValue(data, "status", filePath);
  const tripIntro = readSectionIntro(objectValue(data, "tripIntro", filePath), filePath);

  const readProof = (key: "mobileProof" | "featureProof") => {
    const proof = optionalObject(data, key, filePath, `storyboard.${key}`);
    if (!proof) return undefined;
    const visualId = stringValue(proof, "visualId", filePath);
    if (!visualById.has(visualId)) {
      fail(filePath, `storyboard ${key} references missing visual "${visualId}"`);
    }
    return {
      visualId,
      title: stringValue(proof, "title", filePath),
      summary: stringValue(proof, "summary", filePath),
    };
  };
  const mobileProof = readProof("mobileProof");
  const featureProof = readProof("featureProof");
  const scheduleProofData = optionalObject(data, "scheduleProof", filePath, "storyboard.scheduleProof");
  const scheduleProof = scheduleProofData
    ? {
        visualId: stringValue(scheduleProofData, "visualId", filePath),
        summary: stringValue(scheduleProofData, "summary", filePath),
      }
    : undefined;
  if (scheduleProof && !visualById.has(scheduleProof.visualId)) {
    fail(filePath, `storyboard scheduleProof references missing visual "${scheduleProof.visualId}"`);
  }

  return {
    visuals,
    chapters,
    tripSteps,
    status,
    facts,
    mobileHeroVisualId,
    tripIntro,
    ...(booleanValue(data, "routePlate", false, filePath, "storyboard.routePlate") ? { routePlate: true } : {}),
    ...(mobileProof ? { mobileProof } : {}),
    ...(featureProof ? { featureProof } : {}),
    ...(scheduleProof ? { scheduleProof } : {}),
    tenantSwitcher: {
      label: stringValue(tenantSwitcher, "label", filePath),
      defaultId,
      options,
    },
  };
}

function readDetail(data: Frontmatter, filePath: string): ProjectDetail | undefined {
  const detail = optionalObject(data, "detail", filePath);
  if (!detail) {
    return undefined;
  }
  if (!booleanValue(detail, "enabled", false, filePath, "detail.enabled")) {
    return undefined;
  }

  const heroImage = readImage(objectValue(detail, "heroImage", filePath), filePath);
  const ogImage = detail.ogImage === undefined
    ? undefined
    : readOgImage(objectValue(detail, "ogImage", filePath), filePath);
  const gallery = objectArray(detail, "gallery", filePath).map((item) => readImage(item, filePath));
  gallery.forEach((item) => validatePublicAsset(item.src, filePath));

  const storyboardData = detail.storyboard === undefined
    ? undefined
    : objectValue(detail, "storyboard", filePath);

  // P4 section intros — per-project headings for the trailing sections.
  const sectionIntros = objectValue(detail, "sectionIntros", filePath);

  const roleLine = optionalString(detail, "roleLine", filePath, "detail.roleLine");
  const hardPart = optionalObject(detail, "hardPart", filePath, "detail.hardPart");

  return {
    slug: stringValue(detail, "slug", filePath),
    eyebrow: stringValue(detail, "eyebrow", filePath),
    title: stringValue(detail, "title", filePath),
    seoTitle: stringValue(detail, "seoTitle", filePath),
    seoDescription: stringValue(detail, "seoDescription", filePath),
    subtitle: stringValue(detail, "subtitle", filePath),
    scopeSummary: stringValue(detail, "scopeSummary", filePath),
    ...(roleLine ? { roleLine } : {}),
    ...(hardPart
      ? {
          hardPart: {
            label: stringValue(hardPart, "label", filePath),
            copy: stringValue(hardPart, "copy", filePath),
          },
        }
      : {}),
    heroImage,
    ...(ogImage ? { ogImage } : {}),
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
  const tags = stringArray(data, "tags", filePath);
  const icon = enumValue(data, "icon", projectIcons, filePath);
  const screenshots = optionalObjectArray(data, "screenshots", filePath).map((item) => readImage(item, filePath));
  const detailData = detail ? objectValue(data, "detail", filePath) : undefined;
  const detailCtaLabel = detailData ? optionalString(detailData, "detailCtaLabel", filePath) : undefined;
  const detailCtaSubline = detailData ? optionalString(detailData, "detailCtaSubline", filePath) : undefined;

  return {
    slug,
    status: enumValue(data, "status", statusValues, filePath) as PortfolioStatus,
    worksOrder: numberValue(data, "worksOrder", 999, filePath),
    id,
    title: stringValue(data, "title", filePath),
    description: stringValue(data, "description", filePath),
    icon,
    tags,
    screenshots,
    links: readLinks(data, filePath),
    detailSlug: detail?.slug,
    detailCtaLabel,
    detailCtaSubline,
    detail,
  };
}

export const getAllPortfolioProjects = cache((): PortfolioProject[] => {
  const projects = listMdxFiles("projects").map(readProject);
  ensureUnique(projects.map((project) => project.slug), "project slug");
  ensureUnique(projects.map((project) => project.id), "project id");
  return projects.sort((a, b) => (a.worksOrder ?? 999) - (b.worksOrder ?? 999));
});

export const getPublishedProjects = cache((): PortfolioProject[] => {
  return getAllPortfolioProjects().filter((project) => project.status === "published");
});

export const getProjectDetailSlugs = cache((): string[] => {
  return getPublishedProjects().flatMap((project) =>
    project.detail ? [project.detail.slug] : []
  );
});
