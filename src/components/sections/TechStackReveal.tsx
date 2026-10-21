"use client";

import type { ReactNode } from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { landingStagger, staggerItem } from "@/lib/animations";

// Client shells for the Stack grid's entrance. The cards and their icons are
// server-rendered children, so only this small wrapper ships as client code.
// Reduced motion renders the same list without the stagger.

interface RevealProps {
  className?: string;
  children: ReactNode;
}

export function StackReveal({ className, children }: RevealProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <ul className={className}>{children}</ul>;
  }
  return (
    <m.ul
      className={className}
      variants={landingStagger(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </m.ul>
  );
}

interface RevealItemProps extends RevealProps {
  featured: boolean;
}

export function StackRevealItem({ className, featured, children }: RevealItemProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <li className={className} data-featured={featured}>
        {children}
      </li>
    );
  }
  return (
    <m.li
      className={className}
      data-featured={featured}
      variants={staggerItem}
    >
      {children}
    </m.li>
  );
}
