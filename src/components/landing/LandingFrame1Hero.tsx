"use client";

import { motion } from "motion/react";
import HeroTextColumn from "./HeroTextColumn";
import HeroVisual3D from "./HeroVisual3D";
import ScrollIndicator from "./ScrollIndicator";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — Frame 1 wrapper.
// Couples the editorial copy column with the decorative 3D visual.
// =============================================================================

interface LandingFrame1HeroProps {
  onNameClick: () => void;
  showScrollIndicator?: boolean;
  reduceMotion?: boolean;
}

export default function LandingFrame1Hero({
  onNameClick,
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
      <div className={styles.grid}>
        <HeroTextColumn onNameClick={onNameClick} reduceMotion={reduceMotion} />
        <HeroVisual3D reduceMotion={reduceMotion} />
      </div>
      {/* The hint is suppressed in reduced motion and can also be disabled by the orchestrator. */}
      {showScrollIndicator ? <ScrollIndicator /> : null}
    </motion.div>
  );
}
