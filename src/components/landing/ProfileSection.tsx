"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { personal } from "@/data/personal";
import FlipRevealText from "@/components/ui/FlipRevealText";
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
    offset: ["start 86%", "end 22%"],
  });
  const portraitScale = useTransform(scrollYProgress, [0, 0.32, 0.64, 1], [0.86, 0.92, 1.02, 1.08]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.2, 0.58, 1], [0.5, 0.78, 0.96, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.38, 0.74, 1], [34, 14, -2, -12]);
  const portraitX = useTransform(scrollYProgress, [0, 0.6, 1], [14, 0, -8]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.9, 1], [0.96, 0.96, 0.42]);
  const hintY = useTransform(scrollYProgress, [0, 0.72, 1], [4, -4, -14]);
  const hintCopy =
    personal.hintCopy ??
    "Psst... click Abhinav above to explore beyond the terminal.";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          root.dataset.profileFocus = "true";
          return;
        }

        delete root.dataset.profileFocus;
      },
      { threshold: [0, 0.3, 0.55, 0.8] }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      delete root.dataset.profileFocus;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.profileSection}
      data-home-profile-stage="true"
    >
      <div className={styles.profileStageWash} aria-hidden="true" />
      <div className={`content-container ${styles.profileContent}`}>
        <div className={styles.storyGrid}>
          <motion.div
            className={styles.portraitColumn}
            style={
              reduceMotion
                ? undefined
                : {
                    scale: portraitScale,
                    opacity: portraitOpacity,
                    y: portraitY,
                    x: portraitX,
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
              transition={reduceMotion ? undefined : { duration: 0.82, delay: 0.08 }}
              className={styles.imageFrame}
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

          <div className={styles.copyColumn}>
            <motion.span
              className={styles.hintEyebrow}
              style={reduceMotion ? undefined : { opacity: hintOpacity, y: hintY }}
            >
              <FlipRevealText
                text="Beyond The Terminal"
                mode="word"
                progress={scrollYProgress}
                window={[0.08, 0.18]}
                holdUntil={0.84}
                stagger={0.035}
                perspective={960}
                reduceMotion={reduceMotion}
              />
            </motion.span>
            <motion.div
              className={styles.hintCopy}
              data-secret-hint="true"
              style={reduceMotion ? undefined : { opacity: hintOpacity, y: hintY }}
            >
              <FlipRevealText
                text={hintCopy}
                mode="word"
                progress={scrollYProgress}
                window={[0.1, 0.22]}
                holdUntil={0.88}
                stagger={0.022}
                perspective={980}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          </div>
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
