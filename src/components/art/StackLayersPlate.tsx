import styles from "./StackLayersPlate.module.css";
import strokes from "./plateStrokes.module.css";
import { HalftonePattern } from "./HalftonePattern";

export default function StackLayersPlate() {
  return (
    <svg className={styles.plate} viewBox="0 0 560 280" aria-hidden="true" focusable="false">
      <defs><HalftonePattern id="stack-layer-dots" size={6} radius={1.2} /></defs>
      <path d="M55 24h462v232H55z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m103 235 219-18 39 20-219 18z" fill="url(#stack-layer-dots)" opacity=".65" />
      <path d="M139 68v150M318 52v147" stroke="var(--plate-ink)" className={strokes.fine} strokeDasharray="3 5" />
      <path d="m105 203 207-17 43 24-207 18z" fill="var(--plate-ink)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m148 228 207-18v8l-207 18z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M216 200v12c0 9 53 5 53-4v-12" fill="var(--plate-paper)" stroke="var(--plate-paper)" className={strokes.fine} />
      <ellipse cx="242.5" cy="197" rx="26.5" ry="7" fill="var(--plate-accent)" stroke="var(--plate-paper)" className={strokes.fine} />
      <path d="m105 152 207-17 43 24-207 18z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m148 177 207-18v7l-207 18z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m158 157 50-5 30 12 61-5" fill="none" stroke="var(--plate-ink)" className={strokes.bold} strokeDasharray="2 5" />
      <circle cx="158" cy="157" r="3.5" fill="var(--plate-accent)" stroke="var(--plate-ink)" />
      <circle cx="238" cy="164" r="3.5" fill="var(--plate-accent)" stroke="var(--plate-ink)" />
      <circle cx="299" cy="159" r="3.5" fill="var(--plate-accent)" stroke="var(--plate-ink)" />
      <path d="m105 101 207-17 43 24-207 18z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m148 126 207-18v7l-207 18z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m153 101 40-3 14 8-40 4zM218 96l40-3 14 8-40 4zM282 91l29-2 14 8-29 3z" fill="var(--plate-ink)" />
      <path d="m105 50 207-17 43 24-207 18z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m148 75 207-18v7l-207 18z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m153 50 133-11 22 12-133 11z" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m162 55 133-11" stroke="var(--plate-ink)" className={strokes.fine} />
      <path d="m177 57 30-3M218 54l29-3" stroke="var(--plate-ink)" className={strokes.mid} />
      <g fill="var(--plate-ink)" fontFamily="var(--font-label, monospace)" fontSize="14" letterSpacing=".8">
        <text x="391" y="65">CLIENT</text>
        <text x="391" y="116">SERVICE</text>
        <text x="391" y="167">EVENTS</text>
        <text x="391" y="218">DATA STORE</text>
      </g>
      <path d="M358 60h23M358 111h23M358 162h23M358 213h23" stroke="var(--plate-ink)" className={strokes.fine} />
      <path d="M17 33h25M25 25v24M530 238h23M542 226v24M28 249h14M35 242v14" stroke="var(--plate-ink)" className={strokes.fine} />
    </svg>
  );
}
