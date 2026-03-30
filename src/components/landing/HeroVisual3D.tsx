"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { landingVisualIn, tiltSpring } from "@/lib/animations";
import { useCardTilt } from "@/hooks/useCardTilt";
import styles from "./HeroVisual3D.module.css";

interface HeroVisual3DProps {
  reduceMotion?: boolean;
}

export default function HeroVisual3D({
  reduceMotion = false,
}: HeroVisual3DProps) {
  const { ref: tiltRef, tilt } = useCardTilt(8);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateDesktopState = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);

    return () => mediaQuery.removeEventListener("change", updateDesktopState);
  }, []);

  return (
    <div className={styles.visualContainer} aria-hidden="true">
      <motion.div
        ref={reduceMotion ? undefined : tiltRef}
        className={styles.composition}
        variants={reduceMotion ? undefined : landingVisualIn}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        style={
          isDesktop && !reduceMotion
            ? {
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                transformPerspective: 1200,
              }
            : { transformPerspective: 1200 }
        }
        transition={tiltSpring}
      >
        <motion.div
          className={`${styles.panel} ${styles.panelBack}`}
          animate={reduceMotion ? undefined : { rotateY: [-3, 3, -3] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className={`${styles.panel} ${styles.panelMiddle}`}
          animate={reduceMotion ? undefined : { rotateY: [3, -2, 3] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className={`${styles.panel} ${styles.panelFront}`}
          animate={reduceMotion ? undefined : { rotateY: [-2, 2, -2] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <div className={styles.dotOverlay} />
          <div className={styles.frontHighlight} />
        </motion.div>
        <motion.div
          className={styles.floatingAccent}
          animate={reduceMotion ? undefined : { y: [0, -10, 0], x: [0, 8, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 5.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </motion.div>
    </div>
  );
}
