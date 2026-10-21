import { cn } from "@/lib/utils";
import StackIcon from "./StackIcon";
import type { StackIconName } from "./icons";
import styles from "./StackStrip.module.css";

// =============================================================================
// StackStrip — a row of print-style chips (icon + mono label).
// Static by design: hairline border, no shadow, no hover.
// `paper` sits on a paper stock; `panel` sits inside a black-cherry .spec-sheet.
// =============================================================================

export interface StackStripItem {
  name: StackIconName;
  label: string;
}

interface StackStripProps {
  items: StackStripItem[];
  tone?: "paper" | "panel";
  className?: string;
}

export default function StackStrip({
  items,
  tone = "paper",
  className,
}: StackStripProps) {
  return (
    <ul
      data-stack-strip="true"
      className={cn(
        styles.strip,
        tone === "panel" ? styles.panel : styles.paper,
        className
      )}
    >
      {items.map((item) => (
        <li key={`${item.name}:${item.label}`} className={styles.chip}>
          <StackIcon name={item.name} size={16} className={styles.icon} />
          <span className={styles.label}>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
