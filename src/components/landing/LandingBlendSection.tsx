"use client";

import { motion } from "motion/react";
import styles from "./LandingBlendSection.module.css";

export default function LandingBlendSection() {
  return (
    <div className={styles.blend} aria-hidden="true">
      <motion.span
        className={styles.label}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Explore the Work
      </motion.span>
    </div>
  );
}
