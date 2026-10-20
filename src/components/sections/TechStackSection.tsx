import type { SectionTone, StackContext, StackGroup } from "@/types";
import type { StackIconName } from "@/components/art/stack-icons/icons";
import StackIcon from "@/components/art/stack-icons/StackIcon";
import RevealText from "@/components/motion/RevealText";
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

const EVIDENCE_ORDER: readonly StackContext[] = [
  "Part of my workflow",
  "Built in projects",
  "Used at work",
];

export default function TechStackSection({
  techCategories,
  stackItems,
  tone,
}: TechStackSectionProps) {
  if (techCategories.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="stack" tone={tone} className={styles.stackSection}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Stack</h2>
        <p className={styles.callout}>Tools grouped by where I use them.</p>
      </div>

      <ul className={styles.chipStrip} aria-label="Tools I use">
        {stackItems.map((label) => (
          <li key={label} className={styles.chip}>
            <StackIcon
              name={STACK_ICON_BY_LABEL[label.toLowerCase()] ?? "api"}
              size={16}
              className={styles.chipIcon}
            />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.evidence} data-stack-evidence="true">
        {EVIDENCE_ORDER.map((context) => {
          const groups = techCategories.filter(
            (group) => group.context === context
          );

          return (
            <div key={context} className={styles.evidenceColumn}>
              <RevealText
                as="h3"
                text={context}
                className={styles.evidenceHeading}
              />
              <ul className={styles.evidenceList}>
                {groups.map((group) => (
                  <li key={group.id} className={styles.evidenceItem}>
                    {group.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
