"use client";

import * as m from "motion/react-m";
import { useLandingNavMode } from "@/hooks/useLandingNavMode";
import styles from "./BrandMark.module.css";

export default function BrandMark() {
  const navMode = useLandingNavMode(120);
  const isVisible = navMode === "glass";

  return (
    <m.a
      href="#hero"
      aria-label="Back to Abhinav hero"
      data-site-chrome="brand"
      className={styles.brandMark}
      initial={false}
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: -12, pointerEvents: "none" },
        visible: { opacity: 1, y: 0, pointerEvents: "auto" },
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.initial}>A</span>
      <span className={styles.name}>Abhinav</span>
    </m.a>
  );
}
