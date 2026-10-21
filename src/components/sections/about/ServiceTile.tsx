"use client";

import type { ServiceEntry } from "@/types";
import Tag from "@/components/ui/Tag";
import ServiceObjects, { type ServiceObjectVariant } from "@/components/art/ServiceObjects";
import styles from "./ServiceTile.module.css";

// =============================================================================
// ServiceTile: a coloured print tile for one service.
// Intentionally non-interactive; hover only adds tactile polish.
// =============================================================================

interface ServiceTileProps {
  service: ServiceEntry;
  index: number;
}

const serviceTones = ["burgundy", "petrol", "cornflower", "lovebird"] as const;
const serviceObjects: ServiceObjectVariant[] = ["ledger", "stamp", "orchestration"];

interface ServicePresentation {
  tone: (typeof serviceTones)[number];
  object: ServiceObjectVariant;
  title: string;
}

// Tone and print object per service; titles and copy come from the service MDX.
const servicePresentations: Record<string, Omit<ServicePresentation, "title">> = {
  "backend-systems": { tone: "burgundy", object: "ledger" },
  "cloud-delivery": { tone: "petrol", object: "stamp" },
  "developer-tooling": { tone: "cornflower", object: "orchestration" },
};

export default function ServiceTile({ service, index }: ServiceTileProps) {
  const preset = servicePresentations[service.id];
  const presentation: ServicePresentation = {
    tone: preset?.tone ?? serviceTones[index % serviceTones.length],
    object: preset?.object ?? serviceObjects[index % serviceObjects.length],
    title: service.title,
  };

  return (
    <article
      className={styles.tile}
      data-tone={presentation.tone}
      data-service-id={service.id}
    >
      <div className={styles.headingRow}>
        <div className={styles.icon}>
          <ServiceObjects variant={presentation.object} />
        </div>
        <h3 className={styles.title}>{presentation.title}</h3>
      </div>
      <p className={styles.description}>{service.description}</p>
      {service.tags?.length ? (
        <div className={styles.tags}>
          {service.tags.map((tag) => (
            <Tag key={tag} label={tag} variant="subtle" />
          ))}
        </div>
      ) : null}
    </article>
  );
}
