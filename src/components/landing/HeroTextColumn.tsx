"use client";

import { motion } from "motion/react";
import PortalEntryTrigger from "@/components/beyond-terminal/PortalEntryTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import { landingHero } from "@/data/landing";
import { personal } from "@/data/personal";
import { landingFadeInUp, landingStagger, titleMaskReveal } from "@/lib/animations";
import styles from "./HeroTextColumn.module.css";

export default function HeroTextColumn({
  reduceMotion = false,
}: {
  reduceMotion?: boolean;
}) {
  const titleLines = landingHero.displayTitle.split("\n");

  return (
    <div className={styles.textColumn}>
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
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
        variants={landingStagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        {titleLines.map((line) => (
          <span key={line} className={styles.displayTitleLine}>
            <motion.span variants={reduceMotion ? undefined : titleMaskReveal}>
              {line}
            </motion.span>
          </span>
        ))}
      </motion.div>

      <motion.p
        className={styles.accentLine}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.2 }}
      >
        {landingHero.displayTitleAccent}
      </motion.p>

      <motion.p
        className={styles.supportingCopy}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        transition={reduceMotion ? undefined : { delay: 0.4 }}
      >
        {landingHero.supportingCopy}
      </motion.p>

      <motion.div
        className={styles.ctaGroup}
        variants={landingStagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={reduceMotion ? undefined : { delayChildren: 0.5 }}
      >
        {landingHero.ctas.map((cta) => (
          <motion.div
            key={cta.label}
            variants={reduceMotion ? undefined : landingFadeInUp}
          >
            <MagneticButton
              href={cta.href}
              variant={cta.variant === "primary" ? "outline" : "ghost"}
            >
              {cta.label}
            </MagneticButton>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
