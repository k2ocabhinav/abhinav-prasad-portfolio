import type { OrchestrationContent, Project, SectionTone } from "@/types";
import SectionWrapper from "@/components/ui/SectionWrapper";
import WorkReel from "@/components/sections/work/WorkReel";
import WorkMethod from "@/components/sections/work/WorkMethod";
import styles from "./WorksSection.module.css";

interface WorksSectionProps {
  projects: Project[];
  orchestration: OrchestrationContent;
  tone?: SectionTone;
}

export default function WorksSection({
  projects,
  orchestration,
  tone,
}: WorksSectionProps) {
  if (projects.length === 0) return null;

  return (
    <SectionWrapper id="work" tone={tone} className={styles.worksSection}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.heading}>Selected projects</h2>
        <p className={styles.callout}>
          Dispatch prototype, publishing platform, and the method behind both.
        </p>
      </header>

      <WorkReel projects={projects} />
      <WorkMethod content={orchestration} />
    </SectionWrapper>
  );
}
