import styles from "./BackdropCanvas.module.css";

// =============================================================================
// BackdropCanvas — static warm-paper canvas with a uniform paper-grain layer.
// Matte editorial: no orbs, no scroll color-morphing, no blend glow. The grain
// is the single page-wide texture (feTurbulence, multiply, ~6%).
// =============================================================================

export default function BackdropCanvas() {
  return (
    <div
      aria-hidden="true"
      className={styles.canvas}
      data-home-backdrop-canvas="true"
    >
      <span className={styles.grain} aria-hidden="true" />
    </div>
  );
}
