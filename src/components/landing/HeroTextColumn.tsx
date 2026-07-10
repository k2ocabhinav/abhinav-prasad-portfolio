"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AnimatedName from "./AnimatedName";
import MagneticButton from "@/components/ui/MagneticButton";
import type { LandingHeroContent } from "@/types";
import { landingFadeInUp, landingStagger } from "@/lib/animations";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — Hero content stack.
// =============================================================================

const DEFAULT_ROLES = [
  "Backend Engineer",
  "Full-Stack Developer",
  "Database Engineer",
  "Java & Spring Boot",
];
const ROLE_CYCLE_MS = 2600;

interface HeroTextColumnProps {
  hero: LandingHeroContent;
  name: string;
  reduceMotion?: boolean;
}

export default function HeroTextColumn({
  hero,
  name,
  reduceMotion = false,
}: HeroTextColumnProps) {
  const roles = hero.roleCycleWords?.length ? hero.roleCycleWords : DEFAULT_ROLES;
  const tickRef = useRef(0);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      tickRef.current += 1;
      setRoleIndex(tickRef.current % roles.length);
    }, ROLE_CYCLE_MS);
    return () => clearInterval(timer);
  }, [roles.length, reduceMotion]);

  return (
    <div className={styles.textColumn} data-home-hero-text="true">
      <AnimatedName
        name={name}
        reduceMotion={reduceMotion}
        portalTrigger={{
          href: "/beyond-terminal",
          source: "easter-egg",
          variant: "portal-bloom",
          skin: "beyond-pastel-mist",
        }}
      />

      <motion.div
        className={styles.roleLine}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.55 }}
      >
        {reduceMotion ? (
          <span className={styles.cyclerWordStatic}>{roles[0]}</span>
        ) : (
          <span className={styles.cyclerOuter}>
            <AnimatePresence mode="wait">
              <motion.span
                key={roles[roleIndex]}
                className={styles.cyclerWord}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
      </motion.div>

      <motion.p
        className={styles.accentLine}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.68 }}
      >
        {hero.displayTitleAccent}
      </motion.p>

      <motion.p
        className={styles.supportingCopy}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.8 }}
      >
        {hero.supportingCopy}
      </motion.p>

      <motion.div
        className={styles.ctaGroup}
        variants={landingStagger(0.1)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delayChildren: 0.92 }}
      >
        {hero.ctas.map((cta) => (
          <motion.div key={cta.label} variants={reduceMotion ? undefined : landingFadeInUp}>
            {cta.variant === "primary" ? (
              <MagneticButton href={cta.href} variant="glow">
                {cta.label}
              </MagneticButton>
            ) : (
              <a href={cta.href} className={styles.secondaryCta}>
                {cta.label}
              </a>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
