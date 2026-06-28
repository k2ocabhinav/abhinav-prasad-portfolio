"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import LandingBlendSection from "./LandingBlendSection";
import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame3Services from "./LandingFrame3Services";
import ProfileSection from "./ProfileSection";
import styles from "./LandingExperience.module.css";
import type { PortfolioProfile, ServiceEntry } from "@/types";

interface LandingExperienceProps {
  profile: PortfolioProfile;
  services: ServiceEntry[];
}

export default function LandingExperience({
  profile,
  services,
}: LandingExperienceProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.landing}>
      {prefersReducedMotion ? (
        <>
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero
              hero={profile.hero}
              name={profile.hero.displayTitle}
              showScrollIndicator={false}
              reduceMotion
            />
          </section>
          <div className={`deferred-section ${styles.deferredFrames}`}>
            {services.length > 0 ? (
              <LandingFrame3Services services={services} reduceMotion />
            ) : null}
            <ProfileSection personal={profile.personal} reduceMotion />
          </div>
        </>
      ) : (
        <>
          <section id="hero" className={styles.heroFrame} aria-label="Hero">
            <LandingFrame1Hero hero={profile.hero} name={profile.hero.displayTitle} />
          </section>
          <div className={`deferred-section ${styles.deferredFrames}`}>
            {services.length > 0 ? (
              <LandingFrame3Services services={services} />
            ) : null}
            <LandingBlendSection />
            <ProfileSection personal={profile.personal} />
          </div>
        </>
      )}
    </div>
  );
}
