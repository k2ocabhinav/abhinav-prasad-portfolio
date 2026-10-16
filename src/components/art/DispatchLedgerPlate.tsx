import { HalftonePattern } from "./HalftonePattern";
import styles from "./DispatchLedgerPlate.module.css";
import strokes from "./plateStrokes.module.css";

export default function DispatchLedgerPlate() {
  return (
    <svg
      className={styles.plate}
      viewBox="0 0 420 300"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <HalftonePattern id="dispatch-ledger-dots" size={6} radius={1.25} />
      </defs>

      <path d="m46 64 289-18 17 208-289 18z" fill="var(--plate-ink)" />
      <path d="m32 48 286-18 18 211-286 18z" fill="var(--plate-second)" />
      <path d="m26 42 286-18 18 211-286 18z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m26 42 286-18 4 48-286 18z" fill="var(--plate-accent)" />

      <path d="m48 110 242-15 2 18-242 15z" fill="url(#dispatch-ledger-dots)" opacity=".34" />
      <path d="m48 108 242-15" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m48 126 104-7m19-1 120-8" fill="none" stroke="var(--plate-ink)" className={strokes.mid} opacity=".62" />

      <path d="m67 178 60-4 38-35 46 36 50-4" fill="none" stroke="var(--plate-accent)" className={strokes.bold} strokeDasharray="2 8" strokeLinecap="round" />
      <circle cx="67" cy="178" r="8" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.bold} />
      <circle cx="165" cy="139" r="9" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.bold} />
      <circle cx="211" cy="175" r="8" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.bold} />
      <path d="M251 157v35m-10-10 10 10 10-10" fill="none" stroke="var(--plate-ink)" className={strokes.bold} strokeLinecap="square" strokeLinejoin="miter" />

      <path d="m48 218 84-5m12-1 42-3m14-1 91-6" fill="none" stroke="var(--plate-ink)" className={strokes.mid} opacity=".45" />
      <path d="m48 232 53-3m13-1 57-4m12-1 106-7" fill="none" stroke="var(--plate-ink)" className={strokes.mid} opacity=".45" />

      <path d="M342 46h24m-12-12v24M362 250h22m-11-11v22" fill="none" stroke="var(--plate-accent)" className={strokes.mid} />
      <circle cx="354" cy="46" r="3" fill="var(--plate-ink)" />
    </svg>
  );
}
