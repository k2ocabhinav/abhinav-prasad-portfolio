"use client";

import * as m from "motion/react-m";
import HeroTextColumn from "./HeroTextColumn";
import ScrollIndicator from "./ScrollIndicator";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — Full-viewport centered hero frame.
// Single-column layout: AnimatedName + role cycler + CTAs.
// HeroVisual3D has been retired (dormant). DoodleEngine was removed.
// =============================================================================

interface LandingFrame1HeroProps {
  showScrollIndicator?: boolean;
  reduceMotion?: boolean;
}

export default function LandingFrame1Hero({
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
      <div
        className={`${styles.backdrop} ${reduceMotion ? styles.backdropStatic : ""}`}
        aria-hidden="true"
      >
        <span className={`${styles.auroraPlane} ${styles.auroraLavender}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraRose}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraSky}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraGold}`} />
        <span className={styles.auroraMesh} />
      </div>

      <div className={styles.content}>
        <HeroTextColumn reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </m.div>
  );
}
