"use client";

import { MotionConfig } from "motion/react";
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
    <MotionConfig reducedMotion="user">
      {/* Landing experience - motion-rich rebrand hero flow */}
      <LandingExperience />

      {/* Global UI */}
      <SageOrb />
      <ScrollProgress />
      <FloatingArtifacts />

      {/* Main scrollable content */}
      <main
        className="content-container"
        style={{
          position: "relative",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <AnimatedDivider />
        <AboutSection />
        <AnimatedDivider />
        <ExperienceSection />
        <AnimatedDivider />
        <WorksSection />
        <AnimatedDivider />
        <TechStackSection />
        <AnimatedDivider />
        <PresenceSection />
        <AnimatedDivider />
        <ContactSection />

        {/* Footer */}
        <Footer />
      </main>
    </MotionConfig>
  );
}
