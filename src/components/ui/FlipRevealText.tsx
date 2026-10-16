"use client";

import * as m from "motion/react-m";
import { useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useMemo, useRef, useState } from "react";
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
  persist?: boolean;
  stagger?: number;
  perspective?: number;
  reduceMotion?: boolean;
  /** Matte mode: masked rise (overflow-clip + translate), no 3D rotation. */
  flat?: boolean;
  /** Misregistered accent copy behind the text; large section titles only. */
  overprint?: boolean;
  className?: string;
  tokenClassName?: string;
}

interface Token {
  key: string;
  value: string;
  isSpace: boolean;
}

interface StagedToken extends Token {
  start: number;
  peak: number;
  hold: number;
}

function buildTokens(text: string, mode: "word" | "char"): Token[] {
  if (mode === "char") {
    return Array.from(text).map((char, index) => ({
      key: `char-${index}-${char}`,
      value: char === " " ? "\u00A0" : char,
      isSpace: char === " ",
    }));
  }

  const words = text.trim().split(/\s+/);
  const output: Token[] = [];

  words.forEach((word, index) => {
    output.push({ key: `word-${index}-${word}`, value: word, isSpace: false });
    if (index < words.length - 1) {
      output.push({ key: `space-${index}`, value: "\u00A0", isSpace: true });
    }
  });

  return output;
}

/** Strictly-increasing [start, peak, hold, end] stops for useTransform. */
function buildRange(
  start: number,
  peak: number,
  hold: number
): [number, number, number, number] {
  const safeStart = Math.min(0.98, Math.max(0, start));
  const safePeak = Math.min(0.995, Math.max(safeStart + 0.0001, peak));
  const safeHold = Math.min(0.998, Math.max(safePeak + 0.0001, hold));
  return [safeStart, safePeak, safeHold, 1];
}

interface FlipTokenProps {
  value: string;
  progress: MotionValue<number>;
  range: [number, number, number, number];
  startY: number;
  startRotate: number;
  persist: boolean;
  flat: boolean;
  className?: string;
}

/** One word/char driven purely by motion values — no React renders per frame. */
function FlipToken({
  value,
  progress,
  range,
  startY,
  startRotate,
  persist,
  flat,
  className,
}: FlipTokenProps) {
  const opacity = useTransform(progress, range, [0, 1, 1, persist ? 1 : 0]);
  const y = useTransform(progress, range, [startY, 0, 0, persist ? 0 : -8]);
  const rotateX = useTransform(progress, range, [
    startRotate,
    0,
    0,
    persist ? 0 : -8,
  ]);

  return (
    <span className={styles.clip}>
      <m.span
        className={cn(styles.token, className)}
        style={
          flat
            ? { opacity, y }
            : { opacity, y, rotateX, transformOrigin: "50% 100%" }
        }
      >
        {value}
      </m.span>
    </span>
  );
}

export default function FlipRevealText({
  text,
  mode = "word",
  triggerRange = [0.2, 0.44],
  progress,
  window,
  holdUntil,
  persist = false,
  stagger = 0.04,
  perspective = 920,
  reduceMotion,
  flat = false,
  overprint = false,
  className,
  tokenClassName,
}: FlipRevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion ?? prefersReducedMotion;
  const disableFlip = flat || shouldReduceMotion;
  const idleProgress = useMotionValue(0);
  const progressSource = progress ?? idleProgress;
  const useScrollLinked = Boolean(progress);
  const startY = flat ? 20 : disableFlip ? 10 : 16;
  const startRotate = disableFlip ? 0 : -112;
  const windowRange = window ?? triggerRange;
  const holdWindowEnd = holdUntil ?? Math.min(1, windowRange[1] + 0.34);
  const viewportAmount = Math.min(0.95, Math.max(0.3, windowRange[1]));
  const tokens = useMemo(() => buildTokens(text, mode), [text, mode]);

  const stagedTokens = useMemo<StagedToken[]>(() => {
    const staggerStep = Math.max(0.002, stagger * 0.2);

    return tokens.map((token, index) => ({
      ...token,
      start: Math.min(0.98, windowRange[0] + index * staggerStep),
      peak: Math.min(0.995, windowRange[1] + index * staggerStep),
      hold: Math.min(
        0.998,
        Math.max(
          windowRange[1] + index * staggerStep,
          holdWindowEnd + index * staggerStep * 0.26
        )
      ),
    }));
  }, [tokens, stagger, windowRange, holdWindowEnd]);

  // will-change only while a reveal is in flight (scroll-linked mode). The ref
  // guard means React state (and the attribute write) only happens on boundary
  // crossings, never on every scroll frame.
  const [animating, setAnimating] = useState(false);
  const animatingRef = useRef(false);
  useMotionValueEvent(progressSource, "change", (latest) => {
    if (!useScrollLinked || shouldReduceMotion) {
      return;
    }
    const next = latest > windowRange[0] - 0.02 && latest < holdWindowEnd + 0.02;
    if (next !== animatingRef.current) {
      animatingRef.current = next;
      setAnimating(next);
    }
  });

  const overprintLayer = overprint ? (
    <span className={styles.overprint} data-overprint={text} aria-hidden="true" />
  ) : null;

  if (shouldReduceMotion) {
    return (
      <span className={cn(styles.root, className)} aria-label={text}>
        {overprintLayer}
        <span className={cn(styles.token, tokenClassName)}>{text}</span>
      </span>
    );
  }

  if (useScrollLinked) {
    return (
      <span
        className={cn(styles.root, className)}
        style={{ ["--flip-perspective" as string]: `${perspective}px` }}
        aria-label={text}
        data-flip-animating={animating ? "true" : undefined}
      >
        {overprintLayer}
        {stagedTokens.map((token) => (
          <FlipToken
            key={token.key}
            value={token.value}
            progress={progressSource}
            range={buildRange(token.start, token.peak, token.hold)}
            startY={startY}
            startRotate={startRotate}
            persist={persist}
            flat={disableFlip}
            className={tokenClassName}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className={cn(styles.root, className)}
      style={{ ["--flip-perspective" as string]: `${perspective}px` }}
      aria-label={text}
    >
      {overprintLayer}
      {tokens.map((token, index) => {
        const isAnimatedToken = !token.isSpace;
        const delay = isAnimatedToken ? index * stagger : 0;

        return (
          <span key={token.key} className={styles.clip}>
            <m.span
              className={cn(styles.token, tokenClassName)}
              initial={
                disableFlip
                  ? { opacity: 0, y: startY }
                  : { opacity: 0, rotateX: startRotate, y: startY }
              }
              whileInView={
                disableFlip
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, rotateX: 0, y: 0 }
              }
              viewport={{ once: true, amount: viewportAmount }}
              transition={{
                duration: disableFlip
                  ? flat
                    ? 0.5
                    : 0.34
                  : Math.min(0.54, Math.max(0.15, windowRange[1] - windowRange[0]) + 0.14),
                delay,
                ease: "easeOut",
              }}
              style={disableFlip ? undefined : { transformOrigin: "50% 100%" }}
            >
              {token.value}
            </m.span>
          </span>
        );
      })}
    </span>
  );
}
