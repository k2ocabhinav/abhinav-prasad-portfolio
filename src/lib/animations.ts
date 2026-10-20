import type { Transition, Variants } from "motion/react";

const easeSignature: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
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
