"use client";

import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import HeroTextColumn from "./HeroTextColumn";
import ScrollIndicator from "./ScrollIndicator";
import { landingStagger } from "@/lib/animations";
import styles from "./LandingFrame1Hero.module.css";

// =============================================================================
// LandingFrame1Hero — Full-viewport centered hero frame.
// Single-column layout: AnimatedName + role cycler + CTAs.
// HeroVisual3D has been retired (dormant). DoodleEngine was removed.
// =============================================================================

interface LandingFrame1HeroProps {
  showScrollIndicator?: boolean;
  reduceMotion?: boolean;
}

export default function LandingFrame1Hero({
  showScrollIndicator = true,
  reduceMotion = false,
}: LandingFrame1HeroProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [auraActive, setAuraActive] = useState(!reduceMotion);
  const [auraRested, setAuraRested] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const node = frameRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setAuraActive(isVisible);
        if (isVisible) {
          setAuraRested((current) => (current ? false : current));
        }
      },
      { threshold: [0, 0.18] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !auraActive) return;

    let restTimer = window.setTimeout(() => {
      setAuraRested(true);
    }, 18000);

    const scheduleRest = () => {
      window.clearTimeout(restTimer);
      restTimer = window.setTimeout(() => {
        setAuraRested(true);
      }, 9000);
    };

    const wakeAura = () => {
      setAuraRested((current) => (current ? false : current));
      scheduleRest();
    };

    window.addEventListener("pointermove", wakeAura, { passive: true });
    window.addEventListener("scroll", wakeAura, { passive: true });
    window.addEventListener("touchstart", wakeAura, { passive: true });
    window.addEventListener("keydown", wakeAura);

    return () => {
      window.clearTimeout(restTimer);
      window.removeEventListener("pointermove", wakeAura);
      window.removeEventListener("scroll", wakeAura);
      window.removeEventListener("touchstart", wakeAura);
      window.removeEventListener("keydown", wakeAura);
    };
  }, [auraActive, reduceMotion]);

  return (
    <m.div
      ref={frameRef}
      className={styles.frame}
      data-aura-active={auraActive && !auraRested ? "true" : "false"}
      variants={landingStagger(0.15)}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      data-home-hero-frame="true"
    >
      <div
        className={`${styles.backdrop} ${reduceMotion ? styles.backdropStatic : ""}`}
        aria-hidden="true"
      >
        <span className={`${styles.auroraPlane} ${styles.auroraLavender}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraRose}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraSky}`} />
        <span className={`${styles.auroraPlane} ${styles.auroraGold}`} />
        <span className={styles.auroraMesh} />
      </div>

      <div className={styles.content}>
        <HeroTextColumn reduceMotion={reduceMotion} />
      </div>

      {showScrollIndicator ? <ScrollIndicator /> : null}
    </m.div>
  );
}
