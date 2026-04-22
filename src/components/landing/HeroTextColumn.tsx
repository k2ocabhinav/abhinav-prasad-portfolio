"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AnimatedName from "./AnimatedName";
import MagneticButton from "@/components/ui/MagneticButton";
import { landingHero } from "@/data/landing";
import { landingFadeInUp, landingStagger } from "@/lib/animations";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — Hero content stack.
// =============================================================================

const DEFAULT_ROLES = ["Developer", "Architect", "Cloud Engineer", "AI Systems Builder"];
const ROLE_CYCLE_MS = 2600;

export default function HeroTextColumn({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const roles = landingHero.roleCycleWords ?? DEFAULT_ROLES;
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
        name="Abhinav"
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
        <span className={styles.rolePrefix}>Software</span>

        {reduceMotion ? (
          <span className={styles.cyclerWordStatic}>{roles[0]}</span>
        ) : (
          <span className={styles.cyclerOuter}>
            <AnimatePresence mode="wait">
              <motion.span
                key={roles[roleIndex]}
                className={styles.cyclerWord}
                initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
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
        {landingHero.displayTitleAccent}
      </motion.p>

      <motion.p
        className={styles.supportingCopy}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.8 }}
      >
        {landingHero.supportingCopy}
      </motion.p>

      <motion.div
        className={styles.ctaGroup}
        variants={landingStagger(0.1)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delayChildren: 0.92 }}
      >
        {landingHero.ctas.map((cta) => (
          <motion.div key={cta.label} variants={reduceMotion ? undefined : landingFadeInUp}>
            <MagneticButton
              href={cta.href}
              variant={cta.variant === "primary" ? "glow" : "ghost"}
            >
              {cta.label}
            </MagneticButton>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
