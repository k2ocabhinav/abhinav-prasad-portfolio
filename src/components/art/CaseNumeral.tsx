import styles from "./CaseNumeral.module.css";

interface CaseNumeralProps {
  number: string;
}

export default function CaseNumeral({ number }: CaseNumeralProps) {
  return (
    <svg
      className={styles.numeral}
      viewBox="0 0 116 92"
      aria-hidden="true"
      focusable="false"
    >
      <text x="5" y="77" fill="var(--plate-second)" fontFamily="var(--font-display, serif)" fontSize="84" fontWeight="600" letterSpacing="-7">{number}</text>
      <text x="8" y="80" fill="var(--plate-accent)" fontFamily="var(--font-display, serif)" fontSize="84" fontWeight="600" letterSpacing="-7">{number}</text>
    </svg>
  );
}
