"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionBlendStyle, SectionTone, StackGroup } from "@/types";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./TechStackSection.module.css";

// =============================================================================
// TechStackSection — Tech categories with glassmorphism cards and 3D tilt
// =============================================================================

interface TechStackSectionProps {
  techCategories: StackGroup[];
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function TechStackSection({
  techCategories,
  tone,
}: TechStackSectionProps) {
  if (techCategories.length === 0) {
    return null;
  }

  return <TechStackSectionContent techCategories={techCategories} tone={tone} />;
}

function TechStackSectionContent({
  techCategories,
  tone,
}: TechStackSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: prefersReducedMotion ? undefined : sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [12, -10]);

  return (
    <SectionWrapper
      id="stack"
      tone={tone}
    >
      <div ref={sectionRef} className={`grid-12 ${styles.headerGrid}`}>
        <div className="col-4">
          <motion.h2
            style={{ y: prefersReducedMotion ? 0 : headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              text="Stack"
              mode="word"
              progress={scrollYProgress}
              window={[0.14, 0.28]}
              holdUntil={0.84}
              stagger={0.03}
              perspective={900}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
          <motion.p className={styles.callout} style={{ y: prefersReducedMotion ? 0 : calloutY }}>
            <FlipRevealText
              text="Tools behind the build."
              mode="word"
              progress={scrollYProgress}
              window={[0.24, 0.38]}
              holdUntil={0.8}
              stagger={0.03}
              perspective={860}
              className={styles.calloutFlip}
              tokenClassName={styles.calloutFlipToken}
            />
          </motion.p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={styles.cardsGrid}
      >
        {techCategories.map((item) => (
          <TechCard key={item.id} item={item} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

// ─── TechCard Sub-component ─────────────────────────────────────────

function TechCard({ item }: { item: StackGroup }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: tiltRef, tilt } = useCardTilt(1.5);

  return (
    <motion.div
      ref={prefersReducedMotion ? undefined : tiltRef}
      variants={staggerItem}
      animate={prefersReducedMotion ? {} : { rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={tiltSpring}
      style={{ transformPerspective: 600 }}
      className={styles.card}
      whileHover={prefersReducedMotion ? undefined : {
        y: -3,
        scale: 1.01,
      }}
    >
      <div className={styles.cardIcon}>
        {renderIcon(item.icon, { size: 20 })}
      </div>
      <h3 className={styles.cardLabel}>{item.label}</h3>
      <p className={styles.cardContent}>{item.content}</p>
    </motion.div>
  );
}
