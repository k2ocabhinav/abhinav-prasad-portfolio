"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame2WorkStack from "./LandingFrame2WorkStack";
import LandingFrame3Services from "./LandingFrame3Services";
import LandingBlendSection from "./LandingBlendSection";
import ProfileSection from "./ProfileSection";
import styles from "./LandingExperience.module.css";

// =============================================================================
// LandingExperience — Active homepage hero flow.
// Coordinates reduced-motion branching and preserves the easter egg overlay.
// =============================================================================

export default function LandingExperience() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.landing}>
      {prefersReducedMotion ? (
        <>
          {/* Reduced motion shows the same information without scroll-driven choreography. */}
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero showScrollIndicator={false} reduceMotion />
          </section>
          <LandingFrame2WorkStack staticMode />
          <LandingFrame3Services reduceMotion />
          <ProfileSection reduceMotion />
        </>
      ) : (
        <>
          {/* Interactive path preserves the full frame-by-frame landing sequence. */}
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero />
          </section>
          <LandingFrame2WorkStack />
          <LandingFrame3Services />
          <LandingBlendSection />
          <ProfileSection />
        </>
      )}
    </div>
  );
}
