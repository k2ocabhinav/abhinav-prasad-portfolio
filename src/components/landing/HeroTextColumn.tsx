"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AnimatedName from "./AnimatedName";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import { landingHero } from "@/data/landing";
import { landingFadeInUp, landingStagger } from "@/lib/animations";
import styles from "./HeroTextColumn.module.css";

// =============================================================================
// HeroTextColumn — Hero content stack.
//
// Layout (top → bottom):
//   ABHINAV         ← AnimatedName: 18vw Syne 800, per-letter hover animations
//   Software [word] ← cycling role rotator (slides every 2.6s)
//   & Creative …    ← static accent line
//   Supporting copy
//   [Explore] [Contact] [Beyond Terminal →]
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
    <div className={styles.textColumn}>

      {/* ── Oversized animated name ───────────────────────────────── */}
      <AnimatedName name="ABHINAV" reduceMotion={reduceMotion} />

      {/* ── Cycling role line ────────────────────────────────────── */}
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
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-105%", opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
      </motion.div>

      {/* ── Static accent ────────────────────────────────────────── */}
      <motion.p
        className={styles.accentLine}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.68 }}
      >
        {landingHero.displayTitleAccent}
      </motion.p>

      {/* ── Supporting copy ──────────────────────────────────────── */}
      <motion.p
        className={styles.supportingCopy}
        variants={landingFadeInUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delay: 0.8 }}
      >
        {landingHero.supportingCopy}
      </motion.p>

      {/* ── CTAs ─────────────────────────────────────────────────── */}
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

        {/* Beyond Terminal — portal entry as a subtle tertiary CTA */}
        <motion.div variants={reduceMotion ? undefined : landingFadeInUp}>
          <PortalEntryTrigger
            href="/beyond-terminal"
            source="easter-egg"
            variant="portal-bloom"
            skin="beyond-pastel-mist"
            className={styles.beyondLink}
            aria-label="Open Beyond the Terminal — a personal side route"
          >
            Beyond the Terminal →
          </PortalEntryTrigger>
        </motion.div>
      </motion.div>
    </div>
  );
}
