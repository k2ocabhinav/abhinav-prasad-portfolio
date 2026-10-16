"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { PersonalData, SectionTone } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
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
          <div className={cn("spec-body grid-12", styles.aboutGrid)}>
            <div className="col-4">
              <h2 className={styles.heading}>Philosophy</h2>
              <div className={styles.cutawayWrap}>
                <SpecSheetCutaway />
              </div>
            </div>
            <div className={`col-8 ${styles.contentCol}`}>
              <p className={styles.philosophyText}>{personal.philosophy}</p>
            </div>
          </div>
        </m.div>
      </div>
    </SectionWrapper>
  );
}
