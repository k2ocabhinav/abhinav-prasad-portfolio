"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionBlendStyle, SectionTone } from "@/types";
import { techCategories } from "@/data/techStack";
import { useCardTilt } from "@/hooks/useCardTilt";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./TechStackSection.module.css";

// =============================================================================
// TechStackSection — Tech categories with glassmorphism cards and 3D tilt
// =============================================================================

interface TechStackSectionProps {
  tone?: SectionTone;
  blendTopFrom?: SectionTone;
  blendBottomTo?: SectionTone;
  blendStyle?: SectionBlendStyle;
}

export default function TechStackSection({
  tone,
  blendTopFrom,
  blendBottomTo,
  blendStyle,
}: TechStackSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [12, -10]);

  return (
    <SectionWrapper
      id="stack"
      tone={tone}
      blendTopFrom={blendTopFrom}
      blendBottomTo={blendBottomTo}
      blendStyle={blendStyle}
    >
      <div ref={sectionRef} className={`grid-12 ${styles.headerGrid}`}>
        <div className="col-4">
          <motion.h2
            style={{ y: headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              text="Technical Voice"
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
          <motion.p className={styles.callout} style={{ y: calloutY }}>
            <FlipRevealText
              text="Cloud-native by default."
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
        {techCategories.map((item, i) => (
          <TechCard key={i} item={item} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

// ─── TechCard Sub-component ─────────────────────────────────────────

function TechCard({
  item,
}: {
  item: (typeof techCategories)[number];
}) {
  const { ref: tiltRef, tilt } = useCardTilt();

  return (
    <motion.div
      ref={tiltRef}
      variants={staggerItem}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={tiltSpring}
      style={{ transformPerspective: 600 }}
      className={styles.card}
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
    >
      <div className={styles.cardIcon}>
        {renderIcon(item.icon, { size: 20 })}
      </div>
      <h4 className={styles.cardLabel}>{item.label}</h4>
      <p className={styles.cardContent}>{item.content}</p>
    </motion.div>
  );
}
