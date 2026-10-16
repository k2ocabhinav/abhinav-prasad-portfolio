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
  tagline: string;
  subtitle: string;
  hintCopy?: string;
  heroAnnotations: HeroAnnotation[];
  /** Personal portrait or approved identity image URL */
  heroPhoto: string;
  heroSlides: HeroSlide[];
  heroSlideInterval: number;
  heroOverlayOpacity: number;
  location: Location;
  email: string;
  resumeHref: string;
  socials: SocialLink[];
  philosophy: string;
  presenceDescription: string;
  footerTagline: string;
}

/** Hero section image annotations */
export interface HeroAnnotation {
  label: string;
  position: "top-right" | "bottom-right" | "left";
}

/** Hero carousel slide */
export interface HeroSlide {
  image: string;
  alt: string;
}

/** A role held within a single employer experience */
export interface ExperienceRole {
  title: string;
  date: string;
  note?: string;
}

/** A semantically emphasized proof point within an experience workstream */
export interface ExperiencePoint {
  lead: string;
  detail: string;
}

/** A coherent area of engineering ownership within an employer experience */
export interface ExperienceWorkstream {
  id: string;
  title: string;
  summary: string;
  points: ExperiencePoint[];
  tools: string[];
}

/** Portfolio project */
export interface ProjectVisual {
  src: string;
  alt: string;
  caption: string;
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
  /** null = "Coming Soon", string = URL or slug */
  caseStudySlug: string | null;
  /** Reversed layout in grid */
  reversed?: boolean;
  /** Optional hero/support visuals for richer project storytelling */
  screenshots?: ProjectVisual[];
  /** Optional architecture callouts shown as concise bullets */
  architectureHighlights?: string[];
  /** Optional grouped stack coverage for architecture depth */
  techBuckets?: ProjectTechBucket[];
  /** Optional external CTA links */
  links?: ProjectLink[];
  /** Optional scope summary line for product framing */
  scopeSummary?: string;
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
  seo?: SEOData;
  orchestration: OrchestrationContent;
  profileIntro: ProfileIntroContent;
}

// ─── P7: Profile intro and AI coding-tool orchestration ────────────────────

export interface ProfileIntroContent {
  headline: string;
  proofLines: string[];
  stackItems: string[];
}

export interface OrchestrationMetric {
  value: string;
  label: string;
}

export interface OrchestrationContent {
  intro: string;
  method: string;
  metricsContext: string;
  metrics: OrchestrationMetric[];
  lesson: string;
}

export interface PortfolioProject extends Project {
  slug: string;
  status: PortfolioStatus;
  featured: boolean;
  featuredOrder?: number;
  worksOrder?: number;
  landingStory: LandingStory;
  detail?: ProjectDetail;
}

export interface ChronicleEntry {
  slug: string;
  status: PortfolioStatus;
  order?: number;
  company: string;
  period: string;
  companyContext: string;
  backendThesis: string;
  functionality: string;
  roles: ExperienceRole[];
  workstreams: ExperienceWorkstream[];
}

export interface StackGroup extends TechCategory {
  id: string;
  status: PortfolioStatus;
  order?: number;
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
  subtitle: string;
  scopeSummary: string;
  heroImage: ProjectVisual;
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

/** Tech stack category */
export type StackContext = "Used at work" | "Part of my workflow" | "Built in projects";

export interface TechCategory {
  icon: "cloud" | "cpu" | "database" | "terminal" | "sparkles";
  label: string;
  context: StackContext;
  items: string[];
}

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
export interface LandingHeroContent {
  /** Main display title rendered in Fraunces via AnimatedName */
  displayTitle: string;
  /** Uppercase label-font accent line below the role cycler */
  displayTitleAccent: string;
  /** Standalone role phrases cycled every 2.6 seconds */
  roleCycleWords?: string[];
  /** 1–2 sentence supporting copy */
  supportingCopy: string;
  /** CTA buttons rendered in order */
  ctas: LandingCTA[];
}

export type LandingProofBeatLabel =
  | "Problem"
  | "My Role"
  | "Shipped"
  | "Impact"
  | "Built"
  | "Prototype scope";

export interface LandingProofBeat {
  label: LandingProofBeatLabel;
  short: string;
  detail: string;
}

export interface LandingStoryVisual {
  kind: "screenshot" | "system" | "type";
  src?: string;
  alt: string;
  caption: string;
}

/** Featured project proof shown in the landing motion/story frame */
export interface LandingStory {
  id: string;
  eyebrow: string;
  title: string;
  claim: string;
  summary: string;
  tags: string[];
  icon: string;
  accent: LandingAccentKey;
  note: string;
  proofBeats: LandingProofBeat[];
  visual: LandingStoryVisual;
  projectCodeTone: "lime" | "ember" | "split";
  proof?: {
    problem: string;
    role: string;
    shipped: string;
    value: string;
  };
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
