import SectionWrapper from "@/components/ui/SectionWrapper";
import type { OrchestrationContent } from "@/types";
import styles from "./OrchestrationSection.module.css";

interface OrchestrationSectionProps {
  content: OrchestrationContent;
}

export default function OrchestrationSection({ content }: OrchestrationSectionProps) {
  return (
    <SectionWrapper
      id="orchestration"
      tone="pastel-blue"
      className={styles.orchestrationSection}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="orchestration-title" className={styles.heading}>
            How I orchestrate AI agents
          </h2>
          <p className={styles.intro}>{content.intro}</p>
        </header>

        <div className={styles.panel}>
          <p className={styles.method}>{content.method}</p>

          <div className={styles.evidence}>
            <h3 className={styles.evidenceHeading}>{content.metricsContext}</h3>
            <ul className={styles.metrics}>
              {content.metrics.map((metric) => (
                <li className={styles.metric} key={metric.label}>
                  <span className={styles.metricValue}>{metric.value}</span>
                  <span className={styles.metricLabel}>{metric.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.lesson}>{content.lesson}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}
