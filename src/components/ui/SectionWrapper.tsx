import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./SectionWrapper.module.css";

// =============================================================================
// SectionWrapper — Consistent section padding, snap alignment, and id for scroll spy
// =============================================================================

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  /** Use full viewport height with centered content */
  fullHeight?: boolean;
  /** Center content both axes */
  centered?: boolean;
  className?: string;
}

export default function SectionWrapper({
  id,
  children,
  fullHeight = false,
  centered = false,
  className = "",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        styles.section,
        fullHeight && styles.fullHeight,
        centered && styles.centered,
        className
      )}
    >
      {children}
    </section>
  );
}
