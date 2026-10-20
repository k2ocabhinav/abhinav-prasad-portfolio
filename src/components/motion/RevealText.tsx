"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { observeReveal } from "./revealObserver";
import styles from "./motion.module.css";

type RevealTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface RevealTextProps {
  text: string;
  as?: RevealTag;
  className?: string;
  /** Extra delay before the first word, in ms. */
  delay?: number;
  id?: string;
}

// Word-by-word line-mask reveal. The words are server-rendered and fully
// readable without JavaScript; the hidden start state only applies once the
// inline `data-js` flag is set, and a CSS failsafe reveals them anyway if
// hydration never happens. Reduced motion shows the text immediately.
export default function RevealText({
  text,
  as = "span",
  className,
  delay = 0,
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeReveal(element);
  }, []);

  const words = text.split(/\s+/).filter(Boolean);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn(styles.reveal, className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      data-reveal="words"
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className={styles.mask}>
          <span
            className={styles.word}
            style={{ "--i": index } as React.CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
