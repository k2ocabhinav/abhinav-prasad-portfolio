"use client";

import type { RefObject } from "react";
import type { BeyondAlbumItem } from "@/types";
import { roomStore } from "../roomStore";
import { requestMomentFocus } from "./events";
import styles from "./MomentOverlays.module.css";

export default function MomentList({
  items,
  expanded,
  onToggle,
  onBodyFocus,
  onBodyBlur,
  listRef,
  showToggle = true,
}: {
  items: BeyondAlbumItem[];
  expanded: boolean;
  onToggle: () => void;
  onBodyFocus: () => void;
  onBodyBlur: (relatedTarget: EventTarget | null, currentTarget: HTMLDivElement) => void;
  listRef?: RefObject<HTMLElement | null>;
  showToggle?: boolean;
}) {
  return (
    <section
      ref={listRef}
      id="beyond-moments-list"
      className={`${styles.listSection} ${expanded ? styles.listExpanded : ""}`}
      aria-label="Everything in the room"
      tabIndex={-1}
      data-moments-list
    >
      {showToggle ? (
        <button
          className={styles.listToggle}
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          Everything in the room
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
      ) : null}
      <div
        className={styles.listBody}
        onFocusCapture={onBodyFocus}
        onBlurCapture={(event) => onBodyBlur(event.relatedTarget, event.currentTarget)}
      >
        <div className={styles.listHeading}>
          <h2 className={styles.listTitle}>Everything in the room</h2>
          <button className={styles.listClose} type="button" onClick={onToggle}>
            Close list
          </button>
        </div>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.listItem}
                aria-label={`Open ${item.title}`}
                onFocus={() => requestMomentFocus(item.id)}
                onClick={() => roomStore.set({ focus: { type: "moment", id: item.id } })}
              >
                <span className={styles.itemKind}>{item.kind}</span>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemArrow} aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
