// =============================================================================
// Portfolio — Shared Type Definitions
// =============================================================================

/** Scroll navigation section definition */
export interface NavSection {
  kind: "section";
  id: string;
  label: string;
}

/** Route navigation entry rendered alongside scroll sections */
export interface NavRoute {
  kind: "route";
  href: string;
  label: string;
  source: PortalTransitionIntent["source"];
  variant: PortalTransitionIntent["variant"];
  skin?: PortalTransitionIntent["skin"];
}

export type NavigationItem = NavSection | NavRoute;

/** Shared section background tone keys for home surface continuity */
export type SectionTone =
  | "hero-light"
  | "pastel-blue"
  | "pastel-blush"
  | "pastel-peach"
  | "pastel-mint"
  | "pastel-cream";

export type PortfolioStatus = "draft" | "published";

/** Social media link */
export interface SocialLink {
  platform: "github" | "linkedin" | "email";
  label: string;
  href: string;
}

/** Location information */
export interface Location {
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
}

/** Personal/profile data */
export interface PersonalData {
  name: string;
  fullName: string;
  title: string;
  subtitle: string;
  hintCopy: string[];
  /** Personal portrait or approved identity image URL */
  heroPhoto: string;
  location: Location;
  email: string;
  resumeHref: string;
  socials: SocialLink[];
  presenceDescription: string;
  footerTagline: string;
}

/** A semantically emphasized proof point within an experience workstream */
export interface ExperiencePoint {
  lead: string;
  detail: string;
  emphasis?: string;
}

/** A factual screenshot attached to an experience workstream */
export interface ExperienceVisual {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

/** A coherent area of engineering ownership within an employer experience */
export interface ExperienceWorkstream {
  id: string;
  title: string;
  summary: string;
  points: ExperiencePoint[];
  tools: string[];
  images?: ExperienceVisual[];
}

/** Portfolio project */
export interface ProjectVisual {
  src: string;
  alt: string;
  caption: string;
}

/** Share image with verified intrinsic dimensions for Open Graph metadata. */
export interface ProjectOgImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectTechBucket {
  label: string;
  items: string[];
}

export interface ProjectLink {
  label: string;
  href?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  /** Icon key — resolved to Lucide component at render time */
  icon: "terminal" | "cloud" | "database" | "sparkles" | "cpu";
  tags: string[];
  /** Card visuals shown on the homepage */
  screenshots?: ProjectVisual[];
  /** Optional external CTA links */
  links?: ProjectLink[];
  /** Optional internal deep-dive route slug */
  detailSlug?: string;
  /** Optional narrative CTA label for deep-dive teaser cards */
  detailCtaLabel?: string;
  /** Optional microcopy shown below deep-dive CTA */
  detailCtaSubline?: string;
}

export interface PortfolioProfile {
  personal: PersonalData;
  hero: LandingHeroContent;
  presenceNodes: PresenceNode[];
  knowsAbout: string[];
  seo: SEOData;
  orchestration: OrchestrationContent;
  profileIntro: ProfileIntroContent;
  marqueeItems: string[];
  llms: LlmsContent;
}

export interface LlmsContent {
  positioningLines: string[];
  homepageLines: string[];
}

export type HomeProfile = Pick<PortfolioProfile, "personal" | "hero" | "presenceNodes" | "orchestration" | "profileIntro" | "marqueeItems">;

export interface ProjectCard extends Project {
  slug: string;
}

export interface HomeContent {
  profile: HomeProfile;
  projects: ProjectCard[];
  chronicleEntries: ChronicleEntry[];
  stackGroups: StackGroup[];
  services: ServiceEntry[];
}

// ─── P7: Profile intro and AI coding-tool orchestration ────────────────────

export interface ProfileIntroContent {
  headline: string;
  proofLines: string[];
  stackItems: string[];
}

export interface OrchestrationStep {
  title: string;
  description: string;
}

export interface OrchestrationContent {
  intro: string;
  steps: OrchestrationStep[];
}

export interface PortfolioProject extends Project {
  slug: string;
  status: PortfolioStatus;
  worksOrder?: number;
  detail?: ProjectDetail;
}

export interface ChronicleEntry {
  slug: string;
  status: PortfolioStatus;
  order?: number;
  company: string;
  period: string;
  companyContext: string;
  roleTitle: string;
  roleScope: string;
  employmentNote: string;
  summaryPoints: ExperiencePoint[];
  workstreams: ExperienceWorkstream[];
}

export interface StackGroup {
  id: string;
  status: PortfolioStatus;
  order?: number;
  label: string;
  context: StackContext;
  highlighted: boolean;
}

export interface ServiceEntry extends Service {
  status: PortfolioStatus;
  order?: number;
}

export interface PortfolioBeyondAlbumItem extends BeyondAlbumItem {
  status: PortfolioStatus;
  order?: number;
}

export interface ProjectDetailSection {
  title: string;
  description: string;
  points: string[];
}

/** Heading copy for a trailing project-detail section (architecture, stack, quality, source). */
export interface ProjectDetailSectionIntro {
  eyebrow: string;
  title: string;
  summary?: string;
}

export type ProjectStoryViewport = "desktop" | "mobile";
export type ProjectStoryTheme = "day" | "night";
export type ProjectTenantId = "velo-business" | "saffron-routes";
export type ProjectTripRole = "rider" | "dispatch" | "driver";

export interface ProjectStoryVisual extends ProjectVisual {
  id: string;
  viewport: ProjectStoryViewport;
  theme?: ProjectStoryTheme;
  tenant?: ProjectTenantId;
}

export interface ProjectStoryChapter {
  id: string;
  layout: "tenant-switcher" | "theme-comparison" | "schedule";
  eyebrow: string;
  title: string;
  summary: string;
  visualIds: string[];
}

export interface ProjectTripStep {
  role: ProjectTripRole;
  label: string;
  summary: string;
  visualId: string;
}

export interface ProjectTenantOption {
  id: ProjectTenantId;
  label: string;
  visualId: string;
}

export interface ProjectDetailStory {
  visuals: ProjectStoryVisual[];
  chapters: ProjectStoryChapter[];
  tripSteps: ProjectTripStep[];
  status: string;
  facts: Array<{ label: string; value: string }>;
  mobileHeroVisualId: string;
  tripIntro: ProjectDetailSectionIntro;
  routePlate?: boolean;
  mobileProof?: { visualId: string; title: string; summary: string };
  featureProof?: { visualId: string; title: string; summary: string };
  scheduleProof?: { visualId: string; summary: string };
  tenantSwitcher: {
    label: string;
    defaultId: ProjectTenantId;
    options: ProjectTenantOption[];
  };
}

export interface ProjectDetail {
  slug: string;
  eyebrow: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  subtitle: string;
  scopeSummary: string;
  roleLine?: string;
  hardPart?: { label: string; copy: string };
  heroImage: ProjectVisual;
  ogImage?: ProjectOgImage;
  gallery: ProjectVisual[];
  architectureSections: ProjectDetailSection[];
  stackBuckets: ProjectTechBucket[];
  qualityHighlights: string[];
  references?: ProjectLink[];
  /** Per-project headings for the trailing sections, so no slug renders another project's copy. */
  sectionIntros: {
    architecture: ProjectDetailSectionIntro;
    stack: ProjectDetailSectionIntro;
    quality: ProjectDetailSectionIntro;
    references: ProjectDetailSectionIntro;
  };
  storyboard?: ProjectDetailStory;
}

export type StackContext = "Used at work" | "Part of my workflow" | "Built in projects";

/** Presence map node */
export interface PresenceNode {
  top: string;
  left: string;
  label: string;
  sub?: string;
  active: boolean;
}

/** SEO metadata */
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  ogImage: string;
}

// ─── Landing Page Types ──────────────────────────────────────────────────────

/** Accent keys used by the landing enhancement track */
export type LandingAccentKey = "sage" | "peach" | "sky" | "sand";

/** Service offering displayed in Landing Frame 3 */
export interface Service {
  id: string;
  title: string;
  description: string;
  /** Lucide icon key — resolved via renderIcon() at render time */
  icon: string;
  /** Optional restrained accent wash for landing-only visual treatments */
  accent?: LandingAccentKey;
  tags?: string[];
}

/** Landing hero CTA button */
export interface LandingCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

/** Content for the Landing Frame 1 hero section */
export interface LandingHeroFact {
  label: string;
  value: string;
  href: string;
}

export interface LandingHeroContent {
  /** Main display title rendered as the landing wordmark */
  displayTitle: string;
  /** Static professional identity shown below the wordmark */
  identity: string;
  /** One-sentence summary of the work */
  summary: string;
  /** Separate links for professional work and personal builds */
  facts: LandingHeroFact[];
  /** CTA buttons rendered in order */
  ctas: LandingCTA[];
}

// ─── Beyond The Terminal ─────────────────────────────────────────────────────

export type BeyondAlbumKind = "photo" | "event" | "quote" | "person" | "project";

export type BeyondAlbumSize = "hero" | "wide" | "tall" | "square";

export type BeyondAlbumColor =
  | "cobalt"
  | "coral"
  | "lemon"
  | "amber"
  | "lilac"
  | "pink";

export interface BeyondAlbumImage {
  src?: string;
  alt: string;
  aspectRatio?: string;
  dominantColor?: string;
}

export interface BeyondAlbumItem {
  id: string;
  kind: BeyondAlbumKind;
  title: string;
  caption: string;
  tags: string[];
  image?: BeyondAlbumImage;
  quote?: string;
  meta?: string;
  color: BeyondAlbumColor;
  size: BeyondAlbumSize;
}

export interface PortalTransitionIntent {
  href: string;
  originX: number;
  originY: number;
  source: "easter-egg" | "navigation";
  variant: "portal-bloom" | "accessible-fade";
  skin: "default" | "beyond-pastel-mist";
}

export type PortalTransitionPhase = "idle" | "covering" | "navigating" | "revealing";

export interface PortalTransitionState {
  phase: PortalTransitionPhase;
  intent: PortalTransitionIntent | null;
  isDestinationReady: boolean;
}
