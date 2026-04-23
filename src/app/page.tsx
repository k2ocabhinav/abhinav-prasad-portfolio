"use client";

import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import FloatingArtifacts from "@/components/artifacts/FloatingArtifacts";
import LandingExperience from "@/components/landing/LandingExperience";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import WorksSection from "@/components/sections/WorksSection";
import TechStackSection from "@/components/sections/TechStackSection";
import PresenceSection from "@/components/sections/PresenceSection";
import ContactSection from "@/components/sections/ContactSection";

// =============================================================================
// Home Page — Composes all sections with layout shell
// =============================================================================

export default function Home() {
  return (
    <>
      {/* Landing experience - motion-rich rebrand hero flow */}
      <LandingExperience />

      {/* Global UI */}
      <SageOrb />
      <ScrollProgress />
      <FloatingArtifacts />

      {/* Main scrollable content */}
      <main
        className="deferred-section deferred-section-deep"
        style={{
          position: "relative",
          backgroundColor: "transparent",
        }}
      >
        <AboutSection
          tone="pastel-cream"
          blendTopFrom="hero-light"
          blendBottomTo="pastel-blue"
          blendStyle="bold"
        />
        <ExperienceSection
          tone="pastel-blue"
          blendTopFrom="pastel-cream"
          blendBottomTo="pastel-blush"
          blendStyle="bold"
        />
        <WorksSection
          tone="pastel-blush"
          blendTopFrom="pastel-blue"
          blendBottomTo="pastel-peach"
          blendStyle="bold"
        />
        <TechStackSection
          tone="pastel-peach"
          blendTopFrom="pastel-blush"
          blendBottomTo="pastel-mint"
          blendStyle="bold"
        />
        <PresenceSection
          tone="pastel-mint"
          blendTopFrom="pastel-peach"
          blendBottomTo="hero-light"
          blendStyle="bold"
        />
        <ContactSection
          tone="hero-light"
          blendTopFrom="pastel-mint"
          blendStyle="bold"
        />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
