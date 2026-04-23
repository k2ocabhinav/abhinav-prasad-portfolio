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
    offset: ["start 90%", "end 14%"],
  });
  const portraitScale = useTransform(scrollYProgress, [0, 0.34, 0.66, 1], [0.84, 0.92, 1.01, 1.06]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.16, 0.6, 1], [0.52, 0.8, 0.97, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.42, 0.76, 1], [48, 20, 0, -10]);
  const portraitX = useTransform(scrollYProgress, [0, 0.62, 1], [10, 0, -6]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0.58]);
  const hintY = useTransform(scrollYProgress, [0, 0.76, 1], [2, 0, -8]);
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
            <motion.div
              className={styles.hintCopy}
              data-secret-hint="true"
              style={reduceMotion ? undefined : { opacity: hintOpacity, y: hintY }}
            >
              <FlipRevealText
                text={hintCopy}
                mode="word"
                progress={scrollYProgress}
                window={[0.06, 0.2]}
                holdUntil={0.9}
                stagger={0.028}
                perspective={860}
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
