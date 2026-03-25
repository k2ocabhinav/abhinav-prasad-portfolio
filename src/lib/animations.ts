// =============================================================================
// Animation Presets — Centralized Framer Motion variants
// All animation timing and easing defined here for consistency
// =============================================================================

import type { Variants, Transition } from "motion/react";

// ─── Entrance Variants ──────────────────────────────────────────────

/** Default fade-in from below */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Fade-in from the left */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Scale-in (for hero image, large elements) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

/** Stagger item — fade up with slight scale */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// ─── Container Variants (Stagger Orchestration) ─────────────────────

/** Creates a stagger container with configurable delay */
export function staggerContainer(staggerDelay = 0.12): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
}

// ─── Spring Presets ─────────────────────────────────────────────────

/** Smooth cursor-following spring (sage orb) */
export const orbSpring: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 200,
  mass: 0.5,
};

/** Magnetic button spring */
export const magneticSpring: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 300,
};

/** Card tilt spring */
export const tiltSpring: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 200,
};

/** Panel slide spring (mobile menu, easter egg) */
export const panelSpring: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 180,
};

/** Easter egg overlay spring */
export const overlaySpring: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 100,
};

/** Scroll progress bar spring */
export const progressSpring = {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

// ─── Divider Animation ──────────────────────────────────────────────

export const dividerVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1, ease: "easeInOut" },
  },
};

// ─── Parallax Ranges ────────────────────────────────────────────────

/** Hero text parallax: moves down as user scrolls */
export const heroTextParallax = {
  inputRange: [0, 500],
  outputRangeY: [0, 100],
};

/** Hero image parallax: moves up as user scrolls */
export const heroImageParallax = {
  inputRange: [0, 500],
  outputRangeY: [0, -50],
};

/** Hero opacity fade on scroll */
export const heroOpacityFade = {
  inputRange: [0, 300],
  outputRange: [1, 0],
};
