"use client";

import * as m from "motion/react-m";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
  const { ref, x, y } = useMagneticHover(0.04);

  return (
    <m.a
      ref={prefersReducedMotion ? undefined : (ref as RefObject<HTMLAnchorElement>)}
      href={href}
      download={download}
      style={prefersReducedMotion ? undefined : { x, y }}
      className={`${styles.magneticButton} ${styles[variant]} ${className}`}
    >
      {children}
    </m.a>
  );
}
