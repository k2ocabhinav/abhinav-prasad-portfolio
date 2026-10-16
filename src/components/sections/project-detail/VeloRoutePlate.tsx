import styles from "./VeloRoutePlate.module.css";

/** Small two-ink route plate for the Velo case-study cover. Decorative only. */
export default function VeloRoutePlate() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={styles.plate}
      viewBox="0 0 320 132"
      role="presentation"
    >
      <path
        d="M16 40h96l26 26h74l28-28h64"
        fill="none"
        stroke="var(--plate-ink)"
        strokeWidth="1.25"
        strokeDasharray="7 6"
        opacity="0.6"
      />
      <path
        d="M18 100h70l26-26h78l26 26h76"
        fill="none"
        stroke="var(--plate-accent)"
        strokeWidth="5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <g fill="var(--plate-paper)" stroke="var(--plate-accent)" strokeWidth="4">
        <circle cx="18" cy="100" r="7" />
        <circle cx="192" cy="74" r="7" />
      </g>
      <rect x="238" y="96" width="14" height="14" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="4" />
      <path d="M310 100h4" stroke="var(--plate-accent)" strokeWidth="5" strokeLinecap="square" />
      <g stroke="var(--plate-ink)" strokeWidth="1.25" opacity="0.85">
        <path d="M18 116v8M114 62v-8M218 62v-8M312 116v8" />
      </g>
    </svg>
  );
}
