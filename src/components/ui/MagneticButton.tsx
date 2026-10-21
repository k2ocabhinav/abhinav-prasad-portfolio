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
  ariaLabel?: string;
  /** Set for external destinations so the link opens in a new tab. */
  target?: "_blank";
  rel?: string;
}

export default function MagneticButton({
  children,
  href,
  download,
  className = "",
  variant = "outline",
  ariaLabel,
  target,
  rel,
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, x, y } = useMagneticHover(0.04);

  return (
    <m.a
      ref={prefersReducedMotion ? undefined : (ref as RefObject<HTMLAnchorElement>)}
      href={href}
      download={download}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      style={prefersReducedMotion ? undefined : { x, y }}
      className={`${styles.magneticButton} ${styles[variant]} ${className}`}
    >
      {children}
    </m.a>
  );
}
