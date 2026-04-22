import styles from "./PullQuote.module.css";

interface PullQuoteProps {
  quote: string;
  attribution: string;
  context?: string;
}

export default function PullQuote({
  quote,
  attribution,
  context,
}: PullQuoteProps) {
  return (
    <blockquote className={styles.quote}>
      <p className={styles.copy}>{quote}</p>
      <footer className={styles.meta}>
        <span>{attribution}</span>
        {context ? <span>{context}</span> : null}
      </footer>
    </blockquote>
  );
}
