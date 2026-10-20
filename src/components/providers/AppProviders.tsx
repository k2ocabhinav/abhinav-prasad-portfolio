"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const HomeOnlyProviders = dynamic(() => import("./HomeOnlyProviders"));

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/work/")) return children;

  return <HomeOnlyProviders>{children}</HomeOnlyProviders>;
}
