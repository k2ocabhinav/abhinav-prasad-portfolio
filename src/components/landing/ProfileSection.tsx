"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { personal } from "@/data/personal";
import styles from "./ProfileSection.module.css";

// =============================================================================
// ProfileSection — Extracted from the legacy HeroSection profile reveal.
// This keeps the original portrait/annotation block reusable in the new landing.
// =============================================================================

interface ProfileSectionProps {
  reduceMotion?: boolean;
}

export default function ProfileSection({
  reduceMotion = false,
}: ProfileSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 25%"],
  });
  const portraitScale = useTransform(scrollYProgress, [0, 0.26, 0.6, 0.86, 1], [0.8, 0.88, 1, 1.08, 1.12]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.18, 0.52, 1], [0.42, 0.68, 0.95, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.32, 0.7, 1], [36, 18, 0, -14]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.14, 0.3, 0.54, 0.72, 1], [0, 0.76, 1, 0.72, 0, 0]);
  const hintY = useTransform(scrollYProgress, [0, 0.34, 0.7, 1], [26, 0, -18, -32]);
  const hintScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.96, 1, 0.98, 0.94]);
  const hintCopy =
    personal.hintCopy ??
    "Psst... click Abhinav above to explore beyond the terminal.";

  return (
    <section ref={sectionRef} className={styles.profileSection}>
      <div className={`content-container ${styles.profileContent}`}>
        <div className={styles.storyGrid}>
          <motion.div
            className={styles.portraitStage}
            style={
              reduceMotion
                ? undefined
                : {
                    scale: portraitScale,
                    opacity: portraitOpacity,
                    y: portraitY,
                  }
            }
          >
            <div className={styles.portraitHalo} />
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              whileInView={
                reduceMotion ? undefined : { scale: 1, opacity: 1 }
              }
              viewport={reduceMotion ? undefined : { once: true }}
              transition={reduceMotion ? undefined : { duration: 0.9, delay: 0.1 }}
              className={styles.imageContainer}
            >
              <Image
                src={personal.heroPhoto}
                alt={`${personal.name} portrait`}
                width={640}
                height={640}
                className={styles.heroImage}
                priority={false}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.hintStage}
            style={
              reduceMotion
                ? undefined
                : {
                    opacity: hintOpacity,
                    y: hintY,
                    scale: hintScale,
                  }
            }
          >
            <span className={styles.hintEyebrow}>Beyond The Terminal</span>
            <p className={styles.hintCopy}>{hintCopy}</p>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={reduceMotion ? undefined : { once: true }}
          transition={reduceMotion ? undefined : { delay: 0.8 }}
          className={styles.taglineBlock}
        >
          <p className={styles.profileTagline}>{personal.tagline}</p>
          <p className={styles.profileSubtitle}>{personal.subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
}
