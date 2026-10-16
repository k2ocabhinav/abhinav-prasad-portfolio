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
    id: "velo",
    lead: "Velo, working prototype",
    detail: "Multi-tenant dispatch with live maps and realtime updates.",
  },
  {
    id: "runs",
    lead: "74 rated runs",
    detail: "AI coding runs scored and compared before a model is picked.",
  },
  {
    id: "relocation",
    lead: "Open to relocation",
    detail: "Remote from India, open to global roles.",
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
