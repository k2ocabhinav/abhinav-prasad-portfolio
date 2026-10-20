"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ExperienceProviders = dynamic(() => import("./ExperienceProviders"));

interface ExperienceProvidersBoundaryProps {
  children: ReactNode;
}

export default function ExperienceProvidersBoundary({
  children,
}: ExperienceProvidersBoundaryProps) {
  return <ExperienceProviders>{children}</ExperienceProviders>;
}
