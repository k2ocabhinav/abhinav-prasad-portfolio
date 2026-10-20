"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const HomeOnlyProviders = dynamic(() => import("./HomeOnlyProviders"));

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname();

  // Hydration marker for the motion primitives: their CSS failsafe only runs
  // while the app has not hydrated, so a failed bundle can never leave text
  // hidden, and a hydrated page keeps every reveal for when it scrolls in.
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
  }, []);

  if (pathname.startsWith("/work/")) return children;

  return <HomeOnlyProviders>{children}</HomeOnlyProviders>;
}
