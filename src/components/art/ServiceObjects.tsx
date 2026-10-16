import styles from "./ServiceObjects.module.css";

export type ServiceObjectVariant = "ledger" | "stamp" | "orchestration";

interface ServiceObjectsProps {
  variant: ServiceObjectVariant;
}

export default function ServiceObjects({ variant }: ServiceObjectsProps) {
  return (
    <svg
      className={styles.object}
      viewBox="0 0 72 72"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 8h60v56H6z" fill="var(--plate-paper)" stroke="var(--plate-ink)" strokeWidth="2" />
      {variant === "ledger" ? (
        <>
          <path d="M6 20h60M24 20v44M45 20v44" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
          <path d="M13 29h5m12 0h12m-29 9h5m12 0h12m-29 9h5m12 0h12m-29 9h5m12 0h12" fill="none" stroke="var(--plate-accent)" strokeWidth="3" strokeLinecap="square" />
          <path d="M13 14h4m5 0h4m5 0h4m5 0h4" fill="none" stroke="var(--plate-second)" strokeWidth="2" />
        </>
      ) : null}
      {variant === "stamp" ? (
        <>
          <path d="M36 16c-7 0-12 5-12 12 0 4 2 7 5 9l-7 9h28l-7-9c3-2 5-5 5-9 0-7-5-12-12-12Z" fill="var(--plate-second)" stroke="var(--plate-ink)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 48h42v10H15z" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="2" />
          <path d="m27 53 6 5 12-13" fill="none" stroke="var(--plate-paper)" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        </>
      ) : null}
      {variant === "orchestration" ? (
        <>
          <path d="M20 23h25M20 23v26h25M45 23v13m0 13h10m-10 0v10" fill="none" stroke="var(--plate-ink)" strokeWidth="2" />
          <circle cx="19" cy="23" r="6" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="2" />
          <circle cx="46" cy="23" r="6" fill="var(--plate-second)" stroke="var(--plate-ink)" strokeWidth="2" />
          <circle cx="46" cy="49" r="6" fill="var(--plate-accent)" stroke="var(--plate-ink)" strokeWidth="2" />
          <circle cx="56" cy="49" r="6" fill="var(--plate-second)" stroke="var(--plate-ink)" strokeWidth="2" />
          <path d="M46 36h11" fill="none" stroke="var(--plate-ink)" strokeWidth="2" strokeDasharray="2 3" />
        </>
      ) : null}
      <path d="M2 14V2h12m44 0h12v12M2 58v12h12m44 0h12V58" fill="none" stroke="var(--plate-accent)" strokeWidth="2" />
    </svg>
  );
}
