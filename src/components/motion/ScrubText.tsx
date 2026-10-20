"use client";

import { useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./motion.module.css";

interface ScrubTextProps {
  /** Paragraphs read as one statement; each becomes its own block. */
  paragraphs: string[];
  as?: "div" | "p";
  className?: string;
  paragraphClassName?: string;
}

// Scroll-scrubbed reading: words fill from a faint print to full ink as the
// statement crosses the viewport. One scroll subscription writes a single
// `--p` custom property; every word derives its own opacity from it in CSS,
// so there are no per-word listeners. Without JS, or with reduced motion,
// `--p` stays at 1 and the text is fully inked.
export default function ScrubText({
  paragraphs,
  as = "div",
  className,
  paragraphClassName,
}: ScrubTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    ref.current?.style.setProperty("--p", value.toFixed(4));
  });

  const total = paragraphs.reduce(
    (count, paragraph) => count + paragraph.split(/\s+/).filter(Boolean).length,
    0
  );
  let running = 0;
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(styles.scrub, className)}
      style={{ "--n": total } as React.CSSProperties}
      data-scrub="true"
    >
      {paragraphs.map((paragraph, paragraphIndex) => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        return (
          <p key={paragraphIndex} className={paragraphClassName}>
            {words.map((word, index) => {
              const wordIndex = running++;
              return (
                <span
                  key={`${word}-${index}`}
                  className={styles.scrubWord}
                  style={{ "--i": wordIndex } as React.CSSProperties}
                >
                  {word}
                  {index < words.length - 1 ? " " : null}
                </span>
              );
            })}
          </p>
        );
      })}
    </Tag>
  );
}
