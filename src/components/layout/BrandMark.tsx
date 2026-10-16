"use client";

import { motion } from "motion/react";
import { useLandingNavMode } from "@/hooks/useLandingNavMode";
import styles from "./BrandMark.module.css";

export default function BrandMark() {
  const navMode = useLandingNavMode(120);
  const isVisible = navMode === "glass";

  return (
    <motion.a
      href="#hero"
      aria-label="Abhinav, back to top"
      data-site-chrome="brand"
      className={styles.brandMark}
      initial={false}
      animate={isVisible ? "visible" : "hidden"}
      inert={!isVisible}
      variants={{
        hidden: { opacity: 0, y: -12, pointerEvents: "none" },
        visible: { opacity: 1, y: 0, pointerEvents: "auto" },
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.initial} aria-hidden="true">
        A
      </span>
      <span className={styles.name}>Abhinav</span>
    </motion.a>
  );
}
