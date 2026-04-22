"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import PortalTransitionProvider from "@/components/beyond-terminal/PortalTransitionProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      <PortalTransitionProvider>{children}</PortalTransitionProvider>
    </MotionConfig>
  );
}
