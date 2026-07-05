// =============================================================================
// Animation Presets — Centralized Framer Motion variants
// All animation timing and easing defined here for consistency
// =============================================================================

import type { Variants, Transition } from "motion/react";

/**
 * Signature easing — the strong ease-out (cubic-bezier(0.22,1,0.36,1)) used
 * across the site's entrances. Replaces the flatter "easeOut" for a more
 * modern, settled arrival. Mirrors --motion-ease-out in globals.css.
 */
const easeSignature: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Entrance Variants ──────────────────────────────────────────────
// Movement (y/x/scale) auto-disables for reduced-motion users via the global
// <MotionConfig reducedMotion="user"> in AppProviders; only opacity/blur remain.

/** Default fade-in from below — signature easing + subtle blur-in */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easeSignature },
  },
};

/** Fade-in from the left — signature easing + subtle blur-in */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easeSignature },
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

/** Stagger item — fade up with slight scale + blur-in */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: easeSignature },
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

// ─── Modern Reveal (blur + travel) ──────────────────────────────────

/**
 * Pronounced reveal — larger travel, stronger blur-in, signature easing.
 * For section headings/bodies and media that should arrive with more presence
 * than the base fade. Movement auto-disables under reduced motion; the blur
 * fade (not vestibular motion) remains.
 */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easeSignature },
  },
};

/** Stagger container tuned for revealUp children (slightly slower cadence). */
export function revealStagger(staggerDelay = 0.1): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.08,
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

/** Magnetic button spring — softened (added mass, lower stiffness) for a
    premium, weighty "pull" rather than a snappy follow. */
export const magneticSpring: Transition = {
  type: "spring",
  damping: 18,
  stiffness: 170,
  mass: 0.3,
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

// ─── PRD Motion Tokens ───────────────────────────────────────────────────────

/** Fast entrance — 220ms easeOut (enterFast from PRD) */
export const enterFast: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

/** Base entrance — 350ms easeOut (enterBase from PRD) */
export const enterBase: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

/**
 * Oversized name reveal.
 * Scale + opacity + y translation for a "settling into place" feel.
 * Designed for large display text where blur would be too expensive.
 */
export const nameReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Micro-jitter loop — low-amplitude idle animation for decorative elements.
 * Apply as: animate={microJitterLoop.animate} transition={microJitterLoop.transition}
 */
export const microJitterLoop = {
  animate: { x: [0, 2, -1, 0], y: [0, -1, 2, 0], rotate: [0, 0.5, -0.5, 0] },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
};
