"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { landingVisualIn, tiltSpring } from "@/lib/animations";
import { useCardTilt } from "@/hooks/useCardTilt";
import styles from "./HeroVisual3D.module.css";

export default function HeroVisual3D() {
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
    <div className={styles.visualContainer}>
      <motion.div
        ref={tiltRef}
        className={styles.composition}
        variants={landingVisualIn}
        initial="hidden"
        animate="visible"
        style={
          isDesktop
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
          animate={{ rotateY: [-3, 3, -3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`${styles.panel} ${styles.panelMiddle}`}
          animate={{ rotateY: [3, -2, 3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`${styles.panel} ${styles.panelFront}`}
          animate={{ rotateY: [-2, 2, -2] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={styles.dotOverlay} />
          <div className={styles.frontHighlight} />
        </motion.div>
        <motion.div
          className={styles.floatingAccent}
          animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
