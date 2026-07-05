"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import PortalTransitionProvider from "@/components/beyond-terminal/PortalTransitionProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const prefersReducedMotion = useReducedMotion();
  // Lenis owns smooth scrolling site-wide. Under reduced motion we collapse the
  // smoothing (lerp: 1 = instant) so scroll stays native and non-vestibular.
  const lenisOptions = prefersReducedMotion
    ? { lerp: 1, smoothWheel: false, duration: 0 }
    : { lerp: 0.09, smoothWheel: true };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <ReactLenis root options={lenisOptions}>
          <PortalTransitionProvider>{children}</PortalTransitionProvider>
        </ReactLenis>
      </LazyMotion>
    </MotionConfig>
  );
}
