"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import LandingBlendSection from "./LandingBlendSection";
import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame2WorkStack from "./LandingFrame2WorkStack";
import LandingFrame3Services from "./LandingFrame3Services";
import ProfileSection from "./ProfileSection";
import styles from "./LandingExperience.module.css";

export default function LandingExperience() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.landing}>
      {prefersReducedMotion ? (
        <>
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero showScrollIndicator={false} reduceMotion />
          </section>
          <div className={`deferred-section ${styles.deferredFrames}`}>
            <LandingFrame2WorkStack staticMode />
            <LandingFrame3Services reduceMotion />
            <ProfileSection reduceMotion />
          </div>
        </>
      ) : (
        <>
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero />
          </section>
          <div className={`deferred-section ${styles.deferredFrames}`}>
            <LandingFrame2WorkStack />
            <LandingFrame3Services />
            <LandingBlendSection />
            <ProfileSection />
          </div>
        </>
      )}
    </div>
  );
}
