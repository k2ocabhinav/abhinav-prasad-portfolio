"use client";

import DispatchTicket, { type DispatchTicketState } from "./DispatchTicket";
import type { DispatchLane as DispatchLaneData } from "@/data/dispatchBoard";
import styles from "./DispatchLane.module.css";

// =============================================================================
// DispatchLane — one column of the dispatch board.
//
// A lane owns its ink: the column rule, each slip's edge and the progress bar
// all read the same lane colour, so the board reads as four presses of one
// ledger rather than four unrelated lists.
// =============================================================================

interface DispatchLaneProps {
  lane: DispatchLaneData;
  /** Flat sequence index of this lane's first slip. */
  startIndex: number;
  /** Flat sequence index of the slip in flight (total = every slip landed). */
  activeIndex: number;
  onSelect: (index: number) => void;
  onNavigate: (index: number, delta: number) => void;
  registerTicket: (index: number, node: HTMLButtonElement | null) => void;
}

export default function DispatchLane({
  lane,
  startIndex,
  activeIndex,
  onSelect,
  onNavigate,
  registerTicket,
}: DispatchLaneProps) {
  const count = lane.tickets.length;
  const landed = Math.min(Math.max(activeIndex - startIndex, 0), count);
  const progress = count === 0 ? 0 : landed / count;

  return (
    <li className={styles.lane} data-ink={lane.ink} data-lane={lane.id}>
      <div className={styles.head}>
        <span className={styles.label}>{lane.label}</span>
        <span className={styles.rule} aria-hidden="true">
          <span className={styles.ruleFill} style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>

      <ol className={styles.tickets}>
        {lane.tickets.map((ticket, offset) => {
          const index = startIndex + offset;
          const state: DispatchTicketState =
            index < activeIndex ? "landed" : index === activeIndex ? "inflight" : "queued";

          return (
            <DispatchTicket
              key={ticket.id}
              ticket={ticket}
              order={index + 1}
              state={state}
              onSelect={() => onSelect(index)}
              onNavigate={(delta) => onNavigate(index, delta)}
              buttonRef={(node) => registerTicket(index, node)}
            />
          );
        })}
      </ol>
    </li>
  );
}
