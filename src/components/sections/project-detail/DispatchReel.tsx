import Image from "next/image";
import type { CSSProperties } from "react";
import type { ProjectStoryViewport, ProjectStoryVisual, ProjectTripStep } from "@/types";
import styles from "./DispatchReel.module.css";

interface DispatchReelProps {
  steps: ProjectTripStep[];
  visuals: ProjectStoryVisual[];
}

// Every capture keeps its own aspect ratio so no key interface is cropped: the
// two workspaces are portrait phone screens (750x1624) and the dispatch desk is
// the full desktop screen (1440x750).
const FRAME_RATIO: Record<ProjectStoryViewport, string> = {
  mobile: "750 / 1624",
  desktop: "1440 / 750",
};

const FRAME_SIZES: Record<ProjectStoryViewport, string> = {
  mobile: "(max-width: 767px) 340px, 360px",
  desktop: "(max-width: 767px) 360px, (max-width: 1100px) 92vw, 1296px",
};

export default function DispatchReel({ steps, visuals }: DispatchReelProps) {
  const visualById = new Map(visuals.map((visual) => [visual.id, visual]));

  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => {
        const visual = visualById.get(step.visualId);
        if (!visual) return null;

        return (
          <li
            key={step.role}
            className={styles.step}
            data-viewport={visual.viewport}
            data-visual-id={step.visualId}
          >
            <div className={styles.stepText}>
              <p className={styles.stepRole}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.role}
              </p>
              <h3 className={styles.stepTitle}>{step.label}</h3>
              <p className={styles.stepSummary}>{step.summary}</p>
            </div>

            <figure
              className={styles.stepMedia}
              style={{ "--frame-ratio": FRAME_RATIO[visual.viewport] } as CSSProperties}
            >
              <div className={styles.frame}>
                <div className={styles.frameInner}>
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes={FRAME_SIZES[visual.viewport]}
                    className={styles.image}
                  />
                </div>
              </div>
              <figcaption className={styles.caption}>{visual.caption}</figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
  );
}
