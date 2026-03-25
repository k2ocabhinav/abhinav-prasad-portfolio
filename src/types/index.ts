// =============================================================================
// Portfolio — Shared Type Definitions
// =============================================================================

/** Navigation section definition */
export interface NavSection {
  id: string;
  label: string;
}

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
  location: Location;
  email: string;
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

/** Work experience entry */
export interface Experience {
  date: string;
  title: string;
  company: string;
  tags: string[];
}

/** Portfolio project */
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
