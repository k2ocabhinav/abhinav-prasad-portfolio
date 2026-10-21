import type { Metadata } from "next";
import styles from "./not-found.module.css";

/* eslint-disable @next/next/no-html-link-for-pages -- Native 404 links avoid shipping next/link on every route. */

export const metadata: Metadata = {
  title: "Page not found | Abhinav Prasad",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>404 / Page not found</p>
      <a href="/" className={styles.wordmark} aria-label="Abhinav Prasad, home">
        Abhinav
      </a>
      <h1 className={styles.heading}>This page could not be found.</h1>
      <nav className={styles.links} aria-label="Page navigation">
        <a href="/">Home</a>
        <a href="/#work">Selected work</a>
      </nav>
    </main>
  );
}
