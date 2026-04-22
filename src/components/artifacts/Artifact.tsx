"use client";

import type { CSSProperties } from "react";
import type { ArtifactDef } from "@/types";
import styles from "./Artifact.module.css";

interface ArtifactProps {
  artifact: ArtifactDef;
  ambientVisible: boolean;
  registerStageRef: (id: string, node: HTMLDivElement | null) => void;
}

export default function Artifact({
  artifact,
  ambientVisible,
  registerStageRef,
}: ArtifactProps) {
  const style = {
    left: `${artifact.x}%`,
    top: `${artifact.y}%`,
    width: `${artifact.size}px`,
    height: `${artifact.size}px`,
    opacity:
      artifact.priority === "hero" || ambientVisible ? artifact.opacity : 0,
    ["--artifact-stroke" as string]: artifact.palette.stroke ?? "transparent",
    ["--artifact-fill" as string]: artifact.palette.fill ?? "transparent",
    ["--artifact-glow" as string]: artifact.palette.glow ?? "transparent",
    ["--artifact-halo" as string]: artifact.palette.halo ?? "transparent",
    ["--artifact-core" as string]: artifact.palette.core ?? "transparent",
    ["--artifact-satellite" as string]: artifact.palette.satellite ?? "transparent",
    ["--artifact-orbit-duration" as string]: `${artifact.orbitDuration ?? 18}s`,
    ["--artifact-blend-mode" as string]: artifact.blendMode ?? "screen",
  } as CSSProperties;

  return (
    <div className={styles.shell} data-artifact-priority={artifact.priority} style={style}>
      <div
        ref={(node) => registerStageRef(artifact.id, node)}
        className={styles.stage}
        data-artifact-id={artifact.id}
      >
        {artifact.layers?.halo !== false ? <span className={styles.halo} /> : null}
        {artifact.layers?.glow !== false ? <span className={styles.glow} /> : null}

        <svg
          className={styles.vector}
          viewBox={artifact.viewBox || "0 0 24 24"}
          aria-hidden="true"
        >
          <path
            d={artifact.svgPath}
            fill={artifact.palette.fill ?? "none"}
            stroke={artifact.palette.stroke ?? "none"}
            strokeWidth={artifact.strokeWidth ?? 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {artifact.layers?.core ? <span className={styles.core} /> : null}
        {artifact.layers?.satellite ? <span className={styles.satellite} /> : null}
      </div>
    </div>
  );
}
