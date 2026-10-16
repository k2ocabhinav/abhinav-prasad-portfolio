"use client";

import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionTone, StackGroup } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { renderIcon } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlipRevealText from "@/components/ui/FlipRevealText";
import StackLayersPlate from "@/components/art/StackLayersPlate";
import styles from "./TechStackSection.module.css";

interface TechStackSectionProps {
  techCategories: StackGroup[];
  tone?: SectionTone;
}

// =============================================================================
// TechStackSection — grouped coverage as a ruled index, not a second card grid.
// Each group is a ruled row: icon, label, evidence context, then its items as
// a hairline-separated run. Services keeps the icon-card grid to itself.
// =============================================================================

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
    <SectionWrapper id="stack" tone={tone} className={styles.stackSection}>
      <div ref={sectionRef} className={`grid-12 ${styles.headerGrid}`}>
        <div className="col-4">
          <m.h2
            style={{ y: prefersReducedMotion ? 0 : headingY }}
            className={styles.heading}
          >
            <FlipRevealText
              flat
              overprint
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
          </m.h2>
          <m.p
            className={styles.callout}
            style={{ y: prefersReducedMotion ? 0 : calloutY }}
          >
            Tools I use across work and projects
          </m.p>
        </div>
        <div className="col-8">
          <StackLayersPlate />
        </div>
      </div>

      <m.ul
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate={prefersReducedMotion ? "visible" : undefined}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.08 }}
        className={styles.groupList}
        data-stack-list="true"
      >
        {techCategories.map((item) => (
          <StackRow key={item.id} item={item} />
        ))}
      </m.ul>
    </SectionWrapper>
  );
}

function StackRow({ item }: { item: StackGroup }) {
  return (
    <m.li
      variants={staggerItem}
      className={styles.group}
      data-stack-card={item.id}
      data-stack-context={item.context}
    >
      <div className={styles.groupHead}>
        <span className={styles.groupIcon} aria-hidden="true">
          {renderIcon(item.icon, { size: 18 })}
        </span>
        <h3 className={styles.groupLabel}>{item.label}</h3>
        <span className={styles.context}>{item.context}</span>
      </div>
      <ul className={styles.groupItems} aria-label={`${item.label} technologies`}>
        {item.items.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    </m.li>
  );
}
