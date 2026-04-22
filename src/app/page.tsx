"use client";

import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import AnimatedDivider from "@/components/ui/AnimatedDivider";
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
        <AnimatedDivider fromTone="hero-light" toTone="pastel-cream" />
        <AboutSection tone="pastel-cream" />
        <AnimatedDivider fromTone="pastel-cream" toTone="pastel-blue" />
        <ExperienceSection tone="pastel-blue" />
        <AnimatedDivider fromTone="pastel-blue" toTone="pastel-blush" />
        <WorksSection tone="pastel-blush" />
        <AnimatedDivider fromTone="pastel-blush" toTone="pastel-peach" />
        <TechStackSection tone="pastel-peach" />
        <AnimatedDivider fromTone="pastel-peach" toTone="pastel-mint" />
        <PresenceSection tone="pastel-mint" />
        <AnimatedDivider fromTone="pastel-mint" toTone="hero-light" />
        <ContactSection tone="hero-light" />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
