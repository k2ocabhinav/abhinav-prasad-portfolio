import styles from "./PaperPlanes.module.css";
import strokes from "./plateStrokes.module.css";

export default function PaperPlanes() {
  return (
    <svg
      className={styles.planes}
      viewBox="0 0 260 150"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m19 112 93-42-41 48 2 20 18-13 16 13 10-39 52-36z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m72 118 30-19-11 26z" fill="var(--plate-second)" />
      <path d="m114 70-41 48 34-8 12-26z" fill="var(--plate-accent)" />

      <path d="m133 49 73-33-31 41 1 16 14-11 12 10 8-31 39-26z" fill="var(--plate-second)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m175 57 30-41-31 41 31-8" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />

      <path d="m22 38 48-17-26 29 1 11 10-8 8 7 6-22 27-17z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M22 38 45 50l27-29" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
    </svg>
  );
}
