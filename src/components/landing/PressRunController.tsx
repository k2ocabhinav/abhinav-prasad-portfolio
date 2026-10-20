import styles from "./PressRunController.module.css";

// The line gives a quiet direction cue while the hero is in view.
export default function PressRunController() {
  return (
    <a
      className={styles.scrollLink}
      href="#about"
      aria-label="Scroll to What I do"
      data-pressrun-strip="true"
    >
      <span className={styles.scrollCue}>Scroll</span>
      <span className={styles.scrollLine} aria-hidden="true" />
    </a>
  );
}
