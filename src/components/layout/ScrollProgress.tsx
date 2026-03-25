"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { progressSpring } from "@/lib/animations";
import styles from "./ScrollProgress.module.css";

// =============================================================================
// ScrollProgress — Fixed top progress bar tracking scroll position
// =============================================================================

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, progressSpring);

  return (
    <motion.div
      className={styles.progressBar}
      style={{ scaleX, transformOrigin: "left" }}
    />
  );
}
