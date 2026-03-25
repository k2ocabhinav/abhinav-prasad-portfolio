"use client";

import { motion } from "motion/react";
import { dividerVariants } from "@/lib/animations";

// =============================================================================
// AnimatedDivider — Horizontal line that scales in from left on viewport entry
// =============================================================================

export default function AnimatedDivider() {
  return (
    <motion.div
      variants={dividerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="section-divider"
      style={{ width: "100%", transformOrigin: "left" }}
    />
  );
}
