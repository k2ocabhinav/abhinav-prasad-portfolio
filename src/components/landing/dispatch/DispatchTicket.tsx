"use client";

import type { KeyboardEvent } from "react";
import type { DispatchTicket as DispatchTicketData } from "@/data/dispatchBoard";
import styles from "./DispatchTicket.module.css";

// =============================================================================
// DispatchTicket — a single slip inside a lane.
//
// A slip carries only its stub number and its step name, so every lane stays
// legible at column width. The longer explanation lives in the board footer.
// The slip is a real button: pointer, touch and keyboard all select it, and
// the arrow keys walk the flat sequence. State changes only vary colour and a
// 0-blur print offset, so selecting never shifts layout.
// =============================================================================

export type DispatchTicketState = "queued" | "inflight" | "landed";

interface DispatchTicketProps {
  ticket: DispatchTicketData;
  /** 1-based position in the flat sequence, printed as the slip stub. */
  order: number;
  state: DispatchTicketState;
  onSelect: () => void;
  onNavigate: (delta: number) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}

const NAV_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export default function DispatchTicket({
  ticket,
  order,
  state,
  onSelect,
  onNavigate,
  buttonRef,
}: DispatchTicketProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = NAV_KEYS[event.key];
    if (delta === undefined) {
      return;
    }
    event.preventDefault();
    onNavigate(delta);
  };

  return (
    <li className={styles.slip} data-state={state}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        data-dispatch-ticket={ticket.id}
        aria-pressed={state === "inflight"}
        onClick={onSelect}
        onFocus={onSelect}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.stub} aria-hidden="true">
          {String(order).padStart(2, "0")}
        </span>
        <span className={styles.title}>{ticket.title}</span>
      </button>
    </li>
  );
}
