"use client";

import * as m from "motion/react-m";
import type { ServiceEntry } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { landingStagger, staggerItem } from "@/lib/animations";
import ServiceTile from "./ServiceTile";
import styles from "./ServiceTiles.module.css";

// The three coloured service tiles. The AI-assisted tile leads the grid as the
// tall feature; the other two stack beside it. Reduced motion renders the same
// grid without the stagger.

interface ServiceTilesProps {
  services: ServiceEntry[];
}

const FEATURED_ID = "developer-tooling";

export default function ServiceTiles({ services }: ServiceTilesProps) {
  const reduceMotion = useReducedMotion();
  if (services.length === 0) return null;

  const featured = services.find((service) => service.id === FEATURED_ID);
  const ordered = featured
    ? [featured, ...services.filter((service) => service.id !== FEATURED_ID)]
    : services;

  const items = ordered.map((service, index) => (
    <m.div
      key={service.id}
      variants={reduceMotion ? undefined : staggerItem}
      className={styles.gridItem}
      data-featured={service.id === FEATURED_ID ? "true" : "false"}
    >
      <ServiceTile service={service} index={index} />
    </m.div>
  ));

  if (reduceMotion) {
    return <div className={styles.grid}>{items}</div>;
  }

  return (
    <m.div
      className={styles.grid}
      variants={landingStagger(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {items}
    </m.div>
  );
}
