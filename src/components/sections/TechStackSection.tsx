"use client";

import { motion } from "motion/react";
import { techCategories } from "@/data/techStack";
import { useCardTilt } from "@/hooks/useCardTilt";
import { staggerContainer, staggerItem, tiltSpring } from "@/lib/animations";
import { resolveIcon } from "@/lib/utils";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./TechStackSection.module.css";

// =============================================================================
// TechStackSection — Tech categories with glassmorphism cards and 3D tilt
// =============================================================================

export default function TechStackSection() {
  return (
    <SectionWrapper id="stack">
      <div className={`grid-12 ${styles.headerGrid}`}>
        <div className="col-4">
          <h2 className={styles.heading}>Technical Voice</h2>
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
  const IconComponent = resolveIcon(item.icon);

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
        backgroundColor: "rgba(107, 127, 120, 0.05)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className={styles.cardIcon}>
        <IconComponent size={20} />
      </div>
      <h4 className={styles.cardLabel}>{item.label}</h4>
      <p className={styles.cardContent}>{item.content}</p>
    </motion.div>
  );
}
