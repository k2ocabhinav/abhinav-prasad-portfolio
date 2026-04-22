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
  title: string;
  tagline: string;
  subtitle: string;
  heroAnnotations: HeroAnnotation[];
  /** Personal portrait image URL — grayscale filter applied via CSS */
  heroPhoto: string;
  heroSlides: HeroSlide[];
  heroSlideInterval: number;
  heroOverlayOpacity: number;
  location: Location;
  email: string;
  resumeHref?: string | null;
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

/** Work experience entry */
export interface Experience {
  date: string;
  title: string;
  company: string;
  tags: string[];
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

export interface ProjectDetailSection {
  title: string;
  description: string;
  points: string[];
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
}

/** Tech stack category */
export interface TechCategory {
  icon: "cloud" | "database" | "terminal" | "sparkles";
  label: string;
  content: string;
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
  url: string;
  ogImage: string;
}

/** Floating artifact definition for theme system */
export interface ArtifactDef {
  id: string;
  svgPath: string;
  viewBox?: string;
  fill: string;
  /** Optional stroke color for outlined SVG shapes */
  stroke?: string;
  /** Optional stroke width in px */
  strokeWidth?: number;
  size: number;
  opacity: number;
  x: number;
  y: number;
  scrollRange: [number, number];
  bobAmplitude: number;
  bobDuration: number;
  rotationSwing: number;
}

/** Theme containing floating artifacts */
export interface Theme {
  id: string;
  name: string;
  artifacts: ArtifactDef[];
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

/** Hand-drawn SVG doodle accent (kept for reference; DoodleEngine currently inactive) */
export interface DoodleAsset {
  id: string;
  svgPath: string;
  viewBox: string;
  size: number;
  anchorHint: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "inlineLeft" | "inlineRight";
}

/** Content for the Landing Frame 1 hero section */
export interface LandingHeroContent {
  /** Main display title rendered in Syne 800 via AnimatedName */
  displayTitle: string;
  /** Accent line in Cormorant italic below the role cycler */
  displayTitleAccent: string;
  /** Words cycled after "Software " every 2.6 s */
  roleCycleWords?: string[];
  /** 1–2 sentence supporting copy */
  supportingCopy: string;
  /** CTA buttons rendered in order */
  ctas: LandingCTA[];
}

/** Conceptual vignette shown in the landing motion/story frame */
export interface LandingStory {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
  icon: string;
  accent: LandingAccentKey;
  note: string;
}

// ─── Beyond The Terminal ─────────────────────────────────────────────────────

export interface BeyondVisual {
  kind: "image";
  src: string;
  alt: string;
  aspectRatio: string;
  priority?: boolean;
  treatment?: "obsidian" | "chrome" | "paper";
  frame?: "default" | "offset" | "signal";
  surfaceTone?: "neutral" | "lavender" | "powder" | "silver" | "peach";
}

export type BeyondMedia = BeyondVisual;

export interface BeyondNote {
  id: string;
  label: string;
  value: string;
  tone: "muted" | "accent" | "warm";
}

export interface BeyondSymbol {
  id: string;
  src: string;
  alt: string;
  placement: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  accent: "chrome" | "signal" | "ghost";
}

export interface BeyondCardAction {
  label: string;
  href: string;
  kind: "link" | "route";
}

export type BeyondCardLayout =
  | "hero_split"
  | "wide_strip"
  | "wide_strip_reverse"
  | "journal_feature"
  | "journal_secondary";

export type BeyondCardAccent = "lavender" | "powder" | "silver" | "peach";

export interface BeyondCard {
  id: string;
  kind: "statement" | "feature" | "artifact" | "journal";
  layout: BeyondCardLayout;
  accent: BeyondCardAccent;
  alignment: "start" | "center";
  eyebrow: string;
  title: string;
  deck: string;
  body: string[];
  media?: BeyondVisual;
  notes?: BeyondNote[];
  symbol?: BeyondSymbol;
  cta?: BeyondCardAction;
}

export interface BeyondAct {
  id: string;
  title: string;
  deck: string;
  cards: BeyondCard[];
}

export interface BeyondPostMeta {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  cover: BeyondVisual;
  featured: boolean;
  displaySize?: "feature" | "secondary";
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
