"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { overlaySpring } from "@/lib/animations";
import LandingFrame1Hero from "./LandingFrame1Hero";
import LandingFrame2WorkStack from "./LandingFrame2WorkStack";
import LandingFrame3Services from "./LandingFrame3Services";
import LandingBlendSection from "./LandingBlendSection";
import ProfileSection from "./ProfileSection";
import styles from "./LandingExperience.module.css";

// =============================================================================
// LandingExperience — Active homepage hero flow.
// Coordinates reduced-motion branching and preserves the easter egg overlay.
// =============================================================================

export default function LandingExperience() {
  const prefersReducedMotion = useReducedMotion();
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);

  const handleNameClick = useCallback(() => {
    setIsEasterEggOpen(true);
  }, []);

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
      <div className={styles.landing}>
        {prefersReducedMotion ? (
          <>
            {/* Reduced motion shows the same information without scroll-driven choreography. */}
            <section id="hero" className={styles.heroFrame} aria-label="Hero">
              <LandingFrame1Hero
                onNameClick={handleNameClick}
                showScrollIndicator={false}
                reduceMotion
              />
            </section>
            <LandingFrame2WorkStack staticMode />
            <LandingFrame3Services reduceMotion />
            <ProfileSection reduceMotion />
          </>
        ) : (
          <>
            {/* Interactive path preserves the full frame-by-frame landing sequence. */}
            <section id="hero" className={styles.heroFrame} aria-label="Hero">
              <LandingFrame1Hero onNameClick={handleNameClick} />
            </section>
            <LandingFrame2WorkStack />
            <LandingFrame3Services />
            <LandingBlendSection />
            <ProfileSection />
          </>
        )}
      </div>

      <AnimatePresence>
        {isEasterEggOpen ? (
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
        ) : null}
      </AnimatePresence>
    </>
  );
}
