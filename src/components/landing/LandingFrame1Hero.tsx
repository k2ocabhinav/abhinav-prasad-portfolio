"use client";

import { motion } from "motion/react";
import HeroTextColumn from "./HeroTextColumn";
import HeroVisual3D from "./HeroVisual3D";
import ScrollIndicator from "./ScrollIndicator";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

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
      {showScrollIndicator ? <ScrollIndicator /> : null}
    </motion.div>
  );
}
