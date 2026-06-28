"use client";

import * as m from "motion/react-m";
import HeroTextColumn from "./HeroTextColumn";
import ScrollIndicator from "./ScrollIndicator";
import type { LandingHeroContent } from "@/types";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — Full-viewport centered hero frame.
// Single-column layout: AnimatedName + role cycler + CTAs.
// HeroVisual3D has been retired (dormant). DoodleEngine was removed.
// =============================================================================

interface LandingFrame1HeroProps {
  hero: LandingHeroContent;
  name: string;
  showScrollIndicator?: boolean;
  reduceMotion?: boolean;
}

export default function LandingFrame1Hero({
  hero,
  name,
  showScrollIndicator = true,
  reduceMotion = false,
}: LandingFrame1HeroProps) {
  return (
    <m.div
      className={styles.frame}
      variants={landingStagger(0.15)}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      data-home-hero-frame="true"
    >
      <div className={styles.content}>
        <HeroTextColumn hero={hero} name={name} reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </m.div>
  );
}
