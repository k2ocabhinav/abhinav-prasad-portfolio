import styles from "./VeloRoutePlate.module.css";
import strokes from "./plateStrokes.module.css";

export default function VeloRoutePlate() {
  return (
    <svg className={styles.plate} viewBox="0 0 680 120" aria-hidden="true" focusable="false">
      <path d="M31 80c80-78 179 52 290-4s198-35 326-2" fill="none" stroke="var(--plate-second)" className={strokes.bold} strokeDasharray="1 9" strokeLinecap="round" />
      <path d="M29 78c80-78 179 52 290-4s198-35 326-2" fill="none" stroke="var(--plate-accent)" className={strokes.mid} strokeDasharray="1 9" strokeLinecap="round" />
      <path d="M29 65v26M645 60v26" stroke="var(--plate-ink)" className={strokes.fine} />
      <circle cx="29" cy="78" r="9" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <circle cx="29" cy="78" r="3" fill="var(--plate-accent)" />
      <circle cx="645" cy="72" r="9" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <circle cx="645" cy="72" r="3" fill="var(--plate-accent)" />
      <g fill="var(--plate-ink)">
        <circle cx="104" cy="31" r="5" />
        <path d="m99 39 10-1 8 12 10-10 3 3-12 15-11-10-3 15 10 18-5 2-12-17-5 17-5-1 6-29-6 9-4-3z" />
        <path d="M78 55h10v17H78z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.fine} />
      </g>
      <g transform="translate(285 33)">
        <path d="M1 10h54l15 14h9v30H1z" fill="var(--plate-ink)" />
        <path d="M47 15h6l11 12H47zM8 16h31v12H8z" fill="var(--plate-paper)" />
        <path d="M8 36h56" stroke="var(--plate-second)" className={strokes.mid} />
        <circle cx="17" cy="55" r="8" fill="var(--plate-ink)" stroke="var(--plate-paper)" className={strokes.mid} />
        <circle cx="62" cy="55" r="8" fill="var(--plate-ink)" stroke="var(--plate-paper)" className={strokes.mid} />
        <circle cx="52" cy="23" r="3" fill="var(--plate-ink)" />
      </g>
      <g transform="translate(556 16)" fill="var(--plate-ink)">
        <path d="M1 16h13v4H1z" />
        <circle cx="8" cy="24" r="5" />
        <path d="m3 31 12 1 6 18-5 2-5-12-1 18 8 15-5 2-10-17-5 18-5-1 5-26-5-11 4-3 5 11z" />
      </g>
      <path d="M17 108h646M51 103v10M630 103v10" stroke="var(--plate-ink)" className={strokes.fine} strokeOpacity=".35" />
    </svg>
  );
}
