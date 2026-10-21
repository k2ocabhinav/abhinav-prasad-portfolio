import styles from "./PrinterSlug.module.css";

export default function PrinterSlug() {
  return (
    <svg
      className={styles.plate}
      viewBox="0 0 96 48"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 13h56v5H20z" fill="var(--plate-ink)" />
      <path d="M20 22h34v5H20z" fill="var(--plate-accent)" />
      <path d="M58 22h18v5H58z" fill="var(--plate-second)" />
      <path d="M20 31h11v5H20zM35 31h11v5H35zM50 31h11v5H50zM65 31h11v5H65z" fill="var(--plate-ink)" />
    </svg>
  );
}
