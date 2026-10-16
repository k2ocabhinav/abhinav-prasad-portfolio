import styles from "./EnvelopeStamp.module.css";
import strokes from "./plateStrokes.module.css";

export default function EnvelopeStamp() {
  return (
    <svg className={styles.plate} viewBox="0 0 132 104" aria-hidden="true" focusable="false">
      <g transform="rotate(-6 66 52)">
        <path d="M18 32h98v62H18z" fill="var(--plate-second)" />
        <path d="M12 25h98v62H12z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="m13 26 48 37 48-36M13 86l34-34M109 86 75 52" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="M85 14h5v3h5v-3h5v3h5v-3h5v5h-3v5h3v5h-3v5h3v5h-5v-3h-5v3h-5v-3h-5v3h-5v-5h3v-5h-3v-5h3v-5h-3z" fill="var(--plate-accent)" stroke="var(--plate-paper)" className={strokes.fine} />
        <circle cx="97" cy="26.5" r="5" fill="var(--plate-paper)" />
        <path d="M95 26.5h4M97 24.5v4" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M65 31c10-7 19 6 29 0M65 36c10-7 19 6 29 0M65 41c10-7 19 6 29 0" fill="none" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M23 77h29M23 81h17" stroke="var(--plate-ink)" className={strokes.fine} />
      </g>
      <path d="M6 91h12M12 85v12" stroke="var(--plate-second)" className={strokes.fine} />
    </svg>
  );
}
