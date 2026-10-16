"use client";

import { motion } from "motion/react";
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
  reduceMotion?: boolean;
}

export default function LandingFrame3Services({
  services,
  reduceMotion = false,
}: LandingFrame3ServicesProps) {
  if (services.length === 0) {
    return null;
  }

  if (reduceMotion) {
    return (
      <section className={styles.frame} aria-label="Services">
        <div className={styles.container}>
          <h2 className={styles.sectionLabel}>(01) — What I do</h2>
          <div className={styles.grid}>
          {services.map((service, index) => (
              <div key={service.id} className={styles.gridItem}>
              <ServiceTile service={service} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.frame} aria-label="Services">
      <div className={styles.container}>
        <h2 className={styles.sectionLabel}>(01) — What I do</h2>
        <motion.div
          className={styles.grid}
          variants={landingStagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((service, index) => (
            <motion.div key={service.id} variants={staggerItem} className={styles.gridItem}>
              <ServiceTile service={service} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
