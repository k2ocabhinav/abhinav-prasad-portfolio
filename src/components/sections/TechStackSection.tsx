"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionTone, StackGroup } from "@/types";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RisoMark from "@/components/ui/RisoMark";
import FlipRevealText from "@/components/ui/FlipRevealText";
import styles from "./TechStackSection.module.css";

interface TechStackSectionProps {
  techCategories: StackGroup[];
  tone?: SectionTone;
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
  const headingY = useTransform(scrollYProgress, [0, 1], [16, -12]);
  const calloutY = useTransform(scrollYProgress, [0, 1], [10, -8]);

  return (
    <SectionWrapper id="stack" tone={tone}>
      <div ref={sectionRef} className={`grid-12 ${styles.headerGrid}`}>
        <RisoMark variant="bars" />
        <div className="col-4">
          <motion.h2
            style={{ y: prefersReducedMotion ? 0 : headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              flat
              persist
              text="Stack"
              mode="word"
              progress={scrollYProgress}
              window={[0.14, 0.28]}
              stagger={0.03}
              perspective={900}
              className={styles.headingFlip}
              tokenClassName={styles.headingFlipToken}
            />
          </motion.h2>
          <motion.p
            className={styles.callout}
            style={{ y: prefersReducedMotion ? 0 : calloutY }}
          >
            Tools I use across work and projects
          </motion.p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate={prefersReducedMotion ? "visible" : undefined}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.08 }}
        className={styles.cardsGrid}
        data-stack-grid="true"
      >
        {techCategories.map((item) => (
          <TechCard key={item.id} item={item} />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

function TechCard({ item }: { item: StackGroup }) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: tiltRef, tilt } = useCardTilt(1.5);

  return (
    <motion.article
      ref={prefersReducedMotion ? undefined : tiltRef}
      variants={staggerItem}
      animate={prefersReducedMotion ? undefined : { rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={tiltSpring}
      style={{ transformPerspective: 700 }}
      className={styles.card}
      data-stack-card={item.id}
      data-stack-context={item.context}
    >
      <div className={styles.cardTopline}>
        <div className={styles.cardIcon} aria-hidden="true">
          {renderIcon(item.icon, { size: 20 })}
        </div>
        <span className={styles.context}>{item.context}</span>
      </div>
      <h3 className={styles.cardLabel}>{item.label}</h3>
      <ul className={styles.cardItems} aria-label={`${item.label} technologies`}>
        {item.items.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    </motion.article>
  );
}
