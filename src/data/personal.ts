import type { PersonalData } from "@/types";

// =============================================================================
// Personal Data — Edit this file to update all personal information site-wide
// =============================================================================

export const personal: PersonalData = {
  name: "Abhinav",

  title: "Software Architect & Creative Technologist",

  tagline: "Software Engineer · Cloud Architect · AI Systems",

  subtitle:
    "Building the invisible architecture that powers digital ecosystems with precision and craft.",

  heroAnnotations: [
    { label: "Systemic Depth", position: "top-right" },
    { label: "Scalable Logic", position: "bottom-right" },
    { label: "Intentional Craft", position: "left" },
  ],

  // Placeholder portrait — replace with the actual personal photo (grayscale applied via CSS)
  heroPhoto:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face",

  heroSlides: [
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop",
      alt: "Systems architect at work",
    },
    {
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop",
      alt: "Global distributed architecture",
    },
    {
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=1080&fit=crop",
      alt: "Cloud infrastructure and circuits",
    },
    {
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop",
      alt: "Data center architecture",
    },
  ],

  heroSlideInterval: 4000,
  heroOverlayOpacity: 0.3,

  location: {
    city: "Badlapur",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
  },

  email: "abhinav@abhinav.dev",

  socials: [
    {
      platform: "github",
      label: "GitHub",
      href: "https://github.com/abhinav",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com/in/abhinav",
    },
    {
      platform: "email",
      label: "Send Email",
      href: "mailto:abhinav@abhinav.dev",
    },
  ],

  philosophy:
    "Design for failure, build for scale. My approach to engineering treats systems as living organisms. By leveraging distributed architectures and cloud-native patterns, I ensure the foundation is as resilient as it is invisible — whether the system is a data pipeline, an AI application, or this very site.",

  presenceDescription:
    "Operating within distributed architectures, my physical location is secondary to the uptime of the systems I build. Currently optimized for global synchronization.",

  footerTagline: "Precision · Craft · Architecture",
};
