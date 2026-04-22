"use client";

import { motion } from "motion/react";
import HeroTextColumn from "./HeroTextColumn";
import DoodleEngine from "./DoodleEngine";
import ScrollIndicator from "./ScrollIndicator";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — Frame 1 wrapper.
// Single-column centered layout: DoodleEngine as decorative overlay,
// HeroTextColumn as the primary content layer above it.
// HeroVisual3D has been retired — kept as dormant reference in the file system.
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
      {/* Doodle accents — positioned absolutely, z-index 1, pointer-events none */}
      <DoodleEngine />

      {/* Primary content — z-index 2, sits above the doodles */}
      <div className={styles.content}>
        <HeroTextColumn reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </motion.div>
  );
}
