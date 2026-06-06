"use client";

import { motion } from "motion/react";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { magneticSpring } from "@/lib/animations";
import type { ReactNode, RefObject } from "react";
import styles from "./MagneticButton.module.css";

// =============================================================================
// MagneticButton — CTA link with magnetic pull toward cursor on hover
// =============================================================================

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  download?: boolean;
  className?: string;
  variant?: "outline" | "ghost" | "glow";
}

export default function MagneticButton({
  children,
  href,
  download,
  className = "",
  variant = "outline",
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, offset } = useMagneticHover(0.04);

  return (
    <motion.a
      ref={prefersReducedMotion ? undefined : (ref as RefObject<HTMLAnchorElement>)}
      href={href}
      download={download}
      animate={prefersReducedMotion ? {} : { x: offset.x, y: offset.y }}
      transition={magneticSpring}
      className={`${styles.magneticButton} ${styles[variant]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
