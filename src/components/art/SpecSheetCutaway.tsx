import styles from "./SpecSheetCutaway.module.css";
import strokes from "./plateStrokes.module.css";
import { HalftonePattern } from "./HalftonePattern";

export default function SpecSheetCutaway() {
  return (
    <svg className={styles.plate} viewBox="0 0 320 230" aria-hidden="true" focusable="false">
      <defs><HalftonePattern id="spec-cutaway-dots" size={6} radius={1.1} /></defs>
      <path d="m78 119 188-7 22 20-5 80-190 3z" fill="var(--plate-accent)" />
      <path d="m96 195 188-5-1 22-190 3z" fill="url(#spec-cutaway-dots)" />
      <path d="M72 112h193v85H72z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M72 132h193M84 187h168" stroke="var(--plate-ink)" className={strokes.fine} />
      <path d="M84 122h22M112 122h8" stroke="var(--plate-ink)" className={strokes.bold} />
      <g transform="rotate(-4 120 77)">
        <path d="M25 22h190v101H25z" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="M25 22h190v23H25z" fill="var(--plate-accent)" />
        <path d="M43 34h18M68 34h44M43 59h147M43 74h122M43 89h147M43 104h94" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="M44 77h121" stroke="var(--plate-accent)" className={strokes.bold} />
        <circle cx="33" cy="54" r="2.4" fill="var(--plate-ink)" />
        <circle cx="33" cy="112" r="2.4" fill="var(--plate-ink)" />
        <path d="M185 25v17M181 29h8" stroke="var(--plate-ink)" className={strokes.fine} />
      </g>
      <path d="M212 83h30v58H109v11" fill="none" stroke="var(--plate-accent)" strokeWidth="5" />
      <path d="M210 81h30v58H107v12" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
      <circle cx="240" cy="139" r="4" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M89 152h37v25H89zM96 158h23M96 165h23M96 171h13" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M126 164h23M183 164h30" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="m148 164 18-13 18 13-18 13z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M214 155v18c0 7 29 7 29 0v-18" fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.mid} />
      <ellipse cx="228.5" cy="155" rx="14.5" ry="5" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
      <path d="M277 106h12M283 100v12M54 205h17M62 197v16" stroke="var(--plate-accent)" className={strokes.fine} />
    </svg>
  );
}
