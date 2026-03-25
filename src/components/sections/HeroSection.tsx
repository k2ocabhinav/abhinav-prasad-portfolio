"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useState, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { personal } from "@/data/personal";
import { scaleIn, overlaySpring } from "@/lib/animations";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./HeroSection.module.css";

// =============================================================================
// HeroSection — Full-height hero with parallax, easter egg, and annotations
// =============================================================================

export default function HeroSection() {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroImgY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <>
      <SectionWrapper id="hero" fullHeight>
        <div ref={sectionRef} className={styles.heroContent}>
          <motion.div
            style={{ y: heroTextY, opacity: heroOpacity }}
            className={styles.heroText}
          >
            {/* Role Label */}
            <span className={styles.roleLabel}>{personal.title}</span>

            {/* Name — Easter Egg trigger */}
            <h1
              onClick={() => setIsEasterEggOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsEasterEggOpen(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${personal.name} — click for a surprise`}
              className={styles.heroName}
            >
              {personal.name}
            </h1>

            {/* Image with annotations */}
            <div className={styles.imageWrapper}>
              <motion.div
                style={{ y: heroImgY }}
                className={styles.imageContainer}
              >
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.9 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  alt={`${personal.name} — Systems Architect`}
                  className={styles.heroImage}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face"
                />

                {/* Annotations */}
                {personal.heroAnnotations.map((anno, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: anno.position === "left" ? 20 : -20,
                    }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`${styles.annotation} ${styles[`annotation_${anno.position.replace("-", "_")}`]}`}
                  >
                    {anno.position !== "left" && (
                      <div className={styles.annotationLine} />
                    )}
                    <span className={styles.annotationLabel}>{anno.label}</span>
                    {anno.position === "left" && (
                      <div className={styles.annotationLine} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Tagline & Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={styles.taglineBlock}
          >
            <p className={styles.tagline}>{personal.tagline}</p>
            <p className={styles.subtitle}>{personal.subtitle}</p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {isEasterEggOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={overlaySpring}
            className={styles.easterEgg}
            role="dialog"
            aria-modal="true"
            aria-label="Easter egg overlay"
          >
            <button
              onClick={() => setIsEasterEggOpen(false)}
              aria-label="Close overlay"
              className={styles.easterEggClose}
              autoFocus
            >
              <X size={48} strokeWidth={1} />
            </button>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={styles.easterEggTitle}
            >
              Beyond the Terminal
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.6 }}
              className={styles.easterEggText}
            >
              The beauty of systems lies in their silence. Orchestrating the
              unseen.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
