"use client";

import { MotionConfig } from "motion/react";
import LandingExperience from "@/components/landing/LandingExperience";
import Navigation from "@/components/layout/Navigation";
import ScrollProgress from "@/components/layout/ScrollProgress";
import SageOrb from "@/components/layout/SageOrb";
import Footer from "@/components/layout/Footer";
import FloatingArtifacts from "@/components/artifacts/FloatingArtifacts";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import PresenceSection from "@/components/sections/PresenceSection";
import TechStackSection from "@/components/sections/TechStackSection";
import WorksSection from "@/components/sections/WorksSection";
import AnimatedDivider from "@/components/ui/AnimatedDivider";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <LandingExperience />

      <SageOrb />
      <ScrollProgress />
      <Navigation />
      <FloatingArtifacts />

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
        <Footer />
      </main>
    </MotionConfig>
  );
}
