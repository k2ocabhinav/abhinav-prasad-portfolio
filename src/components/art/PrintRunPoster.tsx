import { HalftonePattern } from "./HalftonePattern";
import styles from "./PrintRunPoster.module.css";

export default function PrintRunPoster() {
  return (
    <svg
      className={styles.poster}
      viewBox="0 0 420 500"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <HalftonePattern id="print-run-halftone" size={7} radius={1.35} />
      </defs>

      <g className={styles.paperLayer}>
        <path d="m43 26 339 0 0 449-339 0z" fill="var(--plate-ink)" />
        <path d="m32 15 339 0 0 449-339 0z" fill="var(--plate-paper)" stroke="var(--plate-second)" strokeWidth="2" />
        <path d="M52 35h299v409H52z" fill="none" stroke="var(--plate-ink)" strokeWidth="1.5" />
        <path d="M68 52h105m14 0h145" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
      </g>

      <g className={styles.routeLayer}>
        <path d="M94 119c28 0 33 24 64 24s37-24 67-24 35 24 65 24 34-24 45-24" fill="none" stroke="var(--plate-accent)" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx="94" cy="119" r="10" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="3" />
        <circle cx="225" cy="119" r="10" fill="var(--plate-second)" stroke="var(--plate-ink)" strokeWidth="3" />
        <circle cx="335" cy="119" r="10" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="3" />
        <path d="M70 176h278v75H70z" fill="url(#print-run-halftone)" opacity=".4" />
        <path d="M70 176h278" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
      </g>

      <g className={styles.vehicleLayer}>
        <path d="M78 279h264l18 19v72H69v-66l9-25Z" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M91 292h63v27H91zm75 0h62v27h-62zm75 0h58v27h-58z" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="2" />
        <path d="M69 336h291" fill="none" stroke="var(--plate-ink)" strokeWidth="4" />
        <circle cx="120" cy="370" r="20" fill="var(--plate-ink)" />
        <circle cx="304" cy="370" r="20" fill="var(--plate-ink)" />
        <circle cx="120" cy="370" r="8" fill="var(--plate-paper)" />
        <circle cx="304" cy="370" r="8" fill="var(--plate-paper)" />
      </g>

      <g className={styles.registrationLayer}>
        <path d="M74 410h140" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
        <text x="74" y="427" fill="var(--plate-second)" fontFamily="var(--font-display)" fontSize="47" fontWeight="600" letterSpacing="-4">03</text>
        <path d="M329 409h22m-11-11v22M340 430v10m-10-5h20" fill="none" stroke="var(--plate-accent)" strokeWidth="2" />
        <path d="M68 450h-14v-14m287 14h14v-14M68 48H54V34m287 14h14V34" fill="none" stroke="var(--plate-accent)" strokeWidth="2" />
      </g>
    </svg>
  );
}
