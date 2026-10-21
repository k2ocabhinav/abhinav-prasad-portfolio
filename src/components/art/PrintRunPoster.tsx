"use client";

import * as m from "motion/react-m";
import { useTransform, type MotionValue } from "motion/react";
import { HalftonePattern } from "./HalftonePattern";
import strokes from "./plateStrokes.module.css";
import styles from "./PrintRunPoster.module.css";

interface PrintRunPosterProps {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}

export default function PrintRunPoster({
  progress,
  reducedMotion,
}: PrintRunPosterProps) {
  const paperY = useTransform(progress, [0.04, 0.42], [20, 0]);
  const routeX = useTransform(progress, [0.09, 0.48], [-22, 0]);
  const routeOpacity = useTransform(progress, [0.09, 0.38], [0.5, 1]);
  const ticketY = useTransform(progress, [0.18, 0.55], [18, 0]);
  const registrationY = useTransform(progress, [0.24, 0.58], [-12, 0]);

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

      <m.g className={styles.paperLayer} style={{ y: reducedMotion ? 0 : paperY }}>
        <path d="m43 26 339 0 0 449-339 0z" fill="var(--plate-ink)" />
        <path
          d="m32 15 339 0 0 449-339 0z"
          fill="var(--plate-paper)"
          stroke="var(--plate-second)"
          className={strokes.bold}
        />
        <path d="M52 35h299v409H52z" fill="none" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M68 52h284" stroke="var(--plate-ink)" className={strokes.mid} />
        <text
          x="68"
          y="78"
          fill="var(--plate-ink)"
          fontFamily="var(--font-label, monospace)"
          fontSize="13"
          letterSpacing="1.2"
        >
          BUILD LOOP
        </text>
        <text
          x="350"
          y="78"
          fill="var(--plate-accent)"
          fontFamily="var(--font-label, monospace)"
          fontSize="12"
          letterSpacing=".8"
          textAnchor="end"
        >
          FOUR STEPS
        </text>
        <path d="M68 95h284" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M68 95h166" stroke="var(--plate-second)" className={strokes.mid} />
      </m.g>

      <m.g
        className={styles.routeLayer}
        style={reducedMotion ? { x: 0, opacity: 1 } : { x: routeX, opacity: routeOpacity }}
      >
        <path
          d="M84 145c30-18 49 18 80 0s50-18 80 0 50 18 80 0"
          fill="none"
          stroke="var(--plate-second)"
          strokeDasharray="2 9"
          strokeLinecap="round"
          className={strokes.bold}
        />
        <path
          d="M82 143c30-18 49 18 80 0s50-18 80 0 50 18 80 0"
          fill="none"
          stroke="var(--plate-accent)"
          strokeDasharray="2 9"
          strokeLinecap="round"
          className={strokes.mid}
        />
        <g fill="var(--plate-paper)" stroke="var(--plate-ink)" className={strokes.bold}>
          <circle cx="82" cy="143" r="9" />
          <circle cx="162" cy="143" r="9" />
          <circle cx="242" cy="143" r="9" />
          <circle cx="322" cy="143" r="9" />
        </g>
        <circle cx="162" cy="143" r="3.5" fill="var(--plate-accent)" />
        <circle cx="242" cy="143" r="3.5" fill="var(--plate-second)" />
        <g
          fill="var(--plate-ink)"
          fontFamily="var(--font-label, monospace)"
          fontSize="13"
          letterSpacing=".15"
          textAnchor="middle"
        >
          <text x="82" y="171">SCOPE</text>
          <text x="162" y="171">ASSIGN</text>
          <text x="242" y="171">REVIEW</text>
          <text x="322" y="171">VERIFY</text>
        </g>
        <path d="M68 192h284" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M68 192h284" stroke="url(#print-run-halftone)" className={strokes.bold} opacity=".55" />
      </m.g>

      <m.g className={styles.ticketLayer} style={{ y: reducedMotion ? 0 : ticketY }}>
        <path d="M68 218h284v151H68z" fill="var(--plate-second)" opacity=".24" />
        <path
          d="M68 214h284v151H68z"
          fill="var(--plate-paper)"
          stroke="var(--plate-ink)"
          className={strokes.mid}
        />
        <path d="M247 214v151" stroke="var(--plate-ink)" strokeDasharray="2 5" className={strokes.fine} />
        <text
          x="84"
          y="241"
          fill="var(--plate-accent)"
          fontFamily="var(--font-label, monospace)"
          fontSize="10"
          letterSpacing="1"
        >
          HUMAN CHECK
        </text>
        <text
          x="84"
          y="271"
          fill="var(--plate-ink)"
          fontFamily="var(--font-display, serif)"
          fontSize="22"
          fontWeight="600"
        >
          Before merge
        </text>
        <path d="M84 286h138" stroke="var(--plate-ink)" className={strokes.fine} />
        <path d="M84 299h112m-112 9h94" stroke="var(--plate-ink)" opacity=".55" className={strokes.fine} />
        <path d="M84 336h136" stroke="var(--plate-accent)" className={strokes.mid} />

        <text
          x="266"
          y="240"
          fill="var(--plate-ink)"
          fontFamily="var(--font-label, monospace)"
          fontSize="9"
          letterSpacing=".6"
        >
          CHANGE SET
        </text>
        <path d="M264 258h75v62h-75z" fill="var(--plate-accent)" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="M273 270h34m-34 9h50m-50 9h42m-42 9h25" fill="none" stroke="var(--plate-paper)" className={strokes.fine} />
        <path d="m314 301 5 5 10-13" fill="none" stroke="var(--plate-ink)" className={strokes.mid} />
        <text
          x="266"
          y="337"
          fill="var(--plate-ink)"
          fontFamily="var(--font-label, monospace)"
          fontSize="8.5"
          letterSpacing=".1"
        >
          DIFF REVIEW
        </text>
      </m.g>

      <m.g className={styles.registrationLayer} style={{ y: reducedMotion ? 0 : registrationY }}>
        <path d="M68 397h284" stroke="var(--plate-ink)" className={strokes.mid} />
        <path d="M330 418h20m-10-10v20M340 438v10m-10-5h20" fill="none" stroke="var(--plate-accent)" className={strokes.mid} />
        <path d="M68 450h-14v-14m287 14h14v-14M68 48H54V34m287 14h14V34" fill="none" stroke="var(--plate-accent)" className={strokes.mid} />
      </m.g>
    </svg>
  );
}
