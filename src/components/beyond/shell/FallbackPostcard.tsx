"use client";

import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { BeyondAlbumItem } from "@/types";
import { roomStore, useRoomState } from "../room/roomStore";
import styles from "./FallbackPostcard.module.css";

interface FallbackPostcardProps {
  items: BeyondAlbumItem[];
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function FallbackPostcard({ items, triggerRef }: FallbackPostcardProps) {
  const room = useRoomState();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedId = room.focus?.type === "moment" ? room.focus.id : null;
  const item = items.find((candidate) => candidate.id === selectedId) ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus({ preventScroll: true });
    } else if (!item && dialog.open) {
      dialog.close();
    }
  }, [item]);

  const handleClose = () => {
    if (roomStore.get().focus?.type === "moment") {
      roomStore.set({ focus: null });
    }
    requestAnimationFrame(() => {
      if (triggerRef.current?.isConnected) {
        triggerRef.current.focus({ preventScroll: true });
      }
    });
  };

  if (!item) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="fallback-postcard-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }
      }}
    >
      <div className={styles.card}>
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.close}
          aria-label="Close moment"
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
        <div className={styles.media} data-color={item.color}>
          {item.image?.src ? (
            <Image
              src={item.image.src}
              alt={item.image.alt}
              width={960}
              height={640}
              sizes="(max-width: 700px) 90vw, 42rem"
            />
          ) : item.quote ? (
            <blockquote>{item.quote}</blockquote>
          ) : (
            <span>{item.kind}</span>
          )}
        </div>
        <div className={styles.copy}>
          <p className={styles.kind}>{item.kind}</p>
          <h2 id="fallback-postcard-title">{item.title}</h2>
          <p>{item.caption}</p>
          {item.meta ? <p className={styles.meta}>{item.meta}</p> : null}
        </div>
      </div>
    </dialog>,
    document.body
  );
}
