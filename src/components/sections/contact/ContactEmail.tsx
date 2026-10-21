"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ContactEmail.module.css";

interface ContactEmailProps {
  email: string;
}

export default function ContactEmail({ email }: ContactEmailProps) {
  const addressRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  async function copyEmail() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCopied(false);

    try {
      if (!navigator.clipboard?.writeText) {
        selectAddress();
        return;
      }
      await navigator.clipboard.writeText(email);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 1600);
    } catch {
      selectAddress();
    }
  }

  function selectAddress() {
    const address = addressRef.current;
    if (!address) return;

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(address);
    selection?.removeAllRanges();
    selection?.addRange(range);
    address.focus();
  }

  return (
    <div className={styles.emailRow}>
      <a
        ref={addressRef}
        href={`mailto:${email}`}
        className={styles.emailLink}
        data-contact-email="true"
        aria-label={email}
      >
        {email}
      </a>
      <button
        type="button"
        className={styles.copyButton}
        onClick={copyEmail}
        data-copy-email="true"
        aria-label={copied ? "Email copied" : "Copy email address"}
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
