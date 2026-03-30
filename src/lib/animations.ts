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

// ─── Landing Page Variants ───────────────────────────────────────────────────
// Used exclusively by components in src/components/landing/

/**
 * Title mask reveal via clipPath.
 * Apply to each title line individually so they reveal sequentially via stagger.
 * The parent container must have overflow: hidden for the clip to work.
 */
export const titleMaskReveal: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Landing-specific fade-in from below.
 * Shorter and snappier than the global fadeInUp (30px vs 24px, 480ms vs 600ms).
 */
export const landingFadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Hero visual (CSS 3D composition) entrance.
 * Slight scale + rotation creates a "settling into place" feel.
 */
export const landingVisualIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, rotateY: -3 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Work stack card morphing variants.
 * Used with animate prop (not whileInView) since the active state
 * is driven by scroll progress, not viewport intersection.
 */
export const workCardActive: Variants = {
  inactive: {
    scale: 0.92,
    opacity: 0.4,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] },
  },
  active: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.48, ease: [0.65, 0, 0.35, 1] },
  },
};

/**
 * Landing stagger container.
 * Uses 80ms base (--motion-stagger-base) vs the global 120ms default.
 * delayChildren adds a slight pause before the first child animates.
 */
export function landingStagger(staggerDelay = 0.08): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };
}

/** Spring for the CSS 3D visual idle oscillation */
export const visual3DSpring: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 120,
  mass: 1,
};

/** Spring for work stack project card transitions */
export const workStackSpring: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 200,
};
