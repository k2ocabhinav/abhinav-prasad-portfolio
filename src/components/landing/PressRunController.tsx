import styles from "./PressRunController.module.css";

interface CropMarkProps {
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}

function CropMark({ corner }: CropMarkProps) {
  return (
    <svg
      className={`${styles.cropMark} ${styles[corner]}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-pressrun-crop-mark="true"
    >
      <path d="M23 1H1v22" />
    </svg>
  );
}

// Static hero frame: four crop marks that draw in once on load (CSS only, so it
// needs no client JavaScript) and a plain scroll link to What I do.
export default function PressRunController() {
  return (
    <>
      <div className={styles.scene} data-pressrun-scene="true" aria-hidden="true">
        <div className={styles.cropMarks}>
          <CropMark corner="topLeft" />
          <CropMark corner="topRight" />
          <CropMark corner="bottomLeft" />
          <CropMark corner="bottomRight" />
        </div>
      </div>
      <a
        className={styles.calibrationStrip}
        href="#about"
        aria-label="Scroll to What I do"
        data-pressrun-strip="true"
      >
        <span className={styles.scrollCue}>
          What I do <span aria-hidden="true">↓</span>
        </span>
      </a>
    </>
  );
}
