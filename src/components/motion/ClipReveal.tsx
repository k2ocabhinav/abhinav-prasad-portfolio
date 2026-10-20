"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { observeReveal } from "./revealObserver";
import styles from "./motion.module.css";

interface ClipRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Edge the reveal grows from. */
  from?: "bottom" | "left";
}

// Clip-path wipe for images and panels, run once on first view. Same
// visibility contract as RevealText: visible without JS, failsafe after 4 s,
// static under reduced motion.
export default function ClipReveal({
  children,
  className,
  from = "bottom",
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeReveal(element);
  }, []);

  return (
    <div ref={ref} className={cn(styles.clip, className)} data-clip-from={from}>
      {children}
    </div>
  );
}
