import strokes from "./plateStrokes.module.css";
import styles from "./AgentMethodPlate.module.css";

export default function AgentMethodPlate() {
  return (
    <svg
      className={styles.plate}
      viewBox="0 0 520 64"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M28 31h464"
        fill="none"
        stroke="var(--plate-second)"
        strokeDasharray="1 8"
        strokeLinecap="round"
        className={strokes.bold}
      />
      <path
        d="M28 29h464"
        fill="none"
        stroke="var(--plate-accent)"
        strokeDasharray="1 8"
        strokeLinecap="round"
        className={strokes.mid}
      />
      <g fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.bold}>
        <circle cx="28" cy="29" r="10" />
        <circle cx="183" cy="29" r="10" />
        <circle cx="337" cy="29" r="10" />
        <circle cx="492" cy="29" r="10" />
      </g>
      <g fill="var(--plate-accent)">
        <circle cx="28" cy="29" r="3" />
        <circle cx="337" cy="29" r="3" />
      </g>
      <g fill="var(--plate-second)">
        <circle cx="183" cy="29" r="3" />
        <circle cx="492" cy="29" r="3" />
      </g>
    </svg>
  );
}
