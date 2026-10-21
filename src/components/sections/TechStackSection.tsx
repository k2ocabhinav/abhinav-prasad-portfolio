import type { SectionTone, StackGroup } from "@/types";
import StackIcon from "@/components/art/stack-icons/StackIcon";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { StackReveal, StackRevealItem } from "./TechStackReveal";
import styles from "./TechStackSection.module.css";

interface TechStackSectionProps {
  techCategories: StackGroup[];
  tone?: SectionTone;
}

export default function TechStackSection({
  techCategories,
  tone,
}: TechStackSectionProps) {
  if (techCategories.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="stack" tone={tone} className={styles.stackSection}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Stack</h2>
        <p className={styles.intro} data-stack-intro="true">
          Tools I use across work, my own builds and my AI-agent workflow.
        </p>
      </div>

      <StackReveal className={styles.grid}>
        {techCategories.map((group) => (
          <StackRevealItem
            key={group.id}
            className={styles.item}
            featured={group.featured}
          >
            <article
              className={styles.card}
              data-tone={group.tone}
              data-stack-group={group.id}
              aria-labelledby={`stack-${group.id}`}
            >
              <div className={styles.cardHead}>
                <p className={styles.context}>{group.context}</p>
                <h3 id={`stack-${group.id}`} className={styles.groupName}>
                  {group.label}
                </h3>
                {group.summary ? (
                  <p className={styles.summary}>{group.summary}</p>
                ) : null}
              </div>
              <ul className={styles.chips} data-stack-chips="true">
                {group.skills.map((skill) => (
                  <li key={skill.label} className={styles.chip}>
                    <StackIcon
                      name={skill.icon}
                      size={20}
                      className={styles.icon}
                    />
                    <span>{skill.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          </StackRevealItem>
        ))}
      </StackReveal>
    </SectionWrapper>
  );
}
