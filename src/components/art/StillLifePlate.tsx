import { HalftonePattern } from "./HalftonePattern";
import styles from "./StillLifePlate.module.css";

export default function StillLifePlate() {
  return (
    <svg
      className={styles.plate}
      viewBox="0 0 190 220"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <HalftonePattern id="still-life-dots" size={6} radius={1.1} />
      </defs>

      <path d="m22 21 111-7 9 151-111 7z" fill="var(--plate-second)" />
      <path d="m14 14 111-7 9 151-111 7z" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="2" />
      <path d="m33 40 75-5m-73 20 72-5m-70 20 48-3m-46 20 69-5m-67 20 69-5m-67 20 41-3" fill="none" stroke="var(--plate-ink)" strokeWidth="2" opacity=".72" />
      <path d="m31 39 8-1m34-2 8-1m-47 41 8-1m36-2 8-1m-47 41 8-1m36-2 8-1" fill="none" stroke="var(--plate-accent)" strokeWidth="3" />
      <path d="m38 139 71-5v13l-71 5z" fill="url(#still-life-dots)" opacity=".45" />

      <path d="m133 169 37-124 13 4-37 124-11 13z" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="m165 62 13 4" fill="none" stroke="var(--plate-paper)" strokeWidth="3" />
      <path d="m133 169-2 17 14-13" fill="var(--plate-ink)" />

      <circle cx="156" cy="195" r="14" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
      <circle cx="156" cy="195" r="5" fill="var(--plate-accent)" />
      <path d="M156 176v-7m0 52v-7m-19-19h-7m52 0h-7" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
    </svg>
  );
}
