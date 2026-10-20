"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ServiceEntry } from "@/types";
import { landingStagger, staggerItem } from "@/lib/animations";
import ServiceTile from "./ServiceTile";
import styles from "./LandingFrame3Services.module.css";

// =============================================================================
// LandingFrame3Services — Service grid frame.
// Uses motion staggering only on the interactive path; reduced motion renders
// the same content statically.
// =============================================================================

interface LandingFrame3ServicesProps {
  services: ServiceEntry[];
}

export default function LandingFrame3Services({ services }: LandingFrame3ServicesProps) {
  const reduceMotion = useReducedMotion();
  if (services.length === 0) {
    return null;
  }

  const featuredService = services.find((service) => service.id === "developer-tooling");
  const displayServices = featuredService
    ? [featuredService, ...services.filter((service) => service.id !== featuredService.id)]
    : services;

  if (reduceMotion) {
    return (
      <section id="services" className={styles.frame} aria-label="Services">
        <div className={styles.container}>
          <h2 className={styles.sectionLabel}>What I do</h2>
          <div className={styles.grid}>
            {displayServices.map((service, index) => (
              <div
                key={service.id}
                className={styles.gridItem}
                data-featured={service.id === featuredService?.id ? "true" : "false"}
              >
                <ServiceTile service={service} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className={styles.frame} aria-label="Services">
      <div className={styles.container}>
        <h2 className={styles.sectionLabel}>What I do</h2>
        <m.div
          className={styles.grid}
          variants={landingStagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayServices.map((service, index) => (
            <m.div
              key={service.id}
              variants={staggerItem}
              className={styles.gridItem}
              data-featured={service.id === featuredService?.id ? "true" : "false"}
            >
              <ServiceTile service={service} index={index} />
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
