"use client";

import { useSectionState } from "@/lib/sectionStore";
import styles from "./BackdropCanvas.module.css";

// =============================================================================
// BackdropCanvas — palette v2 paper stock for the fixed page canvas.
// Bone and linen are the only page rooms (pink is ink-only, never a page
// background). The stock comes from the shared section store, so the canvas,
// rail and cursor always agree on the section at the viewport midline.
// Fields (burgundy, glacier) are painted by their own sections.
// =============================================================================

export default function BackdropCanvas() {
  const { stock } = useSectionState();

  return (
    <div
      aria-hidden="true"
      className={styles.canvas}
      data-stock={stock}
      data-home-backdrop-canvas="true"
    />
  );
}
