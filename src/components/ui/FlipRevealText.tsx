"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./FlipRevealText.module.css";

interface FlipRevealTextProps {
  text: string;
  mode?: "word" | "char";
  triggerRange?: [number, number];
  stagger?: number;
  perspective?: number;
  reduceMotion?: boolean;
  className?: string;
  tokenClassName?: string;
}

function buildTokens(text: string, mode: "word" | "char") {
  if (mode === "char") {
    return Array.from(text).map((char, index) => ({
      key: `char-${index}-${char}`,
      value: char === " " ? "\u00A0" : char,
      isSpace: char === " ",
    }));
  }

  const words = text.trim().split(/\s+/);
  const output: Array<{ key: string; value: string; isSpace: boolean }> = [];

  words.forEach((word, index) => {
    output.push({ key: `word-${index}-${word}`, value: word, isSpace: false });
    if (index < words.length - 1) {
      output.push({ key: `space-${index}`, value: "\u00A0", isSpace: true });
    }
  });

  return output;
}

export default function FlipRevealText({
  text,
  mode = "word",
  triggerRange = [0.2, 0.44],
  stagger = 0.04,
  perspective = 920,
  reduceMotion,
  className,
  tokenClassName,
}: FlipRevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const disableFlip = reduceMotion ?? prefersReducedMotion;
  const tokens = buildTokens(text, mode);
  const revealWindow = Math.max(0.15, triggerRange[1] - triggerRange[0]);
  const viewportAmount = Math.min(0.95, Math.max(0.3, triggerRange[1]));

  return (
    <span
      className={cn(styles.root, className)}
      style={{ ["--flip-perspective" as string]: `${perspective}px` }}
      aria-label={text}
    >
      {tokens.map((token, index) => {
        const isAnimatedToken = !token.isSpace;
        const delay = isAnimatedToken ? index * stagger : 0;

        return (
          <span key={token.key} className={styles.clip}>
            <motion.span
              className={cn(styles.token, tokenClassName)}
              initial={
                disableFlip
                  ? { opacity: 0, y: 12 }
                  : { opacity: 0, rotateX: -94, y: 14 }
              }
              whileInView={
                disableFlip
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, rotateX: 0, y: 0 }
              }
              viewport={{ once: true, amount: viewportAmount }}
              transition={{
                duration: disableFlip ? 0.34 : Math.min(0.54, revealWindow + 0.14),
                delay,
                ease: "easeOut",
              }}
              style={disableFlip ? undefined : { transformOrigin: "50% 100%" }}
            >
              {token.value}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
