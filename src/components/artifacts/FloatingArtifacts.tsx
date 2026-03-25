import { THEMES, activeThemeId, ArtifactDef } from "@/data/themes";
import Artifact from "./Artifact";
import styles from "./FloatingArtifacts.module.css";

// Theme switching: change activeThemeId in src/data/themes.ts to switch themes

export default function FloatingArtifacts() {
  const activeTheme = THEMES.find((t) => t.id === activeThemeId);

  if (!activeTheme) {
    return null;
  }

  return (
    <div className={styles.floatingArtifactsContainer}>
      {activeTheme.artifacts.map((artifact: ArtifactDef) => (
        <Artifact key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
}
