"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./ScrollIndicator.module.css";

// =============================================================================
// ScrollIndicator — Decorative scroll hint with a traveling dot
// =============================================================================

export default function ScrollIndicator() {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(400);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  const opacity = useTransform(scrollY, [0, viewportHeight * 0.45], [1, 0]);
  const y = useTransform(scrollY, [0, viewportHeight * 0.2], [0, 10]);

  return (
    // Decorative only — hidden from assistive tech and fades out as the user
    // begins exploring the landing sequence so it never competes with content.
    <motion.div
      data-scroll-indicator="true"
      className={styles.scrollIndicator}
      style={{ opacity, y }}
      aria-hidden="true"
    >
      <div className={styles.line}>
        <motion.span
          className={styles.dot}
          animate={{ y: [0, 28, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
