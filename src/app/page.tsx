"use client";

import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
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

      {/* Main scrollable content */}
      <main
        className="deferred-section deferred-section-deep"
        style={{
          position: "relative",
          backgroundColor: "transparent",
        }}
      >
        <AboutSection tone="pastel-cream" />
        <ExperienceSection tone="pastel-blue" />
        <WorksSection tone="pastel-blush" />
        <TechStackSection tone="pastel-peach" />
        <PresenceSection tone="pastel-mint" />
        <ContactSection tone="hero-light" />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
