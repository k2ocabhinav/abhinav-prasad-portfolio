import type { SectionTone, StackGroup } from "@/types";
import StackStrip, {
  type StackStripItem,
} from "@/components/art/stack-icons/StackStrip";
import type { StackIconName } from "@/components/art/stack-icons/icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import styles from "./TechStackSection.module.css";

interface TechStackSectionProps {
  techCategories: StackGroup[];
  stackItems: string[];
  tone?: SectionTone;
}

const STACK_ICON_BY_LABEL: Record<string, StackIconName> = {
  java: "java",
  spring: "spring",
  postgresql: "postgresql",
  python: "python",
  typescript: "typescript",
  react: "react",
  "next.js": "nextjs",
  aws: "aws",
  docker: "docker",
  agents: "agents",
};

export default function TechStackSection({
  techCategories,
  stackItems,
  tone,
}: TechStackSectionProps) {
  if (techCategories.length === 0) {
    return null;
  }
  const highlightedCategories = techCategories.filter((category) => category.highlighted);

  const iconItems: StackStripItem[] = stackItems.map((label) => ({
    name: STACK_ICON_BY_LABEL[label.toLowerCase()] ?? "api",
    label,
  }));
  return (
    <SectionWrapper id="stack" tone={tone} className={styles.stackSection}>
      <div className={styles.header}>
        <div className={styles.headingBlock}>
          <h2 className={styles.heading}>Stack</h2>
          <p className={styles.callout}>Tools grouped by where I use them.</p>
        </div>
        <StackStrip items={iconItems} className={styles.iconStrip} />
      </div>

      <ul className={styles.focusList}>
        {highlightedCategories.map((group) => (
          <li key={group.id}>
            <span className={styles.groupLabel}>{group.label}</span>
            <span className={styles.context}>{group.context}</span>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
