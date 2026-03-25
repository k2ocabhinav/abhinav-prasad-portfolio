// =============================================================================
// Theme System — Floating Artifact Definitions
// =============================================================================

export interface ArtifactDef {
  id: string;
  /** SVG path data — any valid SVG path */
  svgPath: string;
  /** SVG viewBox height for aspect ratio */
  viewBox?: string;
  /** Fill color (CSS color value) */
  fill: string;
  /** Stroke color (for outlined shapes) */
  stroke?: string;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Size in px */
  size: number;
  /** Opacity 0-1 */
  opacity: number;
  /** X position: % from left edge (5-20 for left zone, 80-95 for right zone) */
  x: number;
  /** Y position: % from top of page */
  y: number;
  /** Scroll range: [startPct, endPct] of total page height */
  scrollRange: [number, number];
  /** Bobbing amplitude in px */
  bobAmplitude: number;
  /** Bobbing duration in seconds */
  bobDuration: number;
  /** Rotation swing in degrees */
  rotationSwing: number;
}

export interface Theme {
  id: string;
  name: string;
  artifacts: ArtifactDef[];
}

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
      // Arc on left, upper - section boundary (Hero/About)
      {
        id: "arc-left-1",
        svgPath: SVG_PATHS.arcOpen,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1,
        size: 36,
        opacity: 0.18,
        x: 8,
        y: 20,
        scrollRange: [0, 30],
        bobAmplitude: 6,
        bobDuration: 5,
        rotationSwing: 4,
      },
      // Flowing curve on right, middle - About/Experience transition
      {
        id: "curve-right-1",
        svgPath: SVG_PATHS.curve,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sage,
        fill: "none",
        strokeWidth: 1.5,
        size: 32,
        opacity: 0.15,
        x: 88,
        y: 45,
        scrollRange: [25, 65],
        bobAmplitude: 8,
        bobDuration: 6,
        rotationSwing: 3,
      },
      // Small ring on left, lower - Works/Tech Stack transition
      {
        id: "ring-left-1",
        svgPath: SVG_PATHS.ring,
        viewBox: "0 0 24 24",
        stroke: ARTIFACT_COLORS.sageLight,
        fill: "none",
        strokeWidth: 1,
        size: 28,
        opacity: 0.12,
        x: 12,
        y: 68,
        scrollRange: [55, 90],
        bobAmplitude: 5,
        bobDuration: 7,
        rotationSwing: 2,
      },
      // Delicate dot on right, very low - Presence/Contact area
      {
        id: "dot-right-1",
        svgPath: SVG_PATHS.dot,
        viewBox: "0 0 24 24",
        fill: ARTIFACT_COLORS.sage,
        size: 16,
        opacity: 0.20,
        x: 85,
        y: 82,
        scrollRange: [70, 100],
        bobAmplitude: 4,
        bobDuration: 5.5,
        rotationSwing: 0,
      },
    ],
  },
];

// Currently active theme ID
export const activeThemeId = "default";
