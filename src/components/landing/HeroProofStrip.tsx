import PaperPlanes from "@/components/art/PaperPlanes";
import styles from "./HeroProofStrip.module.css";

// =============================================================================
// HeroProofStrip — the three proof points on the hero's burgundy floor band.
//
// Every claim is a shipped fact or a checked number; the strip is the one
// proof point the first screen carries.
// =============================================================================

interface HeroProofPoint {
  id: string;
  lead: string;
  detail: string;
}

const proofPoints: HeroProofPoint[] = [
  {
    id: "ostrum",
    lead: "Release prep, 2 h → 20 min",
    detail: "Python/Tkinter tooling prepares migration files, backups, and reports.",
  },
  {
    id: "runs",
    lead: "AI model selection",
    detail: "I scored and compared 74 AI coding runs before choosing a model.",
  },
  {
    id: "relocation",
    lead: "Open to relocation",
    detail: "Working remotely from India and open to relocation.",
  },
];

export default function HeroProofStrip() {
  return (
    <div className={styles.strip}>
      <ul className={styles.items}>
        {proofPoints.map((point) => (
          <li key={point.id} className={styles.item}>
            <span className={styles.lead}>{point.lead}</span>
            <span className={styles.detail}>{point.detail}</span>
          </li>
        ))}
      </ul>

      <div className={styles.planes} aria-hidden="true">
        <PaperPlanes />
      </div>
    </div>
  );
}
