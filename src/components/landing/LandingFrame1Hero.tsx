"use client";

import * as m from "motion/react-m";
import HeroTextColumn from "./HeroTextColumn";
import HeroProofStrip from "./HeroProofStrip";
import ScrollIndicator from "./ScrollIndicator";
import DispatchBoard from "./dispatch/DispatchBoard";
import type { LandingHeroContent } from "@/types";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — the hero.
//
// Masthead and text stack on the left, the dispatch board beside them on
// desktop and under them on phones, and a burgundy floor band carrying the
// proof points. The board's play-through is the one motion moment here.
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
        <div className={styles.boardColumn} data-home-hero-board="true">
          <DispatchBoard />
        </div>
      </div>

      <div className={styles.band} data-hero-band="true">
        <HeroProofStrip />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </m.div>
  );
}
