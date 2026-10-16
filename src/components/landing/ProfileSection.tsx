"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import StillLifePlate from "@/components/art/StillLifePlate";
import StackStrip, { type StackStripItem } from "@/components/art/stack-icons/StackStrip";
import type { StackIconName } from "@/components/art/stack-icons/icons";
import type { PersonalData, ProfileIntroContent } from "@/types";
import styles from "./ProfileSection.module.css";

// =============================================================================
// ProfileSection - compact identity handoff with a technical silhouette portrait.
// =============================================================================

interface ProfileSectionProps {
  personal: PersonalData;
  intro: ProfileIntroContent;
  reduceMotion?: boolean;
}

// The intro stack list is content-driven; each validated label maps to its
// own glyph so a reordered or trimmed list still renders correctly.
const STACK_ICON_BY_LABEL: Record<string, StackIconName> = {
  java: "java",
  spring: "spring",
  postgresql: "postgresql",
  python: "python",
  typescript: "typescript",
  react: "react",
  "next.js": "nextjs",
  aws: "aws",
  docker: "docker",
  agents: "agents",
};

function splitProofLead(line: string): { lead: string; rest: string } {
  const separator = line.indexOf(": ");
  if (separator === -1) {
    return { lead: line, rest: "" };
  }

  return { lead: line.slice(0, separator + 1), rest: line.slice(separator + 2) };
}

export default function ProfileSection({
  personal,
  intro,
  reduceMotion = false,
}: ProfileSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "end 14%"],
  });
  const portraitScale = useTransform(scrollYProgress, [0, 0.34, 0.66, 1], [0.84, 0.92, 1.01, 1.06]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.16, 0.6, 1], [0.52, 0.8, 0.97, 1]);
  const portraitY = useTransform(scrollYProgress, [0, 0.42, 0.76, 1], [28, 8, 0, -8]);
  const portraitX = useTransform(scrollYProgress, [0, 0.62, 1], [4, 0, -4]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [0.72, 1, 0.78]);
  const hintY = useTransform(scrollYProgress, [0, 0.76, 1], [6, 0, -4]);

  const stackItems: StackStripItem[] = intro.stackItems.map((label) => ({
    name: STACK_ICON_BY_LABEL[label.toLowerCase()] ?? "api",
    label,
  }));

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
      aria-label="Profile"
    >
      <div className={styles.profileStageWash} aria-hidden="true" />
      <div className={`content-container ${styles.profileContent}`}>
        <div className={styles.storyGrid}>
          <motion.div
            className={styles.portraitColumn}
            animate={
              reduceMotion
                ? { scale: 1, opacity: 1, y: 0, x: 0 }
                : undefined
            }
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
            <div className={styles.portraitArtwork}>
              <motion.div
                initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
                animate={reduceMotion ? { scale: 1, opacity: 1 } : undefined}
                whileInView={
                  reduceMotion ? undefined : { scale: 1, opacity: 1 }
                }
                viewport={reduceMotion ? undefined : { once: true }}
                transition={reduceMotion ? undefined : { duration: 0.82, delay: 0.08 }}
                className={styles.imageFrame}
              >
                <Image
                  src={personal.heroPhoto}
                  alt={`${personal.fullName} editorial monogram`}
                  width={640}
                  height={640}
                  className={styles.heroImage}
                  priority={false}
                />
              </motion.div>
              <div className={styles.stillLife}>
                <StillLifePlate />
              </div>
            </div>
            <motion.div
              className={styles.hintCopy}
              data-secret-hint="true"
              style={reduceMotion ? undefined : { opacity: hintOpacity, y: hintY }}
            >
              <span className={styles.hintKicker}>Personal layer</span>
              <span className={styles.hintText}>v opens it</span>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.copyColumn}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? { opacity: 1, y: 0 } : undefined}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={reduceMotion ? undefined : { once: true }}
            transition={reduceMotion ? undefined : { delay: 0.24 }}
          >
            <h2 className={styles.headline}>{intro.headline}</h2>

            <ul className={styles.proofList}>
              {intro.proofLines.map((line) => {
                const { lead, rest } = splitProofLead(line);
                return (
                  <li key={line} className={styles.proofItem}>
                    <span className={styles.proofMark} aria-hidden="true" />
                    <span className={styles.proofText}>
                      <strong className={styles.proofLead}>{lead}</strong>
                      {rest ? ` ${rest}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>

            <StackStrip items={stackItems} className={styles.stackStrip} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
