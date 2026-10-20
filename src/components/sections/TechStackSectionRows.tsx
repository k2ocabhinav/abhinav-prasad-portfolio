"use client";

import * as m from "motion/react-m";
import { useRef } from "react";
import { useReducedMotion, useScroll, useTransform } from "motion/react";
import StackIcon from "@/components/art/stack-icons/StackIcon";
import type { StackIconName } from "@/components/art/stack-icons/icons";
import styles from "./TechStackSectionRows.module.css";

export interface StackRowItem {
  name: StackIconName;
  label: string;
}

interface TechStackRowsProps {
  items: StackRowItem[];
}

/** Copies per row keep the track longer than the widest viewport. */
const COPIES = 3;

function renderTrack(items: StackRowItem[], row: string) {
  return Array.from({ length: COPIES }, (_, copy) => (
    <ul
      key={`${row}-${copy}`}
      className={styles.track}
      data-copy={copy}
    >
      {items.map((item) => (
        <li key={`${item.name}:${item.label}`} className={styles.chip}>
          <StackIcon name={item.name} size={16} className={styles.icon} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  ));
}

// The two rows ride the section transit in opposite directions. Only the row
// transforms are scrubbed; there is no per-frame React state. The visible
// chips are decorative motion, so the accessible tool list lives in the
// section itself.
export default function TechStackRows({ items }: TechStackRowsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const leftX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["-18%", "-6%"]);

  return (
    <div ref={ref} className={styles.rows} aria-hidden="true">
      <m.div
        className={styles.row}
        data-stack-row="left"
        style={{ x: reduceMotion ? 0 : leftX }}
      >
        {renderTrack(items, "left")}
      </m.div>
      <m.div
        className={styles.row}
        data-stack-row="right"
        style={{ x: reduceMotion ? "-6%" : rightX }}
      >
        {renderTrack(items, "right")}
      </m.div>
    </div>
  );
}
