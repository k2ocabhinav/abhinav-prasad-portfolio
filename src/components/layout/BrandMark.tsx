"use client";

import { useSectionState } from "@/lib/sectionStore";
import styles from "./BrandMark.module.css";

export default function BrandMark() {
  const { navMode } = useSectionState();
  const isVisible = navMode === "glass";

  return (
    <a
      href="#hero"
      aria-label="Abhinav, back to top"
      data-site-chrome="brand"
      data-visible={isVisible ? "true" : "false"}
      className={styles.brandMark}
      inert={!isVisible}
    >
      <span className={styles.initial} aria-hidden="true">
        A
      </span>
      <span className={styles.name}>Abhinav</span>
    </a>
  );
}
