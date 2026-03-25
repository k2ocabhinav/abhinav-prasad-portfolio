"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";
import { personal } from "@/data/personal";
import { useHeroSlideshow } from "@/hooks/useHeroSlideshow";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { X } from "lucide-react";
import { overlaySpring } from "@/lib/animations";
import styles from "./HeroSection.module.css";

// =============================================================================
// HeroSection — Full-screen rotating carousel with glass text panel
// =============================================================================

export default function HeroSection() {
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { currentSlide } = useHeroSlideshow({
    slides: personal.heroSlides,
    interval: personal.heroSlideInterval,
    crossfadeDuration: 1000,
    autoPlay: !prefersReducedMotion,
  });

  const handleSlideClick = useCallback(() => {
    setIsEasterEggOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsEasterEggOpen(true);
      }
    },
    []
  );

  return (
    <>
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
              <img
                src={personal.heroSlides[currentSlide].image}
                alt={personal.heroSlides[currentSlide].alt}
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
              onClick={handleSlideClick}
              onKeyDown={handleKeyDown}
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
            <div
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.indicatorActive : ""
              }`}
            />
          ))}
        </div>
      </section>

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
