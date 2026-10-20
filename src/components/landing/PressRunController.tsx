import styles from "./PressRunController.module.css";

// The line gives a quiet direction cue while the hero is in view.
export default function PressRunController() {
  return (
    <a
      className={styles.scrollLink}
      href="#about"
      aria-label="What I do"
      data-hero-scroll-cue="true"
    >
      <span>What I do</span>
      <span className={styles.scrollArrow} aria-hidden="true">↓</span>
    </a>
  );
}
