"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MinimalChrome.module.css";

export default function MinimalChrome() {
  const pathname = usePathname();
  const isLanding = pathname === "/beyond-terminal";
  const isArticle = pathname.startsWith("/beyond-terminal/journal/");
  const routeLabel = isLanding
    ? "Landing route"
    : isArticle
      ? "Journal article"
      : "Field notes archive";
  const returnHref = isArticle ? "/beyond-terminal/journal" : "/";
  const returnLabel = isArticle ? "Journal" : "Home";

  return (
    <header className={styles.chrome}>
      <div className={styles.inner}>
        <Link href="/beyond-terminal" className={styles.brand} aria-label="Beyond The Terminal home">
          <span className={styles.markWrap} aria-hidden="true">
            <Image
              src="/beyond-terminal/symbol-mark.svg"
              alt=""
              width={26}
              height={26}
              className={styles.mark}
            />
          </span>
          <span className={styles.brandCopy}>
            <span className={styles.brandEyebrow}>Beyond The Terminal</span>
            <span className={styles.brandTitle}>Pastel grid journal</span>
          </span>
        </Link>

        <span className={styles.routeLabel}>{routeLabel}</span>

        <div className={styles.actions}>
          <Link href={returnHref} className={styles.actionPrimary}>
            {returnLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
