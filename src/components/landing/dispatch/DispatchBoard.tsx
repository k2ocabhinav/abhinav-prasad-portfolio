"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DispatchLane from "./DispatchLane";
import DispatchLedgerPlate from "@/components/art/DispatchLedgerPlate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { dispatchLanes, type DispatchTicket } from "@/data/dispatchBoard";
import styles from "./DispatchBoard.module.css";

// =============================================================================
// DispatchBoard — the hero's proof of method.
//
// Four lanes and every slip are painted on the first frame, so the board is
// readable without a single interaction. It then plays one slip at a time, at
// most twice, and parks complete. Any pointer, touch or keyboard interaction
// stops the timer for good. Reduced motion renders the complete board and
// never starts the timer.
// =============================================================================

const STEP_MS = 1800;
const MAX_PASSES = 2;

interface FlatTicket extends DispatchTicket {
  laneId: string;
  laneLabel: string;
}

const flatTickets: FlatTicket[] = dispatchLanes.flatMap((lane) =>
  lane.tickets.map((ticket) => ({ ...ticket, laneId: lane.id, laneLabel: lane.label }))
);

const total = flatTickets.length;

const laneStartIndexes = dispatchLanes.map((_, laneIndex) =>
  dispatchLanes.slice(0, laneIndex).reduce((sum, lane) => sum + lane.tickets.length, 0)
);

const formatStep = (value: number) => String(value).padStart(2, "0");

export default function DispatchBoard() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [autoplay, setAutoplay] = useState(true);
  const [interacted, setInteracted] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLElement | null>(null);
  const ticketRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stepsRef = useRef(0);

  // Reduced motion parks the board complete. A user selection still overrides
  // it, so the slips stay operable with no motion at all.
  const shownIndex = prefersReducedMotion && !interacted ? total : activeIndex;
  const detailIndex = Math.min(shownIndex, total - 1);
  const detail = flatTickets[detailIndex];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !autoplay || !inView) {
      return;
    }

    const timer = window.setInterval(() => {
      stepsRef.current += 1;
      if (stepsRef.current >= (total + 1) * MAX_PASSES) {
        setActiveIndex(total);
        setAutoplay(false);
        return;
      }
      setActiveIndex((current) => (current >= total ? 0 : current + 1));
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [autoplay, inView, prefersReducedMotion]);

  const handleSelect = useCallback((index: number) => {
    const ticket = flatTickets[index];
    setAutoplay(false);
    setInteracted(true);
    setActiveIndex(index);
    setAnnouncement(
      `${ticket.laneLabel}, step ${index + 1} of ${total}. ${ticket.title}. ${ticket.note}`
    );
  }, []);

  const handleNavigate = useCallback((index: number, delta: number) => {
    const next = Math.max(0, Math.min(total - 1, index + delta));
    ticketRefs.current[next]?.focus();
  }, []);

  const registerTicket = useCallback((index: number, node: HTMLButtonElement | null) => {
    ticketRefs.current[index] = node;
  }, []);

  return (
    <section
      ref={rootRef}
      className={styles.board}
      aria-label="Dispatch board"
      data-dispatch-board="true"
    >
      <header className={styles.header}>
        <span className={styles.stamp} aria-hidden="true">
          <DispatchLedgerPlate />
        </span>
        <p className={styles.caption}>Every change moves through four lanes.</p>
        <p className={styles.readout} aria-hidden="true">
          <span className={styles.readoutStrong}>{formatStep(detailIndex + 1)}</span>
          <span className={styles.readoutSlash} aria-hidden="true">/</span>
          <span>{formatStep(total)}</span>
        </p>
      </header>

      <ol className={styles.lanes}>
        {dispatchLanes.map((lane, laneIndex) => (
          <DispatchLane
            key={lane.id}
            lane={lane}
            startIndex={laneStartIndexes[laneIndex]}
            activeIndex={shownIndex}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
            registerTicket={registerTicket}
          />
        ))}
      </ol>

      <footer className={styles.detail} data-ink={detail.laneId}>
        <span className={styles.detailStub} aria-hidden="true">
          {formatStep(detailIndex + 1)}
        </span>
        <p className={styles.detailText}>{detail.note}</p>
      </footer>

      <p className={styles.status} role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
