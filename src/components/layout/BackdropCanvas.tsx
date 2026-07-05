"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./BackdropCanvas.module.css";

const SCROLL_STOPS = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1];
const SURFACE_COLORS = [
  "#07070A",
  "#0E0E14",
  "#17171F",
  "#0E0E14",
  "#07070A",
  "#17171F",
  "#07070A",
];

// Holographic aurora: three soft orbs whose hue rotates through
// lilac → teal → gold as the page scrolls (ambient "lighting per section").
export default function BackdropCanvas() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, SCROLL_STOPS, SURFACE_COLORS);

  const glowY = useTransform(scrollYProgress, [0, 1], ["-8vh", "20vh"]);
  const glowBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "rgba(185, 167, 255, 0.30)",
      "rgba(0, 245, 212, 0.22)",
      "rgba(255, 214, 107, 0.20)",
    ]
  );

  const orbTwoY = useTransform(scrollYProgress, [0, 1], ["12vh", "-14vh"]);
  const orbTwoX = useTransform(scrollYProgress, [0, 1], ["-6vw", "8vw"]);
  const orbTwoBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "rgba(0, 245, 212, 0.20)",
      "rgba(255, 214, 107, 0.16)",
      "rgba(185, 167, 255, 0.22)",
    ]
  );

  const orbThreeY = useTransform(scrollYProgress, [0, 1], ["30vh", "6vh"]);
  const orbThreeBackground = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "rgba(255, 214, 107, 0.14)",
      "rgba(185, 167, 255, 0.18)",
      "rgba(0, 245, 212, 0.16)",
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
        style={prefersReducedMotion ? undefined : { y: glowY, backgroundColor: glowBackground }}
      />
      <motion.span
        className={styles.orbTwo}
        style={
          prefersReducedMotion
            ? undefined
            : { y: orbTwoY, x: orbTwoX, backgroundColor: orbTwoBackground }
        }
      />
      <motion.span
        className={styles.orbThree}
        style={prefersReducedMotion ? undefined : { y: orbThreeY, backgroundColor: orbThreeBackground }}
      />
      <span className={styles.grain} aria-hidden="true" />
    </motion.div>
  );
}
