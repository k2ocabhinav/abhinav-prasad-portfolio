"use client";

import { motion } from "motion/react";
import { useMagneticHover } from "@/hooks/useMagneticHover";
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
  const { ref, offset } = useMagneticHover();

  return (
    <motion.a
      ref={ref as RefObject<HTMLAnchorElement>}
      href={href}
      download={download}
      animate={{ x: offset.x, y: offset.y }}
      transition={magneticSpring}
      className={`${styles.magneticButton} ${styles[variant]} ${className}`}
    >
      {children}
    </motion.a>
  );
}
