"use client";

import { motion } from "motion/react";
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
  return (
    <section className={styles.profileSection}>
      <div className={`content-container ${styles.profileContent}`}>
        <span className={styles.profileRoleLabel}>{personal.title}</span>

        <div className={styles.imageWrapper}>
          <motion.div className={styles.imageContainer}>
            <motion.div
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              whileInView={
                reduceMotion ? undefined : { scale: 1, opacity: 0.9 }
              }
              viewport={reduceMotion ? undefined : { once: true }}
              transition={reduceMotion ? undefined : { duration: 1, delay: 0.2 }}
            >
              <Image
                src={personal.heroPhoto}
                alt={`${personal.name} -- Systems Architect`}
                width={288}
                height={288}
                className={styles.heroImage}
                priority={false}
              />
            </motion.div>

            {personal.heroAnnotations.map((anno, index) => (
              <motion.div
                key={index}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: anno.position === "left" ? 20 : -20 }
                }
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={reduceMotion ? undefined : { once: true }}
                transition={
                  reduceMotion ? undefined : { delay: 0.5 + index * 0.1 }
                }
                className={`${styles.annotation} ${
                  styles[`annotation_${anno.position.replace("-", "_")}`]
                }`}
              >
                {anno.position !== "left" ? (
                  <div className={styles.annotationLine} />
                ) : null}
                <span className={styles.annotationLabel}>{anno.label}</span>
                {anno.position === "left" ? (
                  <div className={styles.annotationLine} />
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className={styles.mobileAnnotationList} aria-label="Core strengths">
          {personal.heroAnnotations.map((annotation) => (
            <span key={annotation.label} className={styles.mobileAnnotation}>
              {annotation.label}
            </span>
          ))}
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
