"use client";

import { motion } from "motion/react";
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
    <motion.div
      className={styles.frame}
      variants={landingStagger(0.15)}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
    >
      <div className={styles.content}>
        <HeroTextColumn reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </motion.div>
  );
}
