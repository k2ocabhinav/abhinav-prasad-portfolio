// =============================================================================
// Theme System — Floating Artifact Definitions
// ArtifactDef and Theme types are defined in @/types/index.ts
// =============================================================================

import type { Theme } from "@/types";

// SVG path data for thin-stroke organic artifacts
const SVG_PATHS = {
  // Thin arc - open circle stroke
  arcOpen: "M12 2a10 10 0 0 1 0 20",
  // Flowing curve - gentle wave
  curve: "M2 12c3-5 6 3 10-2s7 5 10 0",
  // Small ring outline
  ring: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
  // Subtle ellipse
  ellipse: "M12 4c3 0 6 3 6 8s-3 8-6 8-6-3-6-8 3-8 6-8",
  // Delicate dot
  dot: "M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
};

// Color palette for thin-stroke artifacts (sage only)
const ARTIFACT_COLORS = {
  sage: "#B8C9C1",
  sageLight: "#C9D6CE",
};

// Theme definitions
export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    artifacts: [
      // Arc on left, upper - hero margin
      {
        id: "arc-left-1",
        svgPath: SVG_PATHS.arcOpen,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.2,
        size: 42,
        opacity: 0.28,
        x: 7,
        y: 16,
        scrollRange: [0, 30],
        bobAmplitude: 6,
        bobDuration: 5,
        rotationSwing: 4,
      },
      // Soft ellipse near the upper center-left whitespace
      {
        id: "ellipse-left-1",
        svgPath: SVG_PATHS.ellipse,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sageLight,
        fill: "none",
        strokeWidth: 1.1,
        size: 34,
        opacity: 0.24,
        x: 24,
        y: 12,
        scrollRange: [0, 24],
        bobAmplitude: 5,
        bobDuration: 6.5,
        rotationSwing: 3,
      },
      // Flowing curve on right, upper-middle - hero/about transition
      {
        id: "curve-right-hero",
        svgPath: SVG_PATHS.curve,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sageLight,
        fill: "none",
        strokeWidth: 1.5,
        size: 36,
        opacity: 0.26,
        x: 82,
        y: 24,
        scrollRange: [8, 38],
        bobAmplitude: 6,
        bobDuration: 5.75,
        rotationSwing: 3,
      },
      // Flowing curve on right, middle - about/experience transition
      {
        id: "curve-right-1",
        svgPath: SVG_PATHS.curve,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.5,
        size: 38,
        opacity: 0.30,
        x: 88,
        y: 45,
        scrollRange: [25, 65],
        bobAmplitude: 8,
        bobDuration: 6,
        rotationSwing: 3,
      },
      // Ring on left, middle whitespace
      {
        id: "ring-left-mid",
        svgPath: SVG_PATHS.ring,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.1,
        size: 32,
        opacity: 0.24,
        x: 18,
        y: 42,
        scrollRange: [28, 58],
        bobAmplitude: 5,
        bobDuration: 6.8,
        rotationSwing: 2,
      },
      // Thin arc closer to the content gutter on the right
      {
        id: "arc-right-mid",
        svgPath: SVG_PATHS.arcOpen,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.1,
        size: 30,
        opacity: 0.23,
        x: 74,
        y: 58,
        scrollRange: [42, 76],
        bobAmplitude: 4,
        bobDuration: 5.8,
        rotationSwing: 2,
      },
      // Small ring on left, lower - works/tech transition
      {
        id: "ring-left-1",
        svgPath: SVG_PATHS.ring,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sageLight,
        fill: "none",
        strokeWidth: 1,
        size: 30,
        opacity: 0.22,
        x: 12,
        y: 68,
        scrollRange: [55, 90],
        bobAmplitude: 5,
        bobDuration: 7,
        rotationSwing: 2,
      },
      // Gentle ellipse near lower center-left whitespace
      {
        id: "ellipse-left-lower",
        svgPath: SVG_PATHS.ellipse,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sageLight,
        fill: "none",
        strokeWidth: 1.15,
        size: 40,
        opacity: 0.25,
        x: 26,
        y: 74,
        scrollRange: [60, 94],
        bobAmplitude: 6,
        bobDuration: 7.2,
        rotationSwing: 3,
      },
      // Right-side dot cluster anchor in the lower third
      {
        id: "dot-right-1",
        svgPath: SVG_PATHS.dot,
        viewBox: "0 0 24 24",
        fill: ARTIFACT_COLORS.sage,
        size: 18,
        opacity: 0.30,
        x: 85,
        y: 82,
        scrollRange: [70, 100],
        bobAmplitude: 4,
        bobDuration: 5.5,
        rotationSwing: 0,
      },
      // Secondary dot cluster accent for contact area
      {
        id: "dot-left-2",
        svgPath: SVG_PATHS.dot,
        viewBox: "0 0 24 24",
        fill: ARTIFACT_COLORS.sageLight,
        size: 14,
        opacity: 0.24,
        x: 20,
        y: 88,
        scrollRange: [78, 100],
        bobAmplitude: 3,
        bobDuration: 5.9,
        rotationSwing: 0,
      },
      // Lower-right curve to keep the footer/contact area from feeling empty
      {
        id: "curve-right-lower",
        svgPath: SVG_PATHS.curve,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.4,
        size: 34,
        opacity: 0.27,
        x: 78,
        y: 90,
        scrollRange: [82, 100],
        bobAmplitude: 4,
        bobDuration: 6.1,
        rotationSwing: 2,
      },
    ],
  },
];

// Currently active theme ID
export const activeThemeId = "default";
