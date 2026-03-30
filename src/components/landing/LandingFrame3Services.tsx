"use client";

import { motion } from "motion/react";
import { services } from "@/data/services";
import { landingStagger, staggerItem } from "@/lib/animations";
import ServiceTile from "./ServiceTile";
import styles from "./LandingFrame3Services.module.css";

interface LandingFrame3ServicesProps {
  reduceMotion?: boolean;
}

export default function LandingFrame3Services({
  reduceMotion = false,
}: LandingFrame3ServicesProps) {
  if (reduceMotion) {
    return (
      <section className={styles.frame} aria-label="Services">
        <div className={styles.container}>
          <span className={styles.sectionLabel}>What I Do</span>
          <div className={styles.grid}>
            {services.map((service) => (
              <div key={service.id}>
                <ServiceTile service={service} />
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
        <span className={styles.sectionLabel}>What I Do</span>
        <motion.div
          className={styles.grid}
          variants={landingStagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={staggerItem}>
              <ServiceTile service={service} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
