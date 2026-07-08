"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { PersonalData, SectionBlendStyle, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./AboutSection.module.css";

// =============================================================================
// AboutSection — Philosophy statement in asymmetric grid
// =============================================================================

interface AboutSectionProps {
  personal: PersonalData;
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function AboutSection({
  personal,
  tone,
}: AboutSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [12, -10]);

  // Sheet rise — the espresso panel settles onto the desk as it enters.
  // Anchored to an untransformed wrapper so the scrub never feeds back.
  const riseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: riseProgress } = useScroll({
    target: prefersReducedMotion ? undefined : riseRef,
    offset: ["start end", "start 0.55"],
  });
  const sheetY = useTransform(riseProgress, [0, 1], [48, 0]);
  const sheetScale = useTransform(riseProgress, [0, 1], [0.97, 1]);
  const sheetRadius = useTransform(riseProgress, [0, 1], [12, 4]);

  return (
    <SectionWrapper id="about" tone={tone}>
      <div ref={riseRef}>
      <motion.div
        className="spec-sheet"
        style={
          prefersReducedMotion
            ? undefined
            : { y: sheetY, scale: sheetScale, borderRadius: sheetRadius }
        }
      >
        <div className="spec-header">
          <span>SPEC-01 // PHILOSOPHY</span>
          <span>VER: 2026.1</span>
        </div>
        <div ref={sectionRef} className={cn("spec-body grid-12", styles.aboutGrid)}>
          <div className="col-4">
            <motion.h2
              style={{ y: prefersReducedMotion ? 0 : headingY }}
              className={styles.heading}
            >
              <FlipRevealText flat
                text="Philosophy"
                mode="char"
                progress={scrollYProgress}
                window={[0.2, 0.34]}
                holdUntil={0.86}
                stagger={0.028}
                perspective={980}
                className={styles.headingFlip}
                tokenClassName={styles.headingFlipToken}
              />
            </motion.h2>
            <motion.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
              <FlipRevealText flat
                text="Operating principle."
                mode="word"
                progress={scrollYProgress}
                window={[0.26, 0.38]}
                holdUntil={0.84}
                stagger={0.03}
                perspective={860}
                className={styles.calloutFlip}
                tokenClassName={styles.calloutFlipToken}
              />
            </motion.p>
          </div>
          <div className={`col-8 ${styles.contentCol}`}>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            >
              <p className={styles.philosophyText}>{personal.philosophy}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      </div>
    </SectionWrapper>
  );
}
