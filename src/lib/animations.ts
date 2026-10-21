import type { Transition, Variants } from "motion/react";

const easeSignature: [number, number, number, number] = [0.22, 1, 0.36, 1];

// The 28px rise is a `transform` string rather than the independent `y`
// value: motion hands opacity and transform strings to the browser's
// compositor-driven animations, while `y` is interpolated in JS with an inline
// style write (style recalc, paint-property update and commit) on every frame
// of the 0.6 s reveal. Same keyframes, duration and easing.
export const staggerItem: Variants = {
  hidden: { opacity: 0, transform: "translateY(28px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.6, ease: easeSignature },
  },
};

export const magneticSpring: Transition = {
  type: "spring",
  damping: 18,
  stiffness: 170,
  mass: 0.3,
};

export const tiltSpring: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 200,
};

export const panelSpring: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 180,
};

export const progressSpring = {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

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
