"use client";

import { motion, useMotionValue, useMotionValueEvent } from "motion/react";
import type { MotionValue } from "motion/react";
import { useMemo, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import styles from "./FlipRevealText.module.css";

interface FlipRevealTextProps {
  text: string;
  mode?: "word" | "char";
  triggerRange?: [number, number];
  progress?: MotionValue<number>;
  window?: [number, number];
  holdUntil?: number;
  stagger?: number;
  perspective?: number;
  reduceMotion?: boolean;
  /** Matte mode: masked rise (overflow-clip + translate), no 3D rotation. */
  flat?: boolean;
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
  progress,
  window,
  holdUntil,
  stagger = 0.04,
  perspective = 920,
  reduceMotion,
  flat = false,
  className,
  tokenClassName,
}: FlipRevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const disableFlip = flat || (reduceMotion ?? prefersReducedMotion);
  const idleProgress = useMotionValue(0);
  const progressSource = progress ?? idleProgress;
  const [progressValue, setProgressValue] = useState(() => progress?.get() ?? 0);
  const useScrollLinked = Boolean(progress);
  const startY = flat ? 20 : disableFlip ? 10 : 16;
  const startRotate = disableFlip ? 0 : -112;
  const windowRange = window ?? triggerRange;
  const holdWindowEnd = holdUntil ?? Math.min(1, windowRange[1] + 0.34);
  const tokens = buildTokens(text, mode);
  const revealWindow = Math.max(0.15, windowRange[1] - windowRange[0]);
  const viewportAmount = Math.min(0.95, Math.max(0.3, windowRange[1]));

  useMotionValueEvent(progressSource, "change", (latest) => {
    setProgressValue(latest);
  });

  const stagedTokens = useMemo(() => {
    const staggerStep = Math.max(0.002, stagger * 0.2);

    return tokens.map((token, index) => {
      const tokenStart = Math.min(0.98, windowRange[0] + index * staggerStep);
      const tokenPeak = Math.min(0.995, windowRange[1] + index * staggerStep);
      const tokenHold = Math.min(
        0.998,
        Math.max(tokenPeak, holdWindowEnd + index * staggerStep * 0.26)
      );

      return {
        ...token,
        tokenStart,
        tokenPeak,
        tokenHold,
      };
    });
  }, [tokens, stagger, windowRange, holdWindowEnd]);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={cn(styles.root, className)}
      style={{ ["--flip-perspective" as string]: `${perspective}px` }}
      aria-label={text}
    >
      {stagedTokens.map((token, index) => {
        const isAnimatedToken = !token.isSpace;
        const delay = isAnimatedToken ? index * stagger : 0;
        const progressLocal = useScrollLinked ? progressValue : 0;
        const peakRange = Math.max(0.0001, token.tokenPeak - token.tokenStart);
        const tReveal = Math.min(
          1,
          Math.max(0, (progressLocal - token.tokenStart) / peakRange)
        );
        const fadeRange = Math.max(0.0001, 1 - token.tokenHold);
        const tExit = Math.min(1, Math.max(0, (progressLocal - token.tokenHold) / fadeRange));
        const stagedOpacity = progressLocal < token.tokenStart
          ? 0
          : progressLocal <= token.tokenPeak
            ? tReveal
            : progressLocal <= token.tokenHold
              ? 1
              : 1 - tExit;
        const stagedY = progressLocal < token.tokenPeak
          ? startY * (1 - tReveal)
          : progressLocal <= token.tokenHold
            ? 0
            : -8 * tExit;
        const stagedRotateX = disableFlip
          ? 0
          : progressLocal < token.tokenPeak
            ? startRotate * (1 - tReveal)
            : progressLocal <= token.tokenHold
              ? 0
              : -8 * tExit;
        const scrollLinkedTarget = disableFlip
          ? { opacity: stagedOpacity, y: stagedY }
          : { opacity: stagedOpacity, y: stagedY, rotateX: stagedRotateX };

        return (
          <span key={token.key} className={styles.clip}>
            <motion.span
              className={cn(styles.token, tokenClassName)}
              initial={
                useScrollLinked
                  ? false
                  : disableFlip
                    ? { opacity: 0, y: startY }
                    : { opacity: 0, rotateX: startRotate, y: startY }
              }
              whileInView={
                useScrollLinked
                  ? undefined
                  : disableFlip
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, rotateX: 0, y: 0 }
              }
              animate={useScrollLinked ? scrollLinkedTarget : undefined}
              viewport={useScrollLinked ? undefined : { once: true, amount: viewportAmount }}
              transition={{
                duration: useScrollLinked
                  ? 0.14
                  : disableFlip
                    ? flat
                      ? 0.5
                      : 0.34
                    : Math.min(0.54, revealWindow + 0.14),
                delay: useScrollLinked ? 0 : delay,
                ease: useScrollLinked ? "linear" : "easeOut",
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
