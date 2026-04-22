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
  const portraitScale = useTransform(scrollYProgress, [0, 0.3, 0.62, 1], [0.82, 0.9, 1.04, 1.1]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.22, 0.55, 1], [0.38, 0.72, 0.95, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.36, 0.74, 1], [42, 16, -2, -14]);
  const portraitX = useTransform(scrollYProgress, [0, 0.6, 1], [20, 0, -10]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.18, 0.42, 0.7, 1], [0, 1, 1, 0.24, 0]);
  const hintY = useTransform(scrollYProgress, [0, 0.36, 0.7, 1], [28, 0, -24, -36]);
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
                triggerRange={[0.24, 0.44]}
                stagger={0.035}
                perspective={960}
                reduceMotion={reduceMotion}
              />
            </motion.span>
            <motion.div
              className={styles.hintCopy}
              style={reduceMotion ? undefined : { opacity: hintOpacity, y: hintY }}
            >
              <FlipRevealText
                text={hintCopy}
                mode="word"
                triggerRange={[0.26, 0.5]}
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
