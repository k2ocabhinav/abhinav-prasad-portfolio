import styles from "./MakersMark.module.css";

export default function MakersMark() {
  return (
    <div
      className={styles.mark}
      aria-hidden="true"
      data-hero-layer="maker"
      data-hero-maker="true"
    >
      <span className={`${styles.layer} ${styles.face}`}>
        <span className={styles.innerFrame} />
      </span>
      <span className={`${styles.layer} ${styles.bite}`}>
        AP<span className={styles.innerFrame} />
      </span>
      <span className={`${styles.layer} ${styles.lift}`}>
        AP<span className={styles.innerFrame} />
      </span>
    </div>
  );
}
