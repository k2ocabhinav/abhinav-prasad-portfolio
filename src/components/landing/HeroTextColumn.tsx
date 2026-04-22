"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import { landingHero } from "@/data/landing";
import { personal } from "@/data/personal";
import { landingFadeInUp, landingStagger, nameReveal } from "@/lib/animations";
import styles from "./HeroTextColumn.module.css";

const DEFAULT_ROLES = ["Developer", "Architect", "Cloud Engineer", "AI Systems Builder"];
const ROLE_CYCLE_INTERVAL = 2600;

interface HeroTextColumnProps {
  reduceMotion?: boolean;
}

export default function HeroTextColumn({
  reduceMotion = false,
}: HeroTextColumnProps) {
  const roles = landingHero.roleCycleWords ?? DEFAULT_ROLES;
  const tickRef = useRef(0);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const timer = setInterval(() => {
      tickRef.current += 1;
      setRoleIndex(tickRef.current % roles.length);
    }, ROLE_CYCLE_INTERVAL);

    return () => clearInterval(timer);
  }, [roles.length, reduceMotion]);

  return (
    <div className={styles.textColumn}>
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.18 }}
      >
        <PortalEntryTrigger
          href="/beyond-terminal"
          source="easter-egg"
          variant="portal-bloom"
          skin="beyond-pastel-mist"
          className={styles.nameLabel}
          aria-label={`${personal.name} — open Beyond the Terminal`}
        >
          <span className={styles.nameLabelInner}>
            <span className={styles.nameLabelBadge}>Beyond</span>
            <span className={styles.nameLabelName}>{personal.name}</span>
          </span>
        </PortalEntryTrigger>
      </motion.div>

      <motion.div
        className={styles.displayTitle}
        variants={reduceMotion ? undefined : nameReveal}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        {personal.name}
      </motion.div>

      <motion.div
        className={styles.roleLine}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.4 }}
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
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
      </motion.div>

      <motion.p
        className={styles.accentLine}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.52 }}
      >
        {landingHero.displayTitleAccent}
      </motion.p>

      <motion.p
        className={styles.supportingCopy}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.64 }}
      >
        {landingHero.supportingCopy}
      </motion.p>

      <motion.div
        className={styles.ctaGroup}
        variants={landingStagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delayChildren: 0.76 }}
      >
        {landingHero.ctas.map((cta) => (
          <motion.div
            key={cta.label}
            variants={reduceMotion ? undefined : landingFadeInUp}
          >
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
