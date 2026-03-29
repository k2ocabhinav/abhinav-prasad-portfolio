"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { personal } from "@/data/personal";
import { useHeroSlideshow } from "@/hooks/useHeroSlideshow";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { X } from "lucide-react";
import { overlaySpring } from "@/lib/animations";
import styles from "./HeroSection.module.css";

// =============================================================================
// HeroSection — Two-part landing:
//   Part 1 · Full-screen rotating carousel with glass text panel
//            (NOTE: This carousel is a placeholder. A UI designer will replace
//             it with a fully custom, high-fidelity design in a future iteration.)
//   Part 2 · Profile reveal — personal photo, annotations, tagline + subtitle
// =============================================================================

export default function HeroSection() {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const profileRef = useRef<HTMLDivElement>(null);

  const { currentSlide, goToSlide } = useHeroSlideshow({
    slides: personal.heroSlides,
    interval: personal.heroSlideInterval,
    crossfadeDuration: 1000,
    autoPlay: !prefersReducedMotion,
  });

  const handleNameClick = useCallback(() => {
    setIsEasterEggOpen(true);
  }, []);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsEasterEggOpen(true);
      }
    },
    []
  );

  useEffect(() => {
    if (!isEasterEggOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEasterEggOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEasterEggOpen]);

  return (
    <>
      {/* ── Part 1: Carousel ─────────────────────────────────────────── */}
      <section id="hero" className={styles.hero}>
        {/* Full-screen image carousel */}
        <div className={styles.carousel}>
          <AnimatePresence mode="sync">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={styles.slide}
          >
              <Image
                src={personal.heroSlides[currentSlide].image}
                alt={personal.heroSlides[currentSlide].alt}
                fill
                priority={currentSlide === 0}
                sizes="100vw"
                className={styles.slideImage}
              />
            </motion.div>
          </AnimatePresence>

          {/* Sage overlay */}
          <div
            className={styles.overlay}
            style={{
              backgroundColor: `rgba(107, 127, 120, ${personal.heroOverlayOpacity})`,
            }}
          />
        </div>

        {/* Glass text panel */}
        <div className={styles.panel}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={styles.panelContent}
          >
            {/* Role Label */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={styles.roleLabel}
            >
              {personal.title}
            </motion.span>

            {/* Name — Easter Egg trigger */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              onClick={handleNameClick}
              onKeyDown={handleNameKeyDown}
              tabIndex={0}
              role="button"
              aria-label={`${personal.name} — click for a surprise`}
              className={styles.heroName}
            >
              {personal.name}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className={styles.tagline}
            >
              {personal.tagline}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
              className={styles.subtitle}
            >
              {personal.subtitle}
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className={styles.socials}
            >
              {personal.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={styles.socialLink}
                  aria-label={social.label}
                >
                  {social.label}
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className={styles.indicators}>
          {personal.heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show hero slide ${index + 1}`}
              aria-pressed={index === currentSlide}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.indicatorActive : ""
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* ── Part 2: Profile Section ───────────────────────────────────── */}
      <section className={styles.profileSection}>
        <div ref={profileRef} className={`content-container ${styles.profileContent}`}>
          {/* Role Label */}
          <span className={styles.profileRoleLabel}>{personal.title}</span>

          {/* Image with annotations — shown from sm breakpoint upward */}
          <div className={styles.imageWrapper}>
            <motion.div
              className={styles.imageContainer}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <Image
                  src={personal.heroPhoto}
                  alt={`${personal.name} — Systems Architect`}
                  width={288}
                  height={288}
                  className={styles.heroImage}
                  priority={false}
                />
              </motion.div>

              {/* Annotations (sm+ only — hidden on mobile per design spec) */}
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
                  className={`${styles.annotation} ${
                    styles[`annotation_${anno.position.replace("-", "_")}`]
                  }`}
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

          <div className={styles.mobileAnnotationList} aria-label="Core strengths">
            {personal.heroAnnotations.map((annotation) => (
              <span key={annotation.label} className={styles.mobileAnnotation}>
                {annotation.label}
              </span>
            ))}
          </div>

          {/* Tagline & Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className={styles.taglineBlock}
          >
            <p className={styles.profileTagline}>{personal.tagline}</p>
            <p className={styles.profileSubtitle}>{personal.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Easter Egg Overlay ─────────────────────────────────────────── */}
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
