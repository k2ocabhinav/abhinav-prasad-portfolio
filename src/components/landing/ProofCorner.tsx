import styles from "./PressRunController.module.css";

interface ProofPlateProps {
  plate: "petrol" | "cornflower";
}

const proofDensities = [
  { value: 10, radius: 1.07 },
  { value: 25, radius: 1.69 },
  { value: 40, radius: 2.14 },
  { value: 55, radius: 2.51 },
  { value: 70, radius: 2.83 },
  { value: 85, radius: 3.12 },
] as const;

function ProofPlate({ plate }: ProofPlateProps) {
  const id = `pressrun-proof-${plate}`;
  const offset = plate === "cornflower" ? 3 : 0;

  return (
    <svg
      className={styles.proofPlate}
      viewBox="0 0 320 360"
      preserveAspectRatio="none"
      data-proof-plate={plate}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id={`${id}-small-dots`}
          width="10"
          height="10"
          x={offset}
          y={offset}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="0.42" fill={`var(--color-${plate})`} />
        </pattern>
        <pattern
          id={`${id}-medium-dots`}
          width="10"
          height="10"
          x={offset}
          y={offset}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.55" fill={`var(--color-${plate})`} />
        </pattern>
        <pattern
          id={`${id}-large-dots`}
          width="10"
          height="10"
          x={offset}
          y={offset}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="3.2" fill={`var(--color-${plate})`} />
        </pattern>
        <linearGradient
          id={`${id}-growth-medium`}
          x1="0"
          y1="0"
          x2="320"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.38" stopColor="white" stopOpacity="0.38" />
          <stop offset="0.78" stopColor="white" stopOpacity="0.82" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id={`${id}-growth-large`}
          x1="0"
          y1="0"
          x2="320"
          y2="360"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.28" stopColor="white" stopOpacity="0" />
          <stop offset="0.62" stopColor="white" stopOpacity="0.24" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <radialGradient id={`${id}-edge-fade`} cx="51%" cy="55%" r="58%">
          <stop offset="0" stopColor="white" />
          <stop offset="0.62" stopColor="white" stopOpacity="0.86" />
          <stop offset="0.82" stopColor="white" stopOpacity="0.38" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-medium-mask`} data-proof-growth-mask="true">
          <rect width="320" height="360" fill={`url(#${id}-growth-medium)`} />
        </mask>
        <mask id={`${id}-large-mask`}>
          <rect width="320" height="360" fill={`url(#${id}-growth-large)`} />
        </mask>
        <mask id={`${id}-edge-mask`} data-proof-edge-mask="true">
          <rect width="320" height="360" fill={`url(#${id}-edge-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-edge-mask)`} opacity={plate === "petrol" ? 0.72 : 0.42}>
        <rect width="320" height="360" fill={`url(#${id}-small-dots)`} opacity="0.4" />
        <rect
          width="320"
          height="360"
          fill={`url(#${id}-medium-dots)`}
          mask={`url(#${id}-medium-mask)`}
          opacity="0.55"
        />
        <rect
          width="320"
          height="360"
          fill={`url(#${id}-large-dots)`}
          mask={`url(#${id}-large-mask)`}
          opacity="0.78"
        />
      </g>
    </svg>
  );
}

export default function ProofCorner() {
  return (
    <div className={styles.proofCorner} data-pressrun-proof-corner="true" aria-hidden="true">
      <div className={styles.proofPlateStage}>
        <span className={styles.proofPetrolDepth} data-pressrun-depth="proof-petrol">
          <ProofPlate plate="petrol" />
        </span>
        <span className={styles.proofCornflowerDepth} data-pressrun-depth="proof-cornflower">
          <ProofPlate plate="cornflower" />
        </span>
      </div>
      <div className={styles.proofWedge}>
        {proofDensities.map(({ value, radius }, index) => (
          <div className={styles.proofWedgeRow} key={value}>
            <span className={styles.proofWedgeLabel}>{value}</span>
            <svg
              className={styles.proofWedgePatch}
              viewBox="0 0 18 18"
              style={{ animationDelay: `${1180 + index * 40}ms` }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <pattern
                  id={`pressrun-proof-wedge-${value}`}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="3" cy="3" r={radius} fill="var(--color-burgundy)" />
                </pattern>
              </defs>
              <rect width="18" height="18" fill={`url(#pressrun-proof-wedge-${value})`} />
            </svg>
          </div>
        ))}
      </div>
      <span className={styles.proofSlug}>Proof 01 · Abhinav Prasad</span>
    </div>
  );
}
