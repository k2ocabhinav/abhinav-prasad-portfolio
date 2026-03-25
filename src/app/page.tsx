"use client";

import { MotionConfig } from "motion/react";
import Navigation from "@/components/layout/Navigation";
import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import AnimatedDivider from "@/components/ui/AnimatedDivider";
import HeroSection from "@/components/sections/HeroSection";
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
      <div className="snap-container" style={{ position: "relative" }}>
        {/* Global UI */}
        <SageOrb />
        <ScrollProgress />
        <Navigation />

        {/* Main Content */}
        <main className="content-container">
          <HeroSection />
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
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </MotionConfig>
  );
}
