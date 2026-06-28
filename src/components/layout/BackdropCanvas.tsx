"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./BackdropCanvas.module.css";

const SCROLL_STOPS = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1];
const SURFACE_COLORS = [
  "#0A0807",
  "#14100E",
  "#1F1A17",
  "#14100E",
  "#0A0807",
  "#1F1A17",
  "#0A0807",
];

export default function BackdropCanvas() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, SCROLL_STOPS, SURFACE_COLORS);
  const glowY = useTransform(scrollYProgress, [0, 1], ["-10vh", "18vh"]);
  const glowBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "rgba(255, 107, 74, 0.32)",
      "rgba(255, 194, 75, 0.26)",
      "rgba(255, 107, 74, 0.28)",
    ]
  );

  return (
    <motion.div
      aria-hidden="true"
      className={styles.canvas}
      style={{ backgroundColor }}
      data-home-backdrop-canvas="true"
    >
      <motion.span
        className={styles.glow}
        style={
          prefersReducedMotion
            ? undefined
            : {
                y: glowY,
                backgroundColor: glowBackground,
              }
        }
      />
    </motion.div>
  );
}
