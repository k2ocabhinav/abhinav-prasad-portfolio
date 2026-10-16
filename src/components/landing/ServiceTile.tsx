"use client";

import type { Service } from "@/types";
import Tag from "@/components/ui/Tag";
import ServiceObjects, { type ServiceObjectVariant } from "@/components/art/ServiceObjects";
import styles from "./ServiceTile.module.css";

// =============================================================================
// ServiceTile — Informational glass card for service offerings.
// Intentionally non-interactive; hover only adds tactile polish.
// =============================================================================

interface ServiceTileProps {
  service: Service;
  index: number;
}

const serviceTones = ["burgundy", "petrol", "cornflower", "lovebird"] as const;
const serviceObjects: ServiceObjectVariant[] = ["ledger", "stamp", "orchestration"];

interface ServicePresentation {
  tone: (typeof serviceTones)[number];
  object: ServiceObjectVariant;
  title: string;
}

const servicePresentations: Record<string, ServicePresentation> = {
  "backend-systems": {
    tone: "burgundy",
    object: "ledger",
    title: "Operational software",
  },
  "cloud-delivery": {
    tone: "petrol",
    object: "stamp",
    title: "Systems and data",
  },
  "developer-tooling": {
    tone: "cornflower",
    object: "orchestration",
    title: "Coding agents",
  },
};

export default function ServiceTile({ service, index }: ServiceTileProps) {
  const presentation = servicePresentations[service.id] ?? {
    tone: serviceTones[index % serviceTones.length],
    object: serviceObjects[index % serviceObjects.length],
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
