"use client";

import { renderIcon } from "@/lib/utils";
import type { Service } from "@/types";
import Tag from "@/components/ui/Tag";
import styles from "./ServiceTile.module.css";

interface ServiceTileProps {
  service: Service;
}

export default function ServiceTile({ service }: ServiceTileProps) {
  return (
    <article className={styles.tile}>
      <div className={styles.icon}>{renderIcon(service.icon, { size: 24 })}</div>
      <h3 className={styles.title}>{service.title}</h3>
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
