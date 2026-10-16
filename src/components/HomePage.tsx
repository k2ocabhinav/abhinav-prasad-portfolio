"use client";

import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import BackdropCanvas from "@/components/layout/BackdropCanvas";
import BrandMark from "@/components/layout/BrandMark";
import Marquee from "@/components/layout/Marquee";
import Navigation from "@/components/layout/Navigation";
import LandingExperience from "@/components/landing/LandingExperience";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WorksSection from "@/components/sections/WorksSection";
import OrchestrationSection from "@/components/sections/OrchestrationSection";
import TechStackSection from "@/components/sections/TechStackSection";
import PresenceSection from "@/components/sections/PresenceSection";
import ContactSection from "@/components/sections/ContactSection";
import type {
  ChronicleEntry,
  PortfolioProfile,
  PortfolioProject,
  ServiceEntry,
  StackGroup,
} from "@/types";

interface HomeContent {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  chronicleEntries: ChronicleEntry[];
  stackGroups: StackGroup[];
  services: ServiceEntry[];
}

interface HomePageProps {
  content: HomeContent;
}

export default function HomePage({ content }: HomePageProps) {
  const { profile } = content;

  return (
    <>
      <a className="skip-link" href="#site-content">
        Skip to content
      </a>

      <BackdropCanvas />

      <header data-site-banner="true">
        <BrandMark />
      </header>

      <main
        id="site-content"
        tabIndex={-1}
        className="deferred-section deferred-section-deep"
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <LandingExperience
          profile={profile}
          services={content.services}
        />

        <AboutSection personal={profile.personal} tone="pastel-cream" />
        <ExperienceSection experiences={content.chronicleEntries} tone="pastel-blue" />
        <WorksSection projects={content.projects} tone="pastel-blush" />
        <OrchestrationSection content={profile.orchestration} />
        <Marquee />
        <TechStackSection techCategories={content.stackGroups} tone="pastel-peach" />
        <PresenceSection
          personal={profile.personal}
          presenceNodes={profile.presenceNodes}
          tone="pastel-mint"
        />
        <ContactSection personal={profile.personal} tone="hero-light" />
      </main>

      <Footer personal={profile.personal} />

      <SageOrb />
      <ScrollProgress />

      <Navigation />
    </>
  );
}
