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

export default function ServiceTile({ service, index }: ServiceTileProps) {
  const tone = serviceTones[index % serviceTones.length];
  const object = serviceObjects[index % serviceObjects.length];

  return (
    <article
      className={styles.tile}
      data-tone={tone}
    >
      <div className={styles.headingRow}>
        <div className={styles.icon}>
          <ServiceObjects variant={object} />
        </div>
        <h3 className={styles.title}>{service.title}</h3>
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
