"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import PortalTransitionProvider from "@/components/beyond-terminal/PortalTransitionProvider";
import { useFinePointer } from "@/hooks/useFinePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollingFlag } from "./useScrollingFlag";

interface ExperienceProvidersProps {
  children: ReactNode;
}

// lerp 0.12 (was 0.09). Measured on wheel input in Chromium, headed Chrome and
// WebKit: step-to-step evenness is the same (coefficient of variation 0.77 vs
// 0.82 on a trackpad flick, 0.30 vs 0.29 on mouse notches) but the glide after
// the last input drops from about 530 ms to 320 ms (flick) and 880 ms to
// 630 ms (notches), so fast flicks stop trailing the hand.
const SMOOTH_SCROLL_OPTIONS = { lerp: 0.12, smoothWheel: true };

// Smooth wheel scrolling only exists for a mouse or trackpad. Lenis registers
// non-passive touchstart/touchmove listeners on the window even with
// syncTouch off, and those make every touch scroll wait on the main thread
// before the compositor can start it. Touch-first devices already scroll
// natively (that is what Lenis leaves untouched there), so they skip it, as
// does reduced motion, where the old config smoothed nothing anyway.
function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const lenis = new Lenis({ ...SMOOTH_SCROLL_OPTIONS, autoRaf: true });
    return () => lenis.destroy();
  }, [enabled]);
}

export default function ExperienceProviders({ children }: ExperienceProvidersProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasFinePointer = useFinePointer();
  useSmoothScroll(hasFinePointer && !prefersReducedMotion);
  useScrollingFlag();

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <PortalTransitionProvider>{children}</PortalTransitionProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
