"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { PersonalData, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import SpecSheetCutaway from "@/components/art/SpecSheetCutaway";
import styles from "./AboutSection.module.css";

// =============================================================================
// AboutSection — Philosophy statement in asymmetric grid
// =============================================================================

interface AboutSectionProps {
  personal: PersonalData;
  tone?: SectionTone;
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

  return (
    <SectionWrapper id="about" tone={tone}>
      <div ref={riseRef}>
      <m.div
        className={`spec-sheet ${styles.aboutPanel}`}
        style={{
          y: prefersReducedMotion ? 0 : sheetY,
          scale: prefersReducedMotion ? 1 : sheetScale,
        }}
      >
        <div className="spec-header">
          <span>SPEC-01 // PHILOSOPHY</span>
          <span>VER: 2026.1</span>
        </div>
        <div ref={sectionRef} className={cn("spec-body grid-12", styles.aboutGrid)}>
          <div className="col-4">
            <m.h2
              style={{ y: prefersReducedMotion ? 0 : headingY }}
              className={styles.heading}
            >
              <FlipRevealText flat
                overprint
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
            </m.h2>
            <m.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
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
            </m.p>
            <div className={styles.cutawayWrap}>
              <SpecSheetCutaway />
            </div>
          </div>
          <div className={`col-8 ${styles.contentCol}`}>
            <m.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, delay: 0.15, ease: "easeOut" }
              }
            >
              <p className={styles.philosophyText}>{personal.philosophy}</p>
            </m.div>
          </div>
        </div>
      </m.div>
      </div>
    </SectionWrapper>
  );
}
