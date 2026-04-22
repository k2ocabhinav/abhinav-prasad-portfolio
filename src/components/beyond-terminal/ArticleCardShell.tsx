import type { ReactNode } from "react";
import { formatBeyondDate } from "@/lib/beyondTerminal";
import type { BeyondPostMeta } from "@/types";
import EditorialMediaFrame from "./EditorialMediaFrame";
import styles from "./ArticleCardShell.module.css";

interface ArticleCardShellProps {
  post: BeyondPostMeta;
  children: ReactNode;
}

export default function ArticleCardShell({
  post,
  children,
}: ArticleCardShellProps) {
  return (
    <section className={styles.shell}>
      <article className={styles.paper}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <span>{formatBeyondDate(post.publishedAt)}</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <EditorialMediaFrame media={post.cover} tone="paper" className={styles.cover} />
        </header>

        <div className={styles.prose}>{children}</div>
      </article>
    </section>
  );
}
