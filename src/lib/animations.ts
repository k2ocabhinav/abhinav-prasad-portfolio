import type { Transition } from "motion/react";

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
