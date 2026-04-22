import type { DoodleAsset } from "@/types";

// =============================================================================
// Doodle Assets — Hand-drawn SVG accent marks for the hero doodle engine.
// All paths are single-stroke thin lines that render in the active accent color.
// Anchor hints map to absolute CSS positions in DoodleEngine.module.css.
// =============================================================================

export const doodles: DoodleAsset[] = [
  {
    id: "arrow",
    svgPath: "M3 12 L21 12 M15 6 L21 12 L15 18",
    viewBox: "0 0 24 24",
    size: 42,
    anchorHint: "topRight",
  },
  {
    id: "star",
    svgPath: "M12 2 L13.8 8.8 L21 8.8 L15.2 13 L17.4 20 L12 15.8 L6.6 20 L8.8 13 L3 8.8 L10.2 8.8 Z",
    viewBox: "0 0 24 24",
    size: 36,
    anchorHint: "topLeft",
  },
  {
    id: "circle",
    svgPath: "M12 4 C17.5 4 21 7.5 21 12 C21 16.5 17.5 21 12 21 C6.5 21 3 16.5 3 12 C3 7.5 6.5 4 12 4",
    viewBox: "0 0 24 24",
    size: 44,
    anchorHint: "bottomLeft",
  },
  {
    id: "squiggle",
    svgPath: "M2 12 Q5.5 6 9 12 Q12.5 18 16 12 Q19.5 6 23 12",
    viewBox: "0 0 25 24",
    size: 50,
    anchorHint: "bottomRight",
  },
  {
    id: "spark",
    svgPath: "M12 3 L12 21 M3 12 L21 12 M5.6 5.6 L18.4 18.4 M18.4 5.6 L5.6 18.4",
    viewBox: "0 0 24 24",
    size: 32,
    anchorHint: "inlineRight",
  },
  {
    id: "bracket",
    svgPath: "M15 4 L8 4 L8 20 L15 20",
    viewBox: "0 0 24 24",
    size: 36,
    anchorHint: "inlineLeft",
  },
  {
    id: "zigzag",
    svgPath: "M2 16 L7 8 L12 16 L17 8 L22 16",
    viewBox: "0 0 24 24",
    size: 46,
    anchorHint: "topLeft",
  },
  {
    id: "swoop",
    svgPath: "M4 17 Q8 10 12 14 Q16 18 20 10",
    viewBox: "0 0 24 24",
    size: 48,
    anchorHint: "topRight",
  },
];
