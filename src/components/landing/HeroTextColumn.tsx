"use client";

import { motion } from "motion/react";
import { landingHero } from "@/data/landing";
import { personal } from "@/data/personal";
import { landingFadeInUp, landingStagger, titleMaskReveal } from "@/lib/animations";
import MagneticButton from "@/components/ui/MagneticButton";
import styles from "./HeroTextColumn.module.css";

interface HeroTextColumnProps {
  onNameClick: () => void;
  reduceMotion?: boolean;
}

export default function HeroTextColumn({
  onNameClick,
  reduceMotion = false,
}: HeroTextColumnProps) {
  const titleLines = landingHero.displayTitle.split("\n");

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNameClick();
    }
  };

  return (
    <div className={styles.textColumn}>
      <motion.span
        className={styles.nameLabel}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={landingFadeInUp}
        onClick={onNameClick}
        onKeyDown={handleNameKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${personal.name} -- click for a surprise`}
      >
        {personal.name}
      </motion.span>

      <motion.div
        className={styles.displayTitle}
        variants={landingStagger(0.08)}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        {titleLines.map((line) => (
          <span key={line} className={styles.displayTitleLine}>
            <motion.span
              variants={reduceMotion ? undefined : titleMaskReveal}
            >
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
