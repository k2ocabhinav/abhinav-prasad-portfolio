"use client";

import { motion } from "motion/react";
import { landingStagger } from "@/lib/animations";
import DoodleEngine from "./DoodleEngine";
import HeroTextColumn from "./HeroTextColumn";
import ScrollIndicator from "./ScrollIndicator";
import styles from "./LandingFrame1Hero.module.css";

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
      <DoodleEngine />

      <div className={styles.content}>
        <HeroTextColumn reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </motion.div>
  );
}
